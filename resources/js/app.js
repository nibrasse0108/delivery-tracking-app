import Alpine from 'alpinejs'
import intlTelInput from 'intl-tel-input'

function initPhoneInputs() {
  document.querySelectorAll('[data-phone-input]').forEach((input) => {
    const wrapper = input.closest('[data-phone-wrapper]')
    const hidden = wrapper.querySelector('input[name="phone"]')

    const iti = intlTelInput(input, {
      initialCountry: 'km',
      preferredCountries: ['km', 'yt', 're', 'mg', 'fr', 'ae', 'sa'],
      separateDialCode: true,
      loadUtils: () => import('intl-tel-input/build/js/utils.js'),
    })

    const initial = input.dataset.initial
    if (initial) iti.setNumber(initial)

    const errorEl = wrapper.querySelector('[data-phone-error]')

    input.addEventListener('input', () => {
      if (errorEl.textContent) {
        errorEl.classList.add('hidden')
        input.classList.remove('border-red-400', 'dark:border-red-600')
        input.classList.add('border-gray-300', 'dark:border-gray-700')
      }
    })

    input.closest('form').addEventListener(
      'submit',
      (e) => {
        const val = iti.getNumber()
        if (!val || !iti.isValidNumber()) {
          e.preventDefault()
          e.stopImmediatePropagation()
          errorEl.textContent = 'Le numéro de téléphone est invalide.'
          errorEl.classList.remove('hidden')
          input.classList.remove('border-gray-300', 'dark:border-gray-700', 'dark:bg-gray-900')
          input.classList.add('border-red-400', 'dark:border-red-600')
          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return
        }
        hidden.value = val
      },
      { capture: true }
    )
  })
}

Alpine.data('alert', function () {
  return {
    isVisible: false,
    dismiss() {
      this.isVisible = false
    },
    init() {
      setTimeout(() => {
        this.isVisible = true
      }, 80)
      setTimeout(() => {
        this.dismiss()
      }, 5000)
    },
  }
})

Alpine.start()

document.addEventListener('DOMContentLoaded', initPhoneInputs)
