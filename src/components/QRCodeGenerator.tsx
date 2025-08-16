'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'

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

interface QRCodeGeneratorProps {
  onQRCreated: (qr: QRCodeData) => void
}

export default function QRCodeGenerator({ onQRCreated }: QRCodeGeneratorProps) {
  const [formData, setFormData] = useState({
    name: '',
    destinationUrl: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [generatedQR, setGeneratedQR] = useState<QRCodeData | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'QR code name is required'
    }

    if (!formData.destinationUrl.trim()) {
      newErrors.destinationUrl = 'Destination URL is required'
    } else {
      try {
        new URL(formData.destinationUrl)
      } catch {
        newErrors.destinationUrl = 'Please enter a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create QR code')
      }

      setGeneratedQR(data)
      onQRCreated(data)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create QR code' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({ name: '', destinationUrl: '', description: '' })
    setGeneratedQR(null)
    setErrors({})
  }

  const copyShortUrl = async () => {
    if (!generatedQR) return
    
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/r/${generatedQR.shortCode}`
    
    try {
      await navigator.clipboard.writeText(shortUrl)
      alert('Short URL copied to clipboard!')
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shortUrl
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Short URL copied to clipboard!')
    }
  }

  const downloadQR = () => {
    if (!generatedQR) return
    
    const svg = document.getElementById('generated-qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    canvas.width = 512
    canvas.height = 512
    
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512)
      const pngFile = canvas.toDataURL('image/png')
      
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-${generatedQR.shortCode}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const shortUrl = generatedQR ? 
    `${process.env.NEXT_PUBLIC_BASE_URL}/r/${generatedQR.shortCode}` : ''

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Generate New QR Code</h2>
        {generatedQR && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Create Another
          </button>
        )}
      </div>

      {!generatedQR ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Company Website"
              disabled={loading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="destinationUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Destination URL *
            </label>
            <input
              id="destinationUrl"
              type="url"
              value={formData.destinationUrl}
              onChange={(e) => setFormData({...formData, destinationUrl: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.destinationUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com"
              disabled={loading}
            />
            {errors.destinationUrl && <p className="mt-1 text-sm text-red-600">{errors.destinationUrl}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of this QR code..."
              disabled={loading}
            />
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating QR Code...
              </span>
            ) : (
              'Generate QR Code'
            )}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your QR Code is Ready!</h3>
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <QRCode
                id="generated-qr-code"
                value={shortUrl}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{generatedQR.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Short URL:</span>
                <p className="text-gray-900 break-all">{shortUrl}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Destination:</span>
                <p className="text-gray-900 break-all">{generatedQR.destinationUrl}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <p className="text-gray-900">{new Date(generatedQR.createdAt).toLocaleString()}</p>
              </div>
              {generatedQR.description && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900">{generatedQR.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={copyShortUrl}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Copy Short URL
            </button>
            <button
              onClick={downloadQR}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Download PNG
            </button>
          </div>
        </div>
      )}
    </div>
  )
}