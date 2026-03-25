import vine from '@vinejs/vine'

const packageBaseFields = {
  clientId: vine.number().positive(),
  designation: vine.string().trim().minLength(2).maxLength(100),
  description: vine.string().trim().maxLength(1000).optional().nullable(),
  weight: vine.number().positive(),
  price: vine.number().min(0),
  estimatedDeliveryDate: vine
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .use(
      vine.createRule((value, _, field) => {
        if (typeof value !== 'string') return
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const date = new Date(value)
        if (date <= today) {
          field.report('La date de livraison prévue doit être ultérieure à la date du jour.', 'after_today', field)
        }
      })()
    ),
}

export const createPackageValidator = vine.compile(vine.object(packageBaseFields))

export const updatePackageValidator = vine.compile(vine.object(packageBaseFields))

export const recordPaymentValidator = vine.compile(
  vine.object({
    paymentMethod: vine.enum(['cash', 'mobile_money'] as const),
  })
)

export const advanceStatusValidator = vine.compile(
  vine.object({
    status: vine.enum([
      'taken_over',
      'in_delivery',
      'available_at_agency',
      'withdrawn',
    ] as const),
    extraFees: vine.number().min(0).optional(),
    extraFeesReason: vine.string().trim().maxLength(500).optional(),
  })
)
