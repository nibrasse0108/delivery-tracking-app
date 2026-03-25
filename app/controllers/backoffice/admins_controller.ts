import User from '#models/user'
import AdminCredentialsNotification from '#mails/admin_credentials_notification'
import { createAdminValidator } from '#validators/admin'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import logger from '@adonisjs/core/services/logger'
import { randomBytes } from 'node:crypto'

export default class AdminsController {
  async index({ view }: HttpContext) {
    const admins = await User.query().where('role', 'admin').orderBy('created_at', 'desc')
    return view.render('backoffice/admins/index', { admins })
  }

  async create({ view }: HttpContext) {
    return view.render('backoffice/admins/create')
  }

  async store({ request, session, response }: HttpContext) {
    const data = await request.validateUsing(createAdminValidator)

    const existing = await User.findBy('email', data.email)
    if (existing) {
      session.flash('errors.email', 'Cette adresse e-mail est déjà utilisée.')
      session.flashAll()
      return response.redirect().back()
    }

    const plainPassword = randomBytes(10).toString('base64url').slice(0, 12) + '#1'

    const admin = await User.create({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: plainPassword,
      role: 'admin',
    })

    void (async () => {
      try {
        await mail.use('resend').send(new AdminCredentialsNotification(admin, plainPassword))
      } catch (resendError) {
        logger.warn({ error: resendError }, 'Resend a échoué, tentative via SMTP')
        try {
          await mail.use('smtp').send(new AdminCredentialsNotification(admin, plainPassword))
        } catch (smtpError) {
          logger.error({ error: smtpError }, "Échec de l'envoi des identifiants admin")
        }
      }
    })()

    session.flash('success', `Le compte de ${data.fullName} a été créé. Ses identifiants lui ont été envoyés par e-mail.`)
    return response.redirect().toRoute('backoffice.admins.index')
  }

  async toggle({ params, auth, session, response }: HttpContext) {
    const admin = await User.findOrFail(params.id)

    if (admin.id === auth.user!.id) {
      session.flash('error', 'Vous ne pouvez pas modifier votre propre statut.')
      return response.redirect().back()
    }

    if (admin.role !== 'admin') {
      session.flash('error', 'Action non autorisée.')
      return response.redirect().back()
    }

    admin.isActive = !admin.isActive
    await admin.save()

    const label = admin.isActive ? 'activé' : 'désactivé'
    session.flash('success', `Le compte de ${admin.fullName ?? admin.email} a été ${label}.`)
    return response.redirect().toRoute('backoffice.admins.index')
  }

  async destroy({ params, auth, session, response }: HttpContext) {
    const admin = await User.findOrFail(params.id)

    if (admin.id === auth.user!.id) {
      session.flash('error', 'Vous ne pouvez pas supprimer votre propre compte.')
      return response.redirect().back()
    }

    if (admin.role !== 'admin') {
      session.flash('error', 'Action non autorisée.')
      return response.redirect().back()
    }

    const name = admin.fullName ?? admin.email
    await admin.delete()

    session.flash('success', `Le compte de ${name} a été supprimé.`)
    return response.redirect().toRoute('backoffice.admins.index')
  }
}
