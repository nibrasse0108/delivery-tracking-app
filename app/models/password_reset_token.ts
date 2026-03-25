import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class PasswordResetToken extends BaseModel {
  static table = 'password_reset_tokens'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  /** Token hashé (SHA-256). Ne jamais stocker le token brut. */
  @column()
  declare token: string

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  /** Vérifie si le token est encore valide */
  get isExpired(): boolean {
    return this.expiresAt < DateTime.now()
  }
}
