import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import type { PackageStatus } from '#models/package'
import User from '#models/user'

export type PackageLogAction = 'created' | 'status_changed' | 'payment_recorded' | 'photo_uploaded'

export default class PackageLog extends BaseModel {
  static table = 'package_logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare packageId: number

  @column()
  declare userId: number

  @column()
  declare action: PackageLogAction

  @column()
  declare fromStatus: PackageStatus | null

  @column()
  declare toStatus: PackageStatus | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
