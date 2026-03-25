import vine from '@vinejs/vine'
import { isValidPhoneNumber } from 'libphonenumber-js'
import type { FieldContext } from '@vinejs/vine/types'

const phoneRule = vine.createRule((value: unknown, _: undefined, field: FieldContext) => {
  if (typeof value !== 'string' || value.trim() === '') return

  try {
    if (!isValidPhoneNumber(value)) {
      field.report('Le numéro de téléphone est invalide.', 'phone', field)
    }
  } catch {
    field.report('Le numéro de téléphone est invalide.', 'phone', field)
  }
})

export const validPhone = () => phoneRule(undefined)
