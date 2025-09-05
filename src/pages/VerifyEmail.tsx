import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<
    'success' | 'error' | null
  >(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setVerificationStatus('error')
        setMessage('No verification token provided')
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/verify-email?token=${token}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.ok) {
          setVerificationStatus('success')
          setMessage('Email verified successfully! You can now log in.')
          toast({
            title: 'Email Verified',
            description: 'Your email has been verified successfully!',
          })
        } else {
          const data = await response.json()
          setVerificationStatus('error')
          setMessage(data.message || 'Email verification failed')
          toast({
            title: 'Verification Failed',
            description: data.message || 'Email verification failed',
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('Email verification error:', error)
        setVerificationStatus('error')
        setMessage('Network error. Please try again.')
        toast({
          title: 'Verification Error',
          description: 'Network error. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [searchParams])

  const handleGoToSignIn = () => {
    navigate('/signin')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isVerifying ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-muted-foreground">Verifying your email...</p>
              </div>
            ) : verificationStatus === 'success' ? (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-green-600 font-medium">{message}</p>
                <div className="flex space-x-2">
                  <Button onClick={handleGoToSignIn} className="flex-1">
                    Sign In
                  </Button>
                  <Button
                    onClick={handleGoHome}
                    variant="outline"
                    className="flex-1"
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <XCircle className="h-12 w-12 text-red-500" />
                <p className="text-red-600 font-medium">{message}</p>
                <div className="flex space-x-2">
                  <Button onClick={handleGoToSignIn} className="flex-1">
                    Try Again
                  </Button>
                  <Button
                    onClick={handleGoHome}
                    variant="outline"
                    className="flex-1"
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default VerifyEmail
