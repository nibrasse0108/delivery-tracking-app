import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'packages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('tracking_number', 20).notNullable().unique()
      table.string('receipt_token', 32).notNullable().unique()
      table
        .integer('client_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('clients')
        .onDelete('RESTRICT')
      table.string('designation', 100).notNullable()
      table.text('description').nullable()
      table.decimal('weight', 8, 2).notNullable()
      table.decimal('price', 10, 2).notNullable()
      table.decimal('extra_fees', 10, 2).nullable()
      table.text('extra_fees_reason').nullable()
      table.date('estimated_delivery_date').notNullable()
      table
        .enum('status', ['pending', 'taken_over', 'in_delivery', 'available_at_agency', 'withdrawn'])
        .notNullable()
        .defaultTo('pending')
      table
        .enum('payment_status', ['unpaid', 'paid'])
        .notNullable()
        .defaultTo('unpaid')
      table.string('payment_method', 30).nullable()
      table.timestamp('paid_at').nullable()
      table.string('photo_path', 500).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
