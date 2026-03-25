import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(1),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

export const newPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(8).confirmed(),
    password_confirmation: vine.string(),
  })
)
