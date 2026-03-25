import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class SuperAdminSeeder extends BaseSeeder {
  async run() {
    // Supprimer tous les super admins existants avant de recréer
    await User.query().where('role', 'super_admin').delete()

    await User.create({
      fullName: 'Super Admin',
      email: 'nibrasse0108@gmail.com',
      password: 'SuperAdmin@2025!',
      role: 'super_admin',
    })

    console.log('✓ Super Admin créé : nibrasse0108@gmail.com / SuperAdmin@2025!')
    console.log('⚠ Pensez à changer le mot de passe après la première connexion.')
  }
}
