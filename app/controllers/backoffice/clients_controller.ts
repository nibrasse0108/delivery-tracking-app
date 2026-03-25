import Client from '#models/client'
import { createClientValidator, updateClientValidator } from '#validators/client'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
  async index({ view }: HttpContext) {
    const clients = await Client.query().orderBy('created_at', 'desc')
    return view.render('backoffice/clients/index', { clients })
  }

  async create({ view }: HttpContext) {
    return view.render('backoffice/clients/create')
  }

  async store({ request, session, response }: HttpContext) {
    const data = await request.validateUsing(createClientValidator)

    if (data.email) {
      const existing = await Client.findBy('email', data.email)
      if (existing) {
        session.flash('errors.email', 'Cette adresse e-mail est déjà utilisée.')
        session.flashAll()
        return response.redirect().back()
      }
    }

    await Client.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email ?? null,
      phone: data.phone,
      address: data.address,
    })

    session.flash('success', `Le client ${data.firstName} ${data.lastName} a été ajouté.`)
    return response.redirect().toRoute('backoffice.clients.index')
  }

  async edit({ params, view }: HttpContext) {
    const client = await Client.findOrFail(params.id)
    return view.render('backoffice/clients/edit', { client })
  }

  async update({ params, request, session, response }: HttpContext) {
    const client = await Client.findOrFail(params.id)
    const data = await request.validateUsing(updateClientValidator)

    if (data.email && data.email !== client.email) {
      const existing = await Client.findBy('email', data.email)
      if (existing) {
        session.flash('errors.email', 'Cette adresse e-mail est déjà utilisée.')
        session.flashAll()
        return response.redirect().back()
      }
    }

    client.merge({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email ?? null,
      phone: data.phone,
      address: data.address,
    })
    await client.save()

    session.flash('success', `Le profil de ${client.fullName} a été mis à jour.`)
    return response.redirect().toRoute('backoffice.clients.index')
  }

  async destroy({ params, session, response }: HttpContext) {
    const client = await Client.findOrFail(params.id)
    const name = client.fullName
    await client.delete()

    session.flash('success', `Le client ${name} a été supprimé.`)
    return response.redirect().toRoute('backoffice.clients.index')
  }
}
