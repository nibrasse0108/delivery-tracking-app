import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'
import app from '@adonisjs/core/services/app'
import QRCode from 'qrcode'
import env from '#start/env'
import Package, { STATUS_LABELS, STATUS_ORDER } from '#models/package'
import { buildPageRange } from '#helpers/pagination'

const PER_PAGE = 20
import PackageLog from '#models/package_log'
import Client from '#models/client'
import {
  createPackageValidator,
  updatePackageValidator,
  advanceStatusValidator,
  recordPaymentValidator,
} from '#validators/package'
import PackageReceiptNotification from '#mails/package_receipt_notification'
import WhatsAppService from '#services/whatsapp_service'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Espèces',
  bank_transfer: 'Virement bancaire',
  mobile_money: 'Mobile Money',
}

const WHATSAPP_STATUS_MESSAGES: Partial<Record<string, (pkg: Package, receiptUrl: string) => string>> = {
  taken_over: (pkg, receiptUrl) =>
    `Bonjour ${pkg.client.firstName} 👋\n\n` +
    `Votre colis *${pkg.trackingNumber}* a été pris en charge par notre équipe.\n\n` +
    `📦 *${pkg.designation}*\n` +
    `📅 Livraison prévue le ${pkg.estimatedDeliveryDate.setLocale('fr').toFormat('dd MMM yyyy')}\n\n` +
    `🔍 Suivez votre colis :\n${receiptUrl}`,

  in_delivery: (pkg, receiptUrl) =>
    `Bonjour ${pkg.client.firstName} 👋\n\n` +
    `Bonne nouvelle ! Votre colis *${pkg.trackingNumber}* est en cours de livraison.\n\n` +
    `📦 *${pkg.designation}*\n\n` +
    `🔍 Suivez votre colis :\n${receiptUrl}`,

  available_at_agency: (pkg, receiptUrl) =>
    `Bonjour ${pkg.client.firstName} 👋\n\n` +
    `Votre colis *${pkg.trackingNumber}* est disponible à l'agence. Vous pouvez venir le récupérer dès maintenant.\n\n` +
    `📦 *${pkg.designation}*\n\n` +
    `🧾 Consultez votre reçu :\n${receiptUrl}`,

  withdrawn: (pkg) =>
    `Bonjour ${pkg.client.firstName} 👋\n\n` +
    `Votre colis *${pkg.trackingNumber}* a bien été récupéré. Merci de votre confiance ! 🙏`,
}

export default class PackagesController {
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '').trim()

    const query = Package.query().preload('client').orderBy('created_at', 'desc')
    if (search) {
      query.where((q) => {
        q.whereILike('tracking_number', `%${search}%`)
          .orWhereILike('designation', `%${search}%`)
          .orWhereHas('client', (clientQ) => {
            clientQ
              .whereILike('last_name', `%${search}%`)
              .orWhereILike('first_name', `%${search}%`)
          })
      })
    }

    const packages = await query.paginate(page, PER_PAGE)
    packages.baseUrl('/backoffice/packages')
    packages.queryString({ search })

    const pages = buildPageRange(packages.currentPage, packages.lastPage)
    return view.render('backoffice/packages/index', { packages, paginator: packages, search, pages })
  }

  async create({ view }: HttpContext) {
    const clients = await Client.query().orderBy('last_name', 'asc').orderBy('first_name', 'asc')
    return view.render('backoffice/packages/create', { clients })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const data = await request.validateUsing(createPackageValidator)

    let trackingNumber: string
    do {
      trackingNumber = 'KM' + randomBytes(4).toString('hex').toUpperCase()
    } while (await Package.findBy('tracking_number', trackingNumber))
    const receiptToken = randomBytes(16).toString('hex')

    // Photo optionnelle
    let photoPath: string | null = null
    const photo = request.file('photo', { size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] })
    if (photo) {
      if (!photo.isValid) {
        session.flash('error', photo.errors[0]?.message ?? 'Fichier invalide.')
        return response.redirect().back()
      }
      const fileName = `${trackingNumber}_${Date.now()}.${photo.extname}`
      await photo.move(app.publicPath('uploads/packages'), { name: fileName, overwrite: true })
      photoPath = `/uploads/packages/${fileName}`
    }

    const pkg = await Package.create({
      trackingNumber,
      receiptToken,
      clientId: data.clientId,
      designation: data.designation,
      description: data.description ?? null,
      weight: data.weight,
      price: data.price,
      estimatedDeliveryDate: DateTime.fromISO(data.estimatedDeliveryDate),
      status: 'pending',
      photoPath,
    })

    await PackageLog.create({
      packageId: pkg.id,
      userId: auth.user!.id,
      action: 'created',
      fromStatus: null,
      toStatus: 'pending',
    })

    await pkg.load('client')

    const receiptUrl = `${env.get('APP_URL')}/suivi/${pkg.receiptToken}`

    // Envoi email — non bloquant
    void (async () => {
      try {
        await mail.use('resend').send(new PackageReceiptNotification(pkg, receiptUrl))
      } catch (err) {
        logger.warn({ err }, 'Resend a échoué, tentative via SMTP')
        try {
          await mail.use('smtp').send(new PackageReceiptNotification(pkg, receiptUrl))
        } catch (smtpErr) {
          logger.error({ err: smtpErr }, "Échec de l'envoi de l'email de reçu")
        }
      }
    })()

    // Envoi WhatsApp — non bloquant
    void (async () => {
      try {
        const whatsapp = new WhatsAppService()
        const message =
          `Bonjour ${pkg.client.firstName} 👋\n\n` +
          `Votre colis *${pkg.trackingNumber}* a bien été enregistré chez Wapika.\n\n` +
          `📦 *${pkg.designation}*\n` +
          `⚖️ ${pkg.weight} kg\n` +
          `📅 Livraison prévue le ${pkg.estimatedDeliveryDate.setLocale('fr').toFormat('dd MMM yyyy')}\n` +
          `💰 Frais : ${pkg.price.toLocaleString('fr-FR')} KMF\n\n` +
          `🧾 Consultez votre reçu ici :\n${receiptUrl}`
        await whatsapp.send(pkg.client.phone, message)
      } catch (err) {
        logger.error({ err }, "Échec de l'envoi du message WhatsApp")
      }
    })()

    session.flash('success', `Colis ${trackingNumber} créé avec succès.`)
    return response.redirect().toRoute('backoffice.packages.index')
  }

  async receipt({ params, view, response }: HttpContext) {
    const pkg = await Package.query()
      .where('receipt_token', params.token)
      .preload('client')
      .first()

    if (!pkg) return response.redirect('/')

    const receiptUrl = `${env.get('APP_URL')}/suivi/${pkg.receiptToken}`
    const qrCode = await QRCode.toDataURL(receiptUrl, { width: 160, margin: 1 })

    return view.render('public/receipt', { pkg, qrCode })
  }

  async edit({ params, view }: HttpContext) {
    const pkg = await Package.query()
      .where('id', params.id)
      .preload('client')
      .preload('logs', (q) => q.preload('user').orderBy('created_at', 'asc'))
      .firstOrFail()
    const clients = await Client.query().orderBy('last_name', 'asc').orderBy('first_name', 'asc')
    const steps = STATUS_ORDER.map((status, index) => ({
      value: status,
      label: STATUS_LABELS[status],
      isDone: pkg.statusIndex > index,
      isCurrent: pkg.status === status,
      isFuture: pkg.statusIndex < index,
      isLast: index === STATUS_ORDER.length - 1,
    }))
    return view.render('backoffice/packages/edit', { package: pkg, clients, steps, statusLabels: STATUS_LABELS })
  }

  async update({ params, request, response, session }: HttpContext) {
    const pkg = await Package.findOrFail(params.id)

    if (pkg.status !== 'pending') {
      session.flash('error', "Les informations d'un colis en cours de traitement ne peuvent plus être modifiées.")
      return response.redirect().back()
    }

    const data = await request.validateUsing(updatePackageValidator)

    pkg.merge({
      clientId: data.clientId,
      designation: data.designation,
      description: data.description ?? null,
      weight: data.weight,
      price: data.price,
      estimatedDeliveryDate: DateTime.fromISO(data.estimatedDeliveryDate),
    })
    await pkg.save()

    session.flash('success', 'Colis mis à jour avec succès.')
    return response.redirect().toRoute('backoffice.packages.edit', { id: pkg.id })
  }

  async advanceStatus({ params, request, response, session, auth }: HttpContext) {
    const pkg = await Package.findOrFail(params.id)
    const data = await request.validateUsing(advanceStatusValidator)

    if (!pkg.isValidNextStatus(data.status)) {
      session.flash('error', 'Progression de statut invalide.')
      return response.redirect().back()
    }

    const fromStatus = pkg.status
    pkg.status = data.status
    if (data.status === 'withdrawn' && data.extraFees !== undefined && data.extraFees > 0) {
      pkg.extraFees = data.extraFees
      pkg.extraFeesReason = data.extraFeesReason ?? null
    }
    await pkg.save()

    await PackageLog.create({
      packageId: pkg.id,
      userId: auth.user!.id,
      action: 'status_changed',
      fromStatus,
      toStatus: data.status,
    })

    await pkg.load('client')
    const receiptUrl = `${env.get('APP_URL')}/suivi/${pkg.receiptToken}`

    // Notification WhatsApp — non bloquant
    void (async () => {
      try {
        const builder = WHATSAPP_STATUS_MESSAGES[data.status]
        if (builder) {
          const whatsapp = new WhatsAppService()
          await whatsapp.send(pkg.client.phone, builder(pkg, receiptUrl))
        }
      } catch (err) {
        logger.error({ err }, "Échec de l'envoi du message WhatsApp (changement de statut)")
      }
    })()

    session.flash('success', `Statut mis à jour : ${STATUS_LABELS[data.status]}`)
    return response.redirect().toRoute('backoffice.packages.edit', { id: pkg.id })
  }

  async recordPayment({ params, request, response, session, auth }: HttpContext) {
    const pkg = await Package.findOrFail(params.id)

    if (pkg.paymentStatus === 'paid') {
      session.flash('error', 'Ce colis est déjà marqué comme payé.')
      return response.redirect().back()
    }

    const data = await request.validateUsing(recordPaymentValidator)

    pkg.paymentStatus = 'paid'
    pkg.paymentMethod = data.paymentMethod
    pkg.paidAt = DateTime.now()
    await pkg.save()

    await PackageLog.create({
      packageId: pkg.id,
      userId: auth.user!.id,
      action: 'payment_recorded',
      fromStatus: null,
      toStatus: null,
    })

    session.flash('success', `Paiement enregistré (${PAYMENT_METHOD_LABELS[data.paymentMethod]}).`)
    return response.redirect().toRoute('backoffice.packages.edit', { id: pkg.id })
  }

  async uploadPhoto({ params, request, response, session, auth }: HttpContext) {
    const pkg = await Package.findOrFail(params.id)

    const photo = request.file('photo', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (!photo || !photo.isValid) {
      session.flash('error', photo?.errors[0]?.message ?? 'Fichier invalide.')
      return response.redirect().back()
    }

    const fileName = `${pkg.trackingNumber}_${Date.now()}.${photo.extname}`
    await photo.move(app.publicPath('uploads/packages'), { name: fileName, overwrite: true })

    pkg.photoPath = `/uploads/packages/${fileName}`
    await pkg.save()

    await PackageLog.create({
      packageId: pkg.id,
      userId: auth.user!.id,
      action: 'photo_uploaded',
      fromStatus: null,
      toStatus: null,
    })

    session.flash('success', 'Photo enregistrée.')
    return response.redirect().toRoute('backoffice.packages.edit', { id: pkg.id })
  }

  async destroy({ params, response, session }: HttpContext) {
    const pkg = await Package.findOrFail(params.id)

    if (!pkg.canDelete) {
      session.flash('error', 'Impossible de supprimer un colis dont le statut a évolué.')
      return response.redirect().back()
    }

    await pkg.delete()
    session.flash('success', 'Colis supprimé.')
    return response.redirect().toRoute('backoffice.packages.index')
  }
}
