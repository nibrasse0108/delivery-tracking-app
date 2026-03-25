import vine from '@vinejs/vine'

export const createAdminValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100),
    email: vine.string().email().normalizeEmail(),
    phone: vine.string().trim().minLength(6).maxLength(20),
  })
)
