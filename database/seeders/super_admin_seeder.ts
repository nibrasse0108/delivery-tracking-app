import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class SuperAdminSeeder extends BaseSeeder {
  async run() {
    // Supprimer tous les super admins existants avant de recréer
    await User.query().where('role', 'super_admin').delete()

    await User.create({
      fullName: 'Super Admin',
      email: 'nibrasse0108@gmail.com',
      phone: '+269 398 43 63',
      password: 'admin2026',
      role: 'super_admin',
      isActive: true,
    })
  }
}
