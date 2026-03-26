import type { HttpContext } from '@adonisjs/core/http'
import Package, { STATUS_ORDER, STATUS_LABELS } from '#models/package'

export default class TrackingController {
  async show({ request, view }: HttpContext) {
    const numero = ((request.input('numero', '') as string) ?? '').trim().toUpperCase()

    if (!numero) {
      return view.render('pages/track', {
        numero: '',
        pkg: null,
        notFound: false,
        steps: this.#buildSteps(null),
      })
    }

    const pkg = await Package.query().where('tracking_number', numero).preload('client').first()

    return view.render('pages/track', {
      numero,
      pkg: pkg ?? null,
      notFound: !pkg,
      steps: this.#buildSteps(pkg ?? null),
    })
  }

  #buildSteps(pkg: Package | null) {
    return STATUS_ORDER.map((status, index) => ({
      status,
      label: STATUS_LABELS[status],
      isDone: pkg ? index <= pkg.statusIndex : false,
      isCurrent: pkg ? index === pkg.statusIndex : false,
      isLast: index === STATUS_ORDER.length - 1,
    }))
  }
}
