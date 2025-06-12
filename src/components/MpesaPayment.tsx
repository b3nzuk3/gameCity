import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Phone } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { initiateMpesaPayment } from '@/services/mpesaService'

interface MpesaPaymentProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-digit characters
    const cleaned = e.target.value.replace(/\D/g, '')
    setPhoneNumber(cleaned)
  }

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid M-Pesa phone number',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      const response = await initiateMpesaPayment(phoneNumber, amount)

      if (response.success) {
        toast({
          title: 'Payment initiated',
          description: 'Please check your phone for the M-Pesa prompt',
        })
        onSuccess()
      } else {
        throw new Error(response.error || 'Payment failed')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment failed'
      onError(errorMessage)
      toast({
        title: 'Payment failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          M-Pesa Phone Number
        </label>
        <div className="flex gap-2">
          <Input
            id="phone"
            type="tel"
            placeholder="254708374149"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className="flex-1"
            maxLength={12}
          />
          <Button
            onClick={handlePayment}
            disabled={loading || !phoneNumber}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>Pay with M-Pesa</span>
              </div>
            )}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        For sandbox testing, use the phone number: 254708374149
      </p>
    </div>
  )
}

export default MpesaPayment
