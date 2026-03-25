import { BaseMail } from '@adonisjs/mail'
import Package from '#models/package'

export default class PackageReceiptNotification extends BaseMail {
  subject: string

  constructor(
    private pkg: Package,
    private receiptUrl: string
  ) {
    super()
    this.subject = `Reçu de dépôt — Colis ${pkg.trackingNumber}`
  }

  prepare() {
    this.message
      .to(this.pkg.client.email, this.pkg.client.fullName)
      .htmlView('emails/package_receipt', {
        pkg: this.pkg,
        receiptUrl: this.receiptUrl,
      })
  }
}
