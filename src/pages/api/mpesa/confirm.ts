import { mpesaService } from '@/services/mpesaService'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const confirmationResult = await mpesaService.handleConfirmation(req.body)
    res.status(200).json(confirmationResult)
  } catch (error) {
    console.error('M-Pesa confirmation error:', error)
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Internal server error',
    })
  }
}
