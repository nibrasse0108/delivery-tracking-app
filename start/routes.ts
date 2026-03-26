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

// Pages publiques
router.on('/').render('pages/home').as('home')
router.get('/suivre', [controllers.Tracking, 'show']).as('track')

// Reçu de colis (public, sans authentification)
router
  .get('/suivi/:token', [controllers.backoffice.Packages, 'receipt'])
  .as('packages.receipt')

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
    router.get('/profile', [controllers.backoffice.Profile, 'show']).as('backoffice.profile')
    router.post('/profile/info', [controllers.backoffice.Profile, 'updateInfo']).as('backoffice.profile.update_info')
    router.post('/profile/password', [controllers.backoffice.Profile, 'updatePassword']).as('backoffice.profile.update_password')
  })
  .prefix('/backoffice')
  .use(middleware.auth())

// ---------------------------------------------------------------------------
// Backoffice — gestion des clients (admin + super_admin)
// ---------------------------------------------------------------------------
router
  .group(() => {
    router.get('/clients', [controllers.backoffice.Clients, 'index']).as('backoffice.clients.index')
    router.get('/clients/create', [controllers.backoffice.Clients, 'create']).as('backoffice.clients.create')
    router.post('/clients', [controllers.backoffice.Clients, 'store']).as('backoffice.clients.store')
    router.get('/clients/:id/edit', [controllers.backoffice.Clients, 'edit']).as('backoffice.clients.edit')
    router.post('/clients/:id', [controllers.backoffice.Clients, 'update']).as('backoffice.clients.update')
    router.post('/clients/:id/delete', [controllers.backoffice.Clients, 'destroy']).as('backoffice.clients.destroy')
  })
  .prefix('/backoffice')
  .use(middleware.auth())

// ---------------------------------------------------------------------------
// Backoffice — gestion des colis (admin + super_admin)
// ---------------------------------------------------------------------------
router
  .group(() => {
    router.get('/packages', [controllers.backoffice.Packages, 'index']).as('backoffice.packages.index')
    router.get('/packages/create', [controllers.backoffice.Packages, 'create']).as('backoffice.packages.create')
    router.post('/packages', [controllers.backoffice.Packages, 'store']).as('backoffice.packages.store')
    router.get('/packages/:id/edit', [controllers.backoffice.Packages, 'edit']).as('backoffice.packages.edit')
    router.post('/packages/:id', [controllers.backoffice.Packages, 'update']).as('backoffice.packages.update')
    router.post('/packages/:id/status', [controllers.backoffice.Packages, 'advanceStatus']).as('backoffice.packages.advance_status')
    router.post('/packages/:id/payment', [controllers.backoffice.Packages, 'recordPayment']).as('backoffice.packages.record_payment')
    router.post('/packages/:id/photo', [controllers.backoffice.Packages, 'uploadPhoto']).as('backoffice.packages.upload_photo')
    router.post('/packages/:id/delete', [controllers.backoffice.Packages, 'destroy']).as('backoffice.packages.destroy')
  })
  .prefix('/backoffice')
  .use(middleware.auth())

// ---------------------------------------------------------------------------
// Backoffice — gestion des admins (super_admin uniquement)
// ---------------------------------------------------------------------------
router
  .group(() => {
    router.get('/admins', [controllers.backoffice.Admins, 'index']).as('backoffice.admins.index')
    router.get('/admins/create', [controllers.backoffice.Admins, 'create']).as('backoffice.admins.create')
    router.post('/admins', [controllers.backoffice.Admins, 'store']).as('backoffice.admins.store')
    router.post('/admins/:id/toggle', [controllers.backoffice.Admins, 'toggle']).as('backoffice.admins.toggle')
    router.post('/admins/:id/delete', [controllers.backoffice.Admins, 'destroy']).as('backoffice.admins.destroy')
  })
  .prefix('/backoffice')
  .use([middleware.auth(), middleware.role({ roles: ['super_admin'] })])

// Health checks
router.get('/health/live', [controllers.HealthChecks, 'live']).as('health_checks.live')
router.get('/health/ready', [controllers.HealthChecks, 'ready']).as('health_checks.ready')
