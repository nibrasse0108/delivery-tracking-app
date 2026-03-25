/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

// Page publique
router.on('/').render('pages/home').as('home')

// ---------------------------------------------------------------------------
// Backoffice — routes d'authentification (invités uniquement)
// ---------------------------------------------------------------------------
router
  .group(() => {
    router.get('/login', [controllers.backoffice.Auth, 'showLogin']).as('backoffice.auth.login')
    router.post('/login', [controllers.backoffice.Auth, 'login']).as('backoffice.auth.login.store')
    router
      .get('/reset-password', [controllers.backoffice.Auth, 'showResetPassword'])
      .as('backoffice.auth.reset_password')
    router
      .post('/reset-password', [controllers.backoffice.Auth, 'sendResetLink'])
      .as('backoffice.auth.reset_password.store')
    router
      .get('/reset-password/:token', [controllers.backoffice.Auth, 'showNewPassword'])
      .as('backoffice.auth.new_password')
    router
      .post('/reset-password/:token', [controllers.backoffice.Auth, 'resetPassword'])
      .as('backoffice.auth.new_password.store')
  })
  .prefix('/backoffice')
  .use(middleware.guest())

// ---------------------------------------------------------------------------
// Backoffice — routes protégées (authentification requise)
// ---------------------------------------------------------------------------
router
  .group(() => {
    router.post('/logout', [controllers.backoffice.Auth, 'logout']).as('backoffice.logout')
    router.get('/dashboard', [controllers.backoffice.Dashboard, 'index']).as('backoffice.dashboard')
  })
  .prefix('/backoffice')
  .use(middleware.auth())

// Health checks
router.get('/health/live', [controllers.HealthChecks, 'live']).as('health_checks.live')
router.get('/health/ready', [controllers.HealthChecks, 'ready']).as('health_checks.ready')
