import axios, { AxiosError } from 'axios'

const MPESA_BASE_URL =
  import.meta.env.VITE_MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke'
const CONSUMER_KEY = import.meta.env.VITE_MPESA_CONSUMER_KEY || ''
const CONSUMER_SECRET = import.meta.env.VITE_MPESA_CONSUMER_SECRET || ''
const BUSINESS_SHORT_CODE =
  import.meta.env.VITE_MPESA_BUSINESS_SHORT_CODE || '174379'
const PASSKEY =
  import.meta.env.VITE_MPESA_PASSKEY ||
  'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'

// URLs for validation and confirmation
const VALIDATION_URL =
  import.meta.env.VITE_MPESA_VALIDATION_URL ||
  `${import.meta.env.VITE_BACKEND_URL}/api/mpesa/validate`
const CONFIRMATION_URL =
  import.meta.env.VITE_MPESA_CONFIRMATION_URL ||
  `${import.meta.env.VITE_BACKEND_URL}/api/mpesa/confirm`

interface MpesaAuthResponse {
  access_token: string
  expires_in: string
}

interface MpesaRegisterUrlResponse {
  OriginatorCoversationID: string
  ResponseCode: string
  ResponseDescription: string
}

interface SimulatePaymentResponse {
  ConversationID: string
  OriginatorCoversationID: string
  ResponseCode: string
  ResponseDescription: string
}

interface MpesaPaymentResponse {
  success: boolean
  message?: string
  error?: string
  result?: {
    ConversationID: string
    OriginatorCoversationID: string
    ResponseCode: string
    ResponseDescription: string
  }
}

class MpesaService {
  private accessToken: string = ''
  private tokenExpiry: number = 0

  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      // Generate base64 encoded auth string
      const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
        'base64'
      )

      const response = await axios.get<MpesaAuthResponse>(
        `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      )

      this.accessToken = response.data.access_token
      // Set token expiry (subtract 5 minutes for safety margin)
      this.tokenExpiry =
        Date.now() + (parseInt(response.data.expires_in) - 300) * 1000

      return this.accessToken
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error)
      throw new Error('Failed to get M-Pesa access token')
    }
  }

  async registerUrls(): Promise<MpesaRegisterUrlResponse> {
    try {
      const token = await this.getAccessToken()

      const response = await axios.post<MpesaRegisterUrlResponse>(
        `${MPESA_BASE_URL}/mpesa/c2b/v1/registerurl`,
        {
          ShortCode: BUSINESS_SHORT_CODE,
          ResponseType: 'Completed',
          ConfirmationURL: CONFIRMATION_URL,
          ValidationURL: VALIDATION_URL,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Error registering M-Pesa URLs:', error)
      throw new Error('Failed to register M-Pesa URLs')
    }
  }

  private generateTimestamp(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')
    return `${year}${month}${day}${hour}${minute}${second}`
  }

  private generatePassword(timestamp: string): string {
    const str = BUSINESS_SHORT_CODE + PASSKEY + timestamp
    return Buffer.from(str).toString('base64')
  }

  async simulatePayment(
    phoneNumber: string,
    amount: number
  ): Promise<SimulatePaymentResponse> {
    try {
      const token = await this.getAccessToken()
      const timestamp = this.generateTimestamp()
      const password = this.generatePassword(timestamp)

      // Format phone number (remove leading 0 and add country code if needed)
      const formattedPhone = phoneNumber.replace(/^0/, '254')

      const response = await axios.post<SimulatePaymentResponse>(
        `${MPESA_BASE_URL}/mpesa/c2b/v1/simulate`,
        {
          ShortCode: BUSINESS_SHORT_CODE,
          CommandID: 'CustomerPayBillOnline',
          Amount: amount,
          Msisdn: formattedPhone,
          BillRefNumber: 'TEST',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Error simulating M-Pesa payment:', error)
      throw new Error('Failed to simulate M-Pesa payment')
    }
  }

  // This method would be called by your backend when receiving a validation request
  async validateTransaction(transactionData: any): Promise<{
    ResultCode: string
    ResultDesc: string
  }> {
    // Implement your validation logic here
    // For example, check if the account number exists, amount is valid, etc.
    const isValid = true // Replace with actual validation

    if (isValid) {
      return {
        ResultCode: '0',
        ResultDesc: 'Accepted',
      }
    }

    return {
      ResultCode: 'C2B00011',
      ResultDesc: 'Rejected',
    }
  }

  // This method would be called by your backend when receiving a confirmation
  async handleConfirmation(transactionData: any): Promise<{
    ResultCode: number
    ResultDesc: string
  }> {
    try {
      // Process the confirmed transaction
      // For example, update order status, send confirmation email, etc.
      console.log('Processing M-Pesa confirmation:', transactionData)

      // Always return success to acknowledge receipt
      return {
        ResultCode: 0,
        ResultDesc: 'Success',
      }
    } catch (error) {
      console.error('Error processing M-Pesa confirmation:', error)
      throw error
    }
  }
}

export const mpesaService = new MpesaService()

export const initiateMpesaPayment = async (
  phoneNumber: string,
  amount: number
): Promise<MpesaPaymentResponse> => {
  try {
    // Validate phone number format
    const cleanedPhone = phoneNumber.replace(/\D/g, '')
    if (cleanedPhone.length < 9 || cleanedPhone.length > 12) {
      throw new Error('Invalid phone number format')
    }

    // Validate amount
    if (amount < 10 || amount > 150000) {
      throw new Error('Amount must be between 10 and 150,000')
    }

    // Format phone number (ensure it starts with 254)
    const formattedPhone = cleanedPhone.replace(/^0/, '254')
    if (!formattedPhone.startsWith('254')) {
      throw new Error('Phone number must start with 254')
    }

    const response = await axios.post(
      `${import.meta.env.VITE_MPESA_API_URL}/test-payment`,
      {
        phoneNumber: formattedPhone,
        amount: Math.round(amount), // Ensure amount is a whole number
      }
    )

    return response.data
  } catch (error) {
    console.error('M-Pesa payment error:', error)

    if (error instanceof AxiosError) {
      // Handle specific API errors
      const errorMessage = error.response?.data?.error || error.message
      return {
        success: false,
        error: `Payment failed: ${errorMessage}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    }
  }
}
