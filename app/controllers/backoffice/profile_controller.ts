import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { SimpleMessagesProvider } from '@vinejs/vine'
import { updateInfoValidator, updatePasswordValidator } from '#validators/profile'

const passwordMessages = new SimpleMessagesProvider({
  'currentPassword.minLength': 'Le mot de passe actuel est requis.',
  'newPassword.minLength': 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
  'confirmPassword.sameAs': 'Les mots de passe ne correspondent pas.',
  'required': 'Ce champ est requis.',
  'string': 'Ce champ est requis.',
})

export default class ProfileController {
  async show({ view }: HttpContext) {
    return view.render('backoffice/profile')
  }

  async updateInfo({ request, response, session, auth }: HttpContext) {
    const data = await request.validateUsing(updateInfoValidator)
    const user = auth.user!

    user.fullName = data.fullName
    user.phone = data.phone
    await user.save()

    session.flash('success_info', 'Informations mises à jour.')
    return response.redirect().back()
  }

  async updatePassword({ request, response, session, auth }: HttpContext) {
    const user = auth.user!

    const data = await request.validateUsing(updatePasswordValidator, {
      messagesProvider: passwordMessages,
    })

    const isValid = await hash.verify(user.password, data.currentPassword)
    if (!isValid) {
      session.flash('error_password', 'Mot de passe actuel incorrect.')
      return response.redirect().back()
    }

    user.password = await hash.make(data.newPassword)
    await user.save()

    session.flash('success_password', 'Mot de passe modifié avec succès.')
    return response.redirect().back()
  }
}
