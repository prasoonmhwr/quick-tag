'use client'

import React, { useState, useEffect } from 'react'
import { QrCode, Edit, Trash2, BarChart3, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { QRAnalytics } from './QRAnalytics'
import { QREditModal } from './QREditModal'
import { format } from 'date-fns'

interface QRCodeData {
  id: string
  shortId: string
  title: string
  type: string
  content: string
  targetUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  size: number
  foregroundColor: string
  backgroundColor: string
  errorCorrection: string
  _count: {
    scans: number
  }
}

export function QRList() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null)
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null)
  const [editingQR, setEditingQR] = useState<QRCodeData | null>(null)

  const fetchQRCodes = async () => {
    try {
      const response = await fetch('/api/qr')
      if (response.ok) {
        const data = await response.json()
        setQrCodes(data)
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleQRStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/qr/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchQRCodes()
      }
    } catch (error) {
      console.error('Error updating QR code:', error)
    }
  }

  const deleteQR = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return

    try {
      const response = await fetch(`/api/qr/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchQRCodes()
      }
    } catch (error) {
      console.error('Error deleting QR code:', error)
    }
  }

  const getQRUrl = (shortId: string) => {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/qr/${shortId}`
  }

  useEffect(() => {
    fetchQRCodes()

    // Listen for refresh events from QRGenerator
    const handleRefresh = () => fetchQRCodes()
    window.addEventListener('qr-list-refresh', handleRefresh)
    return () => window.removeEventListener('qr-list-refresh', handleRefresh)
  }, [])

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading QR codes...</p>
        </div>
      </div>
    )
  }

  if (qrCodes.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="text-center py-8">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No QR codes yet</h3>
          <p className="text-gray-600">Create your first QR code using the generator above.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Your QR Codes</h3>
        
        <div className="space-y-4">
          {qrCodes.map((qr) => (
            <div
              key={qr.id}
              className="bg-white/80 rounded-xl p-4 sm:p-6 border border-gray-200/30 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${qr.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h4 className="text-lg font-semibold text-gray-900 truncate">{qr.title}</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {qr.type}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="truncate">
                      <span className="font-medium">Content:</span> {qr.content}
                    </p>
                    {qr.targetUrl && (
                      <p className="truncate">
                        <span className="font-medium">Target:</span> {qr.targetUrl}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Short URL:</span>{' '}
                      <a
                        href={getQRUrl(qr.shortId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        {getQRUrl(qr.shortId)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <span>Created: {format(new Date(qr.createdAt), 'MMM d, yyyy')}</span>
                      <span>Scans: {qr._count.scans}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowAnalytics(showAnalytics === qr.id ? null : qr.id)}
                    className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </button>
                  
                  <button
                    onClick={() => setEditingQR(qr)}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => toggleQRStatus(qr.id, qr.isActive)}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      qr.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {qr.isActive ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Enable
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => deleteQR(qr.id)}
                    className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              {showAnalytics === qr.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <QRAnalytics qrId={qr.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {editingQR && (
        <QREditModal
          qr={editingQR}
          onClose={() => setEditingQR(null)}
          onSave={() => {
            setEditingQR(null)
            fetchQRCodes()
          }}
        />
      )}
    </>
  )
}