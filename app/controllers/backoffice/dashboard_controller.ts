import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Package from '#models/package'
import Client from '#models/client'
import User from '#models/user'

export default class DashboardController {
  async index({ view, auth }: HttpContext) {
    const user = auth.user!
    const now = DateTime.now()
    const startOfMonth = now.startOf('month').toISO()!
    const today = now.toISODate()!

    const [total, inTransit, availableAtAgency, overdueCount, unpaidWithdrawn] = await Promise.all([
      Package.query().count('* as total').first(),
      Package.query()
        .whereIn('status', ['taken_over', 'in_delivery'])
        .count('* as total')
        .first(),
      Package.query().where('status', 'available_at_agency').count('* as total').first(),
      Package.query()
        .whereNotIn('status', ['withdrawn', 'pending'])
        .where('estimated_delivery_date', '<', today)
        .count('* as total')
        .first(),
      Package.query()
        .where('status', 'withdrawn')
        .where('payment_status', 'unpaid')
        .count('* as total')
        .first(),
    ])

    // Revenus du mois courant (colis payés ce mois)
    const paidThisMonth = await Package.query()
      .where('payment_status', 'paid')
      .where('paid_at', '>=', startOfMonth)
      .select('price', 'extra_fees')

    const revenueThisMonth = paidThisMonth.reduce(
      (sum, p) => sum + Number(p.price) + Number(p.extraFees ?? 0),
      0
    )

    // Taux de paiement global (colis retirés)
    const [withdrawnTotal, withdrawnPaid] = await Promise.all([
      Package.query().where('status', 'withdrawn').count('* as total').first(),
      Package.query()
        .where('status', 'withdrawn')
        .where('payment_status', 'paid')
        .count('* as total')
        .first(),
    ])
    const withdrawnTotalCount = Number(withdrawnTotal?.$extras.total ?? 0)
    const withdrawnPaidCount = Number(withdrawnPaid?.$extras.total ?? 0)
    const paymentRate =
      withdrawnTotalCount > 0 ? Math.round((withdrawnPaidCount / withdrawnTotalCount) * 100) : 0

    // 8 derniers colis
    const recentPackages = await Package.query()
      .preload('client')
      .orderBy('created_at', 'desc')
      .limit(8)

    // Statistiques mensuelles (6 derniers mois)
    const monthlyData = await this.getMonthlyStats(6)
    const maxMonthly = Math.max(...monthlyData.map((m) => Math.max(m.created, m.delivered)), 1)

    // Super admin uniquement
    let totalClients = 0
    let totalAdmins = 0
    if (user.role === 'super_admin') {
      const [clientsCount, adminsCount] = await Promise.all([
        Client.query().count('* as total').first(),
        User.query().where('role', 'admin').count('* as total').first(),
      ])
      totalClients = Number(clientsCount?.$extras.total ?? 0)
      totalAdmins = Number(adminsCount?.$extras.total ?? 0)
    }

    return view.render('backoffice/dashboard', {
      stats: {
        total: Number(total?.$extras.total ?? 0),
        inTransit: Number(inTransit?.$extras.total ?? 0),
        availableAtAgency: Number(availableAtAgency?.$extras.total ?? 0),
        overdue: Number(overdueCount?.$extras.total ?? 0),
        unpaidWithdrawn: Number(unpaidWithdrawn?.$extras.total ?? 0),
        revenueThisMonth,
        paymentRate,
        totalClients,
        totalAdmins,
      },
      recentPackages,
      monthlyData,
      maxMonthly,
      currentUser: user,
    })
  }

  private async getMonthlyStats(months: number) {
    const result = []
    const now = DateTime.now()

    for (let i = months - 1; i >= 0; i--) {
      const month = now.minus({ months: i })
      const start = month.startOf('month').toISO()!
      const end = month.endOf('month').toISO()!

      const [created, delivered] = await Promise.all([
        Package.query().whereBetween('created_at', [start, end]).count('* as total').first(),
        Package.query()
          .where('status', 'withdrawn')
          .whereBetween('updated_at', [start, end])
          .count('* as total')
          .first(),
      ])

      result.push({
        label: month.setLocale('fr').toFormat('MMM'),
        created: Number(created?.$extras.total ?? 0),
        delivered: Number(delivered?.$extras.total ?? 0),
      })
    }

    return result
  }
}
