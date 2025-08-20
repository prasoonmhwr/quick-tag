'use client'

import React, { useState, useEffect } from 'react'
import { QrCode, Edit, Trash2, BarChart3, Eye, EyeOff, ExternalLink, Download } from 'lucide-react'
import { QRAnalytics } from './QRAnalytics'
import { QREditModal } from './QREditModal'
import { format, set } from 'date-fns'
import { Dialog } from '@radix-ui/react-dialog'
import { DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { generateQRCode } from '@/lib/qr-generator'

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
  logo?: string,
  dataUrl: string
  _count: {
    scans: number
  }
}

export function QRList() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [viewingQR, setViewingQR] = useState<QRCodeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null)
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null)
  const [editingQR, setEditingQR] = useState<QRCodeData | null>(null)
  const [isViewingQR, setIsViewingQR] = useState<boolean>(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

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

  async function viewQR(qr: QRCodeData) {
    setViewingQR(qr)
    const config = {
      type: qr.type,
      errorCorrection: qr.errorCorrection as 'L' | 'M' | 'Q' | 'H',
      foregroundColor: qr.foregroundColor,
      backgroundColor: qr.backgroundColor,
      logo: qr.logo
    }
    const dataUrl = await generateQRCode({
      ...config,
      data: qr.dataUrl,
      size: 256,
    })
    setQrDataUrl(dataUrl)

    setIsViewingQR(true)
  }
  useEffect(() => {
    fetchQRCodes()

    // Listen for refresh events from QRGenerator
    const handleRefresh = () => fetchQRCodes()
    window.addEventListener('qr-list-refresh', handleRefresh)
    return () => window.removeEventListener('qr-list-refresh', handleRefresh)
  }, [])
  const downloadQR = (format: string) => {
    if (qrDataUrl) {
      const link = document.createElement('a')
      link.download = `'qrcode'.${format}`
      link.href = qrDataUrl
      link.click()
    }
  }
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
          {/* <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" /> */}
          <img className="h-12 w-12 mx-auto mb-4" src="/qr-shape.svg" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No QR codes yet</h3>
          <p className="text-gray-600">Create your first QR code using the generator above.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Your QR Codes</h3>
          <span className="text-sm text-gray-500">
            {qrCodes.length} total
          </span>
        </div>

        <div className="grid gap-6 sm:gap-8">
          {qrCodes.map((qr) => (
            <div
              key={qr.id}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${qr.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <h4 className="text-lg font-medium text-gray-900 truncate">{qr.title}</h4>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      {qr.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {qr.type != 'URL' && <p className="truncate">
                      <span className="font-medium text-gray-800">Content:</span> {qr.content}
                    </p>}
                    {qr.targetUrl && (
                      <p className="truncate">
                        <span className="font-medium text-gray-800">Target:</span> {qr.targetUrl}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-gray-800">Short URL:</span>{' '}
                      <a
                        href={getQRUrl(qr.shortId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                      >
                        {getQRUrl(qr.shortId)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
                      <span>Created: {format(new Date(qr.createdAt), 'MMM d, yyyy')}</span>
                      <span>Scans: {qr._count.scans}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowAnalytics(showAnalytics === qr.id ? null : qr.id)}
                    className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </button>

                  <button
                    onClick={() => setEditingQR(qr)}
                    className="flex items-center px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>

                  <button
                    onClick={() => toggleQRStatus(qr.id, qr.isActive)}
                    className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition ${qr.isActive
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
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
                    className="flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                  <button onClick={() => viewQR(qr)} className="flex items-center px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                    <QrCode className="h-4 w-4 mr-1" />
                    View QR
                  </button>
                </div>
              </div>

              {/* Expanded analytics */}
              {showAnalytics === qr.id && (
                <div className="px-5 sm:px-6 pb-6">
                  <div className="pt-6 border-t border-gray-100">
                    <QRAnalytics qrId={qr.id} />
                  </div>
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


      <Dialog open={isViewingQR} onOpenChange={setIsViewingQR}>

        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          {viewingQR && <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200/50 shadow-lg">

            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 text-center">QR Code Preview</h3>

            <div className="flex justify-center mb-4 sm:mb-6">
              <div

                className="bg-white p-3 sm:p-4 lg:p-6 rounded-2xl shadow-lg border-4 border-gray-100"
                style={{ backgroundColor: viewingQR!.backgroundColor }}
              >

                {qrDataUrl && <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="max-w-full h-auto"
                  style={{
                    width: 256,
                    height: 256,
                    maxWidth: '100%'
                  }}
                />}

              </div>
            </div>


            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Download or save your QR code</p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-4">
                  <button
                    onClick={() => downloadQR('png')}
                    className="flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 touch-manipulation"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PNG
                  </button>
                  <button
                    onClick={() => downloadQR('jpg')}
                    className="flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 touch-manipulation"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JPG
                  </button>
                  <button
                    onClick={() => downloadQR('svg')}
                    className="flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 touch-manipulation"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    SVG
                  </button>
                </div>

              </div>
            </div>
          </div>}
        </DialogContent>
      </Dialog>

    </>
  )
}