'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Analytics from '../../components/Analytics'

interface QRCodeData {
  id: string
  name: string
  shortCode: string
  destinationUrl: string
  description?: string
  scanCount: number
  createdAt: string
  updatedAt: string
}

export default function AnalyticsPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQRCodes()
  }, [])

  const fetchQRCodes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/qr')
      
      if (!response.ok) {
        throw new Error('Failed to fetch QR codes')
      }
      
      const data = await response.json()
      setQrCodes(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      console.error('Error fetching QR codes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-700 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">View performance insights for your QR codes</p>
              </div>
            </div>
            <button
              onClick={fetchQRCodes}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchQRCodes}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <Analytics qrCodes={qrCodes} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <p>Analytics data is updated in real-time as QR codes are scanned</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">
                Back to Dashboard
              </Link>
              <span>•</span>
              <span>{qrCodes.length} QR codes tracked</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const metadata = {
  title: 'Analytics - QR Code Manager',
  description: 'View analytics and insights for your dynamic QR codes',
}