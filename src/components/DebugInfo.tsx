import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { checkHealth } from '@/services/backendService'
import { useAuth } from '@/contexts/AuthContext'
import {
  Database,
  Server,
  User,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface HealthStatus {
  status: string
  database: string
  timestamp: string
}

const DebugInfo = () => {
  const { user } = useAuth()
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkBackendHealth = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const health = await checkHealth()
      setHealthStatus(health)
      console.log('Backend health check:', health)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Health check failed'
      setError(errorMessage)
      console.error('Backend health check failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkBackendHealth()
  }, [])

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />
    if (error) return <XCircle className="h-4 w-4 text-red-400" />
    if (healthStatus?.status === 'OK')
      return <CheckCircle className="h-4 w-4 text-yellow-400" />
    return <AlertCircle className="h-4 w-4 text-yellow-400" />
  }

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary">Checking...</Badge>
    if (error) return <Badge variant="destructive">Error</Badge>
    if (healthStatus?.status === 'OK')
      return (
        <Badge variant="default" className="bg-yellow-500 text-black">
          Connected
        </Badge>
      )
    return <Badge variant="secondary">Unknown</Badge>
  }

  const getDatabaseBadge = () => {
    if (!healthStatus) return <Badge variant="secondary">Unknown</Badge>

    if (healthStatus.database === 'Connected') {
      return (
        <Badge variant="default" className="bg-yellow-500 text-black">
          MongoDB Connected
        </Badge>
      )
    }

    return <Badge variant="secondary">{healthStatus.database}</Badge>
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Server className="mr-2 h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Backend API Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2 text-sm font-medium">Backend API</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="ml-2 text-sm font-medium">Database</span>
          </div>
          {getDatabaseBadge()}
        </div>

        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="ml-2 text-sm font-medium">Authentication</span>
          </div>
          {user ? (
            <Badge variant="default" className="bg-yellow-500 text-black">
              Logged In
            </Badge>
          ) : (
            <Badge variant="outline">Guest</Badge>
          )}
        </div>

        {/* User Info */}
        {user && (
          <div className="pt-2 border-t border-gray-700">
            <div className="text-xs text-muted-foreground mb-1">
              Current User:
            </div>
            <div className="text-sm">
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground">{user.email}</div>
              {user.isAdmin && (
                <Badge
                  variant="outline"
                  className="mt-1 text-xs border-yellow-500 text-yellow-400"
                >
                  Administrator
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="pt-2 border-t border-gray-700">
            <div className="text-xs text-red-400 mb-1">Error:</div>
            <div className="text-xs text-muted-foreground">{error}</div>
          </div>
        )}

        {/* Health Status Details */}
        {healthStatus && (
          <div className="pt-2 border-t border-gray-700">
            <div className="text-xs text-muted-foreground mb-1">
              Last Check:
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(healthStatus.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <Button
          onClick={checkBackendHealth}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full border-gray-700"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh Status
        </Button>

        {/* Environment Info */}
        <div className="pt-2 border-t border-gray-700">
          <div className="text-xs text-muted-foreground mb-1">Environment:</div>
          <div className="text-xs space-y-1">
            <div>
              <span className="text-muted-foreground">Backend URL:</span>{' '}
              <span className="font-mono">
                {import.meta.env.VITE_BACKEND_URL ||
                  'http://localhost:5000/api'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Mode:</span>{' '}
              <span className="font-mono">{import.meta.env.MODE}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DebugInfo
