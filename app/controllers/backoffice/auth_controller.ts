import { randomBytes, createHash } from 'node:crypto'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import ResetPasswordNotification from '#mails/reset_password_notification'
import { loginValidator, resetPasswordValidator, newPasswordValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import { DateTime } from 'luxon'

export default class AuthController {
  // ---------------------------------------------------------------------------
  // Connexion
  // ---------------------------------------------------------------------------

  async showLogin({ view }: HttpContext) {
    return view.render('authentication/login')
  }

  async login({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const rememberMe = request.input('remember_me') === 'on'

    try {
      const user = await User.verifyCredentials(email, password)

      if (!user.isActive) {
        session.flash('error', 'Votre compte a été désactivé. Contactez un administrateur.')
        session.flash('email', email)
        return response.redirect().back()
      }

      await auth.use('web').login(user, rememberMe)
      return response.redirect().toRoute('backoffice.dashboard')
    } catch {
      session.flash('error', 'Email ou mot de passe incorrect.')
      session.flash('email', email)
      return response.redirect().back()
    }
  }

  // ---------------------------------------------------------------------------
  // Réinitialisation — Étape 1 : demande de lien
  // ---------------------------------------------------------------------------

  async showResetPassword({ view }: HttpContext) {
    return view.render('authentication/reset-password')
  }

  async sendResetLink({ request, session, response, logger }: HttpContext) {
    const { email } = await request.validateUsing(resetPasswordValidator)

    const user = await User.findBy('email', email)

    if (user) {
      // Générer un token aléatoire de 32 octets (64 chars hex)
      const rawToken = randomBytes(32).toString('hex')
      // Stocker uniquement le hash SHA-256 (le token brut part par email seulement)
      const hashedToken = createHash('sha256').update(rawToken).digest('hex')

      // Supprimer les éventuels tokens existants pour cet email
      await PasswordResetToken.query().where('email', email).delete()

      // Enregistrer le nouveau token (expire dans 60 minutes)
      await PasswordResetToken.create({
        email,
        token: hashedToken,
        expiresAt: DateTime.now().plus({ minutes: 60 }),
      })

      // Construire l'URL de réinitialisation
      const resetUrl = `${env.get('APP_URL')}/backoffice/reset-password/${rawToken}`

      // Envoyer l'email — Resend (HTTP) en priorité, SMTP en fallback
      void (async () => {
        try {
          await mail.use('resend').send(new ResetPasswordNotification(user, resetUrl))
        } catch (resendError) {
          logger.warn({ error: resendError }, 'Resend a échoué, tentative via SMTP')
          try {
            await mail.use('smtp').send(new ResetPasswordNotification(user, resetUrl))
          } catch (smtpError) {
            logger.error({ error: smtpError }, "Échec de l'envoi de l'email (Resend + SMTP)")
          }
        }
      })()
    }

    // Toujours afficher un message générique pour éviter l'énumération d'emails
    session.flash('success', 'Si cet email est enregistré, un lien de réinitialisation vous a été envoyé.')
    return response.redirect().back()
  }

  // ---------------------------------------------------------------------------
  // Réinitialisation — Étape 2 : nouveau mot de passe
  // ---------------------------------------------------------------------------

  async showNewPassword({ params, view, session, response }: HttpContext) {
    const hashedToken = createHash('sha256').update(params.token).digest('hex')

    const tokenRecord = await PasswordResetToken.query()
      .where('token', hashedToken)
      .where('expires_at', '>=', DateTime.now().toSQL()!)
      .first()

    if (!tokenRecord) {
      session.flash('error', 'Ce lien de réinitialisation est invalide ou a expiré.')
      return response.redirect().toRoute('backoffice.auth.reset_password')
    }

    return view.render('authentication/new-password', { token: params.token })
  }

  async resetPassword({ params, request, session, response }: HttpContext) {
    const hashedToken = createHash('sha256').update(params.token).digest('hex')

    const tokenRecord = await PasswordResetToken.query()
      .where('token', hashedToken)
      .where('expires_at', '>=', DateTime.now().toSQL()!)
      .first()

    if (!tokenRecord) {
      session.flash('error', 'Ce lien de réinitialisation est invalide ou a expiré.')
      return response.redirect().toRoute('backoffice.auth.reset_password')
    }

    const { password } = await request.validateUsing(newPasswordValidator)

    // Mettre à jour le mot de passe de l'utilisateur
    const user = await User.findByOrFail('email', tokenRecord.email)
    user.password = password
    await user.save()

    // Supprimer le token (usage unique)
    await tokenRecord.delete()

    session.flash('success', 'Mot de passe mis à jour avec succès. Vous pouvez vous connecter.')
    return response.redirect().toRoute('backoffice.auth.login')
  }

  // ---------------------------------------------------------------------------
  // Déconnexion
  // ---------------------------------------------------------------------------

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('backoffice.auth.login')
  }
}
