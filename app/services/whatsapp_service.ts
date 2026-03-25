import logger from '@adonisjs/core/services/logger'

export default class WhatsAppService {
  private readonly apiUrl = 'https://wasenderapi.com/api/send-message'
  private readonly wasenderApiKey = 'cd7ff4455aae4f0178cbc9dd386df3898654027c78cac24a2328c0b9a4b7e52f'

  async send(to: string, text: string): Promise<void> {
    
    const phone = to.startsWith('+') ? to : `+${to}`

    let response: Response
    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.wasenderApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: phone, text }),
      })
    } catch (networkErr) {
      throw new Error(`Wasender — erreur réseau : ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`)
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '(corps illisible)')
      throw new Error(`Wasender API ${response.status} ${response.statusText}: ${body}`)
    }

    logger.info({ to: phone }, 'Message WhatsApp envoyé avec succès')
  }
}
