import { BaseMail } from '@adonisjs/mail'
import User from '#models/user'

export default class ResetPasswordNotification extends BaseMail {
  subject = 'Réinitialisation de votre mot de passe'

  constructor(
    private user: User,
    private resetUrl: string
  ) {
    super()
  }

  prepare() {
    this.message
      .to(this.user.email, this.user.fullName ?? undefined)
      .htmlView('emails/reset_password', {
        user: this.user,
        resetUrl: this.resetUrl,
      })
  }
}
