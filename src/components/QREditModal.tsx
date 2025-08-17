'use client'

import React, { useState } from 'react'
import { X, Save } from 'lucide-react'

interface QRCodeData {
  id: string
  shortId: string
  title: string
  type: string
  content: string
  targetUrl?: string
  isActive: boolean
  size: number
  foregroundColor: string
  backgroundColor: string
  errorCorrection: string
}

interface QREditModalProps {
  qr: QRCodeData
  onClose: () => void
  onSave: () => void
}

export function QREditModal({ qr, onClose, onSave }: QREditModalProps) {
  const [formData, setFormData] = useState({
    title: qr.title,
    targetUrl: qr.targetUrl || '',
    isActive: qr.isActive,
    size: qr.size,
    foregroundColor: qr.foregroundColor,
    backgroundColor: qr.backgroundColor,
    errorCorrection: qr.errorCorrection,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/qr/${qr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave()
      } else {
        alert('Failed to update QR code')
      }
    } catch (error) {
      console.error('Error updating QR code:', error)
      alert('Failed to update QR code')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {qr.targetUrl !== null && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
              <input
                type="url"
                value={formData.targetUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active (QR code is scannable)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Size (px)</label>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={formData.size}
              onChange={(e) => setFormData(prev => ({ ...prev, size: parseInt(e.target.value) }))}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{formData.size}px</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foreground Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.foregroundColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, foregroundColor: e.target.value }))}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.foregroundColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, foregroundColor: e.target.value }))}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Error Correction</label>
            <select
              value={formData.errorCorrection}
              onChange={(e) => setFormData(prev => ({ ...prev, errorCorrection: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}