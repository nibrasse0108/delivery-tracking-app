import vine from '@vinejs/vine'
import { validPhone } from '#rules/phone'

const clientFields = {
  firstName: vine.string().trim().minLength(2).maxLength(100),
  lastName: vine.string().trim().minLength(2).maxLength(100),
  email: vine.string().email().normalizeEmail(),
  phone: vine.string().trim().use(validPhone()),
  address: vine.string().trim().minLength(5).maxLength(500),
}

export const createClientValidator = vine.compile(vine.object(clientFields))
export const updateClientValidator = vine.compile(vine.object(clientFields))
