import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Role middleware restricts access to routes based on user role.
 * Must be used after the auth middleware.
 */
export default class RoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { roles: ('super_admin' | 'admin')[] }
  ) {
    const user = ctx.auth.user!

    if (!options.roles.includes(user.role)) {
      return ctx.response.forbidden('Accès refusé : vous n\'avez pas les permissions requises.')
    }

    return next()
  }
}
