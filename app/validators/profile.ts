import vine from '@vinejs/vine'

export const updateInfoValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100),
    phone: vine.string().trim().minLength(8).maxLength(20),
  })
)

export const updatePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string().minLength(1),
    newPassword: vine.string().minLength(8),
    confirmPassword: vine.string().sameAs('newPassword'),
  })
)
