'use client'

import React, { useState, useEffect, useRef, type SetStateAction, type Dispatch } from 'react'
import {  Link, Type, Wifi, Mail, Phone, MessageSquare, Settings, Download, Upload, X } from 'lucide-react'
import { generateQRCode, formatQRData } from '@/lib/qr-generator'

import { toast } from 'sonner'
const QR_TYPES = [
  { id: 'url', label: 'URL', icon: Link, placeholder: 'https://example.com' },
  { id: 'text', label: 'Text', icon: Type, placeholder: 'Enter your text here' },
  { id: 'wifi', label: 'WiFi', icon: Wifi, placeholder: 'Network Name' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'user@example.com' },
  { id: 'phone', label: 'Phone', icon: Phone, placeholder: '+1234567890' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, placeholder: '+1234567890' },
]

// Static QR Types - No tracking, permanent content
const STATIC_QR_TYPES = [
  { id: 'text', label: 'Text', icon: Type, placeholder: 'Enter your text here', description: 'Displays plain text' },
  { id: 'url', label: 'URL', icon: Link, placeholder: 'https://example.com', description: 'Open a url' },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi, placeholder: 'Network Name', description: 'Connect to a Wi-Fi network' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, placeholder: '+1234567890', description: 'Send a text message' },
  { id: 'vcard', label: 'vCard', icon: Phone, placeholder: 'Contact Name', description: 'Share and store your contact details' },
  { id: 'whatsapp', label: 'Whatsapp', icon: MessageSquare, placeholder: '+1234567890', description: 'Send a WhatsApp message' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'user@example.com', description: 'Send an email with a predefined text' },
]

// Dynamic QR Types - With tracking and analytics
const DYNAMIC_QR_TYPES = [
  { id: 'website', label: 'Website', icon: Link, placeholder: 'https://example.com', description: 'Open a URL' },
  { id: 'pdf', label: 'PDF', icon: Type, placeholder: 'PDF Title', description: 'Show a PDF' },
  { id: 'images', label: 'Images', icon: Type, placeholder: 'Gallery Title', description: 'Show an image gallery' },
  { id: 'vcard_plus', label: 'vCard Plus', icon: Phone, placeholder: 'Contact Name', description: 'Share contact details' },
  { id: 'video', label: 'Video', icon: Type, placeholder: 'Video Title', description: 'Show a video' },
  { id: 'list_links', label: 'List of links', icon: Type, placeholder: 'Link Collection', description: 'Group links' },
  { id: 'social_media', label: 'Social Media', icon: Type, placeholder: 'Profile Name', description: 'Share your social profiles' },
  { id: 'mp3', label: 'MP3', icon: Type, placeholder: 'Audio Title', description: 'Play an audio file' },
  { id: 'business', label: 'Business', icon: Type, placeholder: 'Business Name', description: 'Share information about your business' },
  { id: 'coupon', label: 'Coupon', icon: Type, placeholder: 'Coupon Title', description: 'Share a coupon' },
  { id: 'apps', label: 'Apps', icon: Type, placeholder: 'App Name', description: 'Redirect to an app store' },
  { id: 'landing_page', label: 'Landing page', icon: Type, placeholder: 'Page Title', description: 'Create your own page' },
  { id: 'product', label: 'Product', icon: Type, placeholder: 'Product Name', description: 'Group information about your product' },
  { id: 'event', label: 'Event', icon: Type, placeholder: 'Event Name', description: 'Promote and share an event' },
  { id: 'menu', label: 'Menu', icon: Type, placeholder: 'Restaurant Name', description: 'Display the menu of a restaurant or bar' },
  { id: 'feedback', label: 'Feedback', icon: Type, placeholder: 'Feedback Form', description: 'Collect feedback and get rated' },
  { id: 'playlist', label: 'Playlist', icon: Type, placeholder: 'Playlist Name', description: 'Share your own music' },
  { id: 'barcode_2d', label: '2D Barcode', icon: Type, placeholder: 'Barcode Data', description: 'Supports GS1 standards' },
]
export function QRGenerator({setDialogOpen}: {setDialogOpen: Dispatch<SetStateAction<boolean>>}) {
  const [qrMode, setQrMode] = useState<'static' | 'dynamic'>('static')
  const [config, setConfig] = useState({
    title: '',
    type: 'url',
    data: '',
    targetUrl: '',
    errorCorrection: 'M' as 'L' | 'M' | 'Q' | 'H',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    logo: '',
    size: 256,
  })

  const [wifiSecurity, setWifiSecurity] = useState('WPA')
  const [wifiPassword, setWifiPassword] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const qrRef = useRef<HTMLDivElement>(null)
  const currentType = QR_TYPES.find(type => type.id === config.type)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoDataUrl = e.target?.result as string
        setConfig(prev => ({ ...prev, logo: logoDataUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setConfig(prev => ({ ...prev, logo: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateQR = async () => {
    if (!config.data.trim()) {
      setQrDataUrl(null)
      return
    }

    setIsGenerating(true)
    try {
      const additionalData = {
        security: wifiSecurity,
        password: wifiPassword,
        subject: emailSubject,
        body: emailBody,
        message: smsMessage,
      }

      const formattedData = formatQRData(config.type, config.data, additionalData)
      const dataUrl = await generateQRCode({
        ...config,
        data: formattedData,
        size: 256,
      })
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveQRCode = async () => {
    if (!config.data.trim() || !config.title.trim()) {
      toast.warning('Please fill in the title and data fields')
      return
    }

    try {
      const additionalData = {
        security: wifiSecurity,
        password: wifiPassword,
        subject: emailSubject,
        body: emailBody,
        message: smsMessage,
      }

      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          targetUrl: qrMode === 'dynamic' ? config.targetUrl : null,
          additionalData,
        }),
      })

      if (response.ok) {
        toast.success('QR Code saved successfully!')
        // Reset form
        setConfig(prev => ({ ...prev, title: '', data: '', targetUrl: '', logo: '' }))
        setLogoFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setQrDataUrl(null)
        setDialogOpen(false)
        // Trigger refresh of QR list
        window.dispatchEvent(new CustomEvent('qr-list-refresh'))
      } else {
        toast.error('Failed to save QR code')
      }
    } catch (error) {
      console.error('Error saving QR code:', error)
      toast.error('Failed to save QR code')
    }
  }

  const downloadQR = (format: string) => {
    if (qrDataUrl) {
      const link = document.createElement('a')
      link.download = `${config.title || 'qrcode'}.${format}`
      link.href = qrDataUrl
      link.click()
    }
  }

  useEffect(() => {
    if(qrMode === 'static') {
      generateQR()
    }
  }, [config, wifiSecurity, wifiPassword, emailSubject, emailBody, smsMessage])

  async function generateDynamicQR() {
    
      console.log(config)
    if (!config.data.trim() || !config.title.trim()) {
      toast.warning('Please fill in the title and data fields')
      return
    }
    setIsGenerating(true)
    // await generateQR()
    await saveQRCode()
     setIsGenerating(false)
  }
  return (
    <>
      {/* QR Mode Switcher */}
      <div className="flex justify-center mb-8 sm:mb-12">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 border border-gray-200/50 shadow-lg">
          <div className="flex">
            <button
              onClick={() => setQrMode('static')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${qrMode === 'static'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Static QR
            </button>
            <button
              onClick={() => setQrMode('dynamic')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${qrMode === 'dynamic'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Dynamic QR
            </button>
          </div>
        </div>
      </div>

      {/* Mode Description */}


      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
        {/* Left Column - Configuration */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Title Field */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">QR Code Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a title for your QR code"
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
              />
            </div>
          </div>

          {/* QR Type Selection */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Type className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              QR Code Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {QR_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setConfig(prev => ({ ...prev, type: type.id, data: '' }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation text-left ${config.type === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-6 w-6 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{type.label}</div>

                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Input Fields */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {currentType && <currentType.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />}
              {currentType?.label} Details
            </h3>

            <div className="space-y-4">
              {!(qrMode === 'dynamic' && config.type === 'url') && <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {config.type === 'wifi' ? 'Network Name (SSID)' :
                    config.type === 'email' ? 'Email Address' :
                      config.type === 'phone' || config.type === 'sms' ? 'Phone Number' :
                        currentType?.label}
                </label>
                <input
                  type={config.type === 'url' ? 'url' : config.type === 'email' ? 'email' : 'text'}
                  value={config.data}
                  onChange={(e) => setConfig(prev => ({ ...prev, data: e.target.value }))}
                  placeholder={currentType?.placeholder}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                />
              </div>}

              {/* Dynamic QR Target URL */}
              {qrMode === 'dynamic' && config.type === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target URL (can be changed later)</label>
                  <input
                    type="url"
                    value={config.targetUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, targetUrl: e.target.value, data:e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                  />
                </div>
              )}

              {/* Additional fields for different types */}
              {config.type === 'wifi' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Security Type</label>
                    <select
                      value={wifiSecurity}
                      onChange={(e) => setWifiSecurity(e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">No Password</option>
                    </select>
                  </div>
                  {wifiSecurity !== 'nopass' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="WiFi password"
                        className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    </div>
                  )}
                </>
              )}

              {config.type === 'email' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject (Optional)</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject"
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Email message"
                      rows={3}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                    />
                  </div>
                </>
              )}

              {config.type === 'sms' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                  <textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="SMS message"
                    rows={3}
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                  />
                </div>
              )}
            </div>

            {qrMode === 'dynamic' && <div className='flex justify-end'>
             <button
                onClick={generateDynamicQR}
                disabled={isGenerating}
                className=" mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium touch-manipulation disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...':'Generate QR Code'} 
              </button>
            </div>}
          </div>

     

        </div>

        {/* Right Column - QR Code Preview */}
        <div className="space-y-6 order-1 lg:order-2">
         {qrMode == 'static' && <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200/50 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 text-center">QR Code Preview</h3>

            <div className="flex justify-center mb-4 sm:mb-6">
               <div
                ref={qrRef}
                className="bg-white p-3 sm:p-4 lg:p-6 rounded-2xl shadow-lg border-4 border-gray-100"
                style={{ backgroundColor: config.backgroundColor }}
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    className="max-w-full h-auto"
                    style={{
                      width: Math.min(config.size, 280),
                      height: Math.min(config.size, 280),
                      maxWidth: '100%'
                    }}
                  />
                ) : (
                  <div
                    className="bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500"
                    style={{
                      width: Math.min(config.size, 280),
                      height: Math.min(config.size, 280),
                      maxWidth: '100%'
                    }}
                  >
                    <div className="text-center p-4">
                      <img className="h-8 w-8 sm:h-12 sm:w-12 text-gray-900" src="/qr-shape.svg" />
                      {/* <QrCode className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" /> */}
                      <p className="text-xs sm:text-sm">
                        {isGenerating ? 'Generating...' : 'Enter data to generate QR code'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {qrDataUrl && (
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
                  {/* {qrMode === 'dynamic' && <button
                    onClick={saveQRCode}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium touch-manipulation"
                  >
                    Save QR Code {qrMode === 'dynamic' ? '(with Analytics)' : ''}
                  </button>} */}
                </div>
              </div>
            )}
          </div>}

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              Customization Options
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <div className="space-y-3">
                    {!logoFile ? (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                          <Upload className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Upload Logo</span>
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={config.logo}
                              alt="Logo preview"
                              className="w-10 h-10 object-cover rounded"
                            />
                            <span className="text-sm text-gray-700 truncate">{logoFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Recommended: Square image, PNG/JPG, max 2MB
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Error Correction</label>
                  <select
                    value={config.errorCorrection}
                    onChange={(e) => setConfig(prev => ({ ...prev, errorCorrection: e.target.value as 'L' | 'M' | 'Q' | 'H' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foreground Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config.foregroundColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.foregroundColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.backgroundColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}