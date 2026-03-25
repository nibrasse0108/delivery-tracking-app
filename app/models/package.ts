import { BaseModel, belongsTo, hasMany, column } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Client from '#models/client'
import PackageLog from '#models/package_log'

export type PackageStatus =
  | 'pending'
  | 'taken_over'
  | 'in_delivery'
  | 'available_at_agency'
  | 'withdrawn'

export const STATUS_LABELS: Record<PackageStatus, string> = {
  pending: 'En attente',
  taken_over: 'Pris en charge',
  in_delivery: 'En cours de livraison',
  available_at_agency: "Disponible à l'agence",
  withdrawn: 'Retiré',
}

export const STATUS_ORDER: PackageStatus[] = [
  'pending',
  'taken_over',
  'in_delivery',
  'available_at_agency',
  'withdrawn',
]

export default class Package extends BaseModel {
  static table = 'packages'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare trackingNumber: string

  @column()
  declare receiptToken: string

  @column()
  declare clientId: number

  @column()
  declare designation: string

  @column()
  declare description: string | null

  @column()
  declare weight: number

  @column()
  declare price: number

  @column()
  declare extraFees: number | null

  @column()
  declare extraFeesReason: string | null

  @column.date()
  declare estimatedDeliveryDate: DateTime

  @column()
  declare status: PackageStatus

  @column()
  declare paymentStatus: 'unpaid' | 'paid'

  @column()
  declare paymentMethod: string | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column()
  declare photoPath: string | null

  @belongsTo(() => Client, { foreignKey: 'clientId' })
  declare client: BelongsTo<typeof Client>

  @hasMany(() => PackageLog, { foreignKey: 'packageId' })
  declare logs: HasMany<typeof PackageLog>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  get statusLabel() {
    return STATUS_LABELS[this.status]
  }

  get statusIndex() {
    return STATUS_ORDER.indexOf(this.status)
  }

  get nextStatus(): PackageStatus | null {
    return STATUS_ORDER[this.statusIndex + 1] ?? null
  }

  get nextStatusLabel(): string | null {
    const next = this.nextStatus
    return next ? STATUS_LABELS[next] : null
  }

  get totalPrice(): number {
    return this.price + (this.extraFees ?? 0)
  }

  get canDelete() {
    return this.status === 'pending'
  }

  isValidNextStatus(newStatus: PackageStatus): boolean {
    const newIndex = STATUS_ORDER.indexOf(newStatus)
    return newIndex === this.statusIndex + 1
  }
}
