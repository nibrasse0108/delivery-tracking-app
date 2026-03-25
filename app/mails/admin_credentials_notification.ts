import { BaseMail } from '@adonisjs/mail'
import User from '#models/user'

export default class AdminCredentialsNotification extends BaseMail {
  subject = 'Vos identifiants de connexion — Delivery Tracking KM'

  constructor(
    private user: User,
    private plainPassword: string
  ) {
    super()
  }

  prepare() {
    this.message
      .to(this.user.email, this.user.fullName ?? undefined)
      .htmlView('emails/admin_credentials', {
        user: this.user,
        password: this.plainPassword,
      })
  }
}
