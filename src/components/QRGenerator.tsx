'use client'

import React, { useState, useEffect, useRef, type SetStateAction, type Dispatch } from 'react'
import {  Link, Type, Wifi, Mail, Phone, MessageSquare, Settings, Download, Upload, X } from 'lucide-react'
import { generateQRCode, formatQRData } from '@/lib/qr-generator'

import { toast } from 'sonner'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import QRCodeStyling, { CornerDotType, CornerSquareType, DotType, GradientType } from 'qr-code-styling'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
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

const DOT_TYPES: DotType[] = [
  "square",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "extra-rounded"
];
const CORNER_SQUARE_TYPES: CornerSquareType[] = [
  "square",
  "extra-rounded",
]

const CORNER_DOT_TYPES: CornerDotType[] = [
  "square",
  "dot",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "extra-rounded",
]
export function QRGenerator({setDialogOpen}: {setDialogOpen: Dispatch<SetStateAction<boolean>>}) {
  const [qrMode, setQrMode] = useState<'static' | 'dynamic'>('static')
   const [config, setConfig] = useState({
      title: '',
      type: 'url',
      data: '',
      targetUrl: '',
      errorCorrection: 'M' as 'L' | 'M' | 'Q' | 'H',
  
      logo: '',
      size: 256,
      dotsStyle: "square" as DotType,
      dotColor: '#000000',
      dotColorType: 'single' as 'single' | 'gradient',
      dotGradientType: 'linear' as GradientType,
      dotGradientRotation: 0,
      dotGradient: {
        type: "linear" as GradientType,
        rotation: 0,
        colorStops: [{ offset: 0, color: '#000000' }, { offset: 1, color: '#000000' }]
      },
  
      backgroundColor: '#ffffff',
      backgroundType: 'single' as 'single' | 'gradient',
      backgroundGradientType: 'linear' as GradientType,
      backgroundGradientRotation: 0,
      backgroundGradient: {
        type: "linear" as GradientType,
        rotation: 0,
        colorStops: [{ offset: 0, color: '#ffffff' }, { offset: 1, color: '#ffffff' }]
      },
  
      cornersSquareStyle: 'square' as CornerSquareType,
      cornerSquareColorType: 'single' as 'single' | 'gradient',
      cornerSquareGradientType: 'linear' as GradientType,
      cornerSquareGradientRotation: 0,
      cornerSquareColor: '#000000',
      cornerSquareGradient: {
        type: "linear" as GradientType,
        rotation: 0,
        colorStops: [{ offset: 0, color: '#000000' }, { offset: 1, color: '#000000' }]
      },
  
      cornerDotStyle: 'square' as CornerDotType,
      cornerDotColorType: 'single' as 'single' | 'gradient',
      cornerDotColor: '#000000',
      cornerDotGradientType: 'linear' as GradientType,
      cornerDotGradientRotation: 0,
      cornerDotGradient: {
        type: "linear" as GradientType,
        rotation: 0,
        colorStops: [{ offset: 0, color: '#000000' }, { offset: 1, color: '#000000' }]
      },
      imageSize: 0.4
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
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);

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
      const {qrFinal,qrDataUrl} = await generateQRCode({
            ...config,
            data: formattedData,
            size: 256,
          })
          setQrDataUrl(qrFinal)
          setQrCode(qrDataUrl);
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

  const downloadQR = async (format: 'png' | 'svg' | 'jpeg') => {
    if (qrCode) {
      const blob = await qrCode.getRawData(format);
      if (blob) {
        const url = URL.createObjectURL(blob as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code.${format}`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  useEffect(() => {
    if(qrMode === 'static') {
       const additionalData = {
        security: wifiSecurity,
        password: wifiPassword,
        subject: emailSubject,
        body: emailBody,
        message: smsMessage,
      }

      const qrData = formatQRData(config.type, config.data, additionalData)
          
          if (!qrData) {
            setQrDataUrl('');
            return;
          }
          const qr = new QRCodeStyling({
            width: config.size,
            height: config.size,
            type: 'svg',
            data: qrData,
            dotsOptions: {
              color: config.dotColor,
              type: config.dotsStyle,
              gradient: config.dotColorType == "gradient" ? config.dotGradient : undefined
            },
            cornersSquareOptions: {
              type: config.cornersSquareStyle,
              color: config.cornerSquareColor,
              gradient: config.cornerSquareColorType == "gradient" ? config.cornerSquareGradient : undefined
            },
            cornersDotOptions: {
              type: config.cornerDotStyle,
              color: config.cornerDotColor,
              gradient: config.cornerDotColorType == "gradient" ? config.cornerDotGradient : undefined
            },
            backgroundOptions: {
              color: config.backgroundColor,
              gradient: config.backgroundType == "gradient" ? config.backgroundGradient : undefined
            },
            image: config.logo || undefined,
            imageOptions: {
              crossOrigin: 'anonymous',
              margin: 5,
              imageSize: config.imageSize
            },
            qrOptions: {
              errorCorrectionLevel: config.errorCorrection,
              mode: 'Byte'
            }
          });
          setQrCode(qr);
          qr.getRawData('png').then((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                setQrDataUrl(reader.result as string);
              };
              reader.readAsDataURL(blob as Blob);
            }
          });
    }
  }, [config, wifiSecurity, wifiPassword, emailSubject, emailBody, smsMessage])

  async function generateDynamicQR() {
    
    if (!config.data.trim() || !config.title.trim()) {
      toast.warning('Please fill in the title and data fields')
      return
    }
    setIsGenerating(true)
    await generateQR()
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
                      onClick={() => downloadQR('jpeg')}
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

              


              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-0"
              >
                <AccordionItem value="item-0">
                  <AccordionTrigger>Basic Customization</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Error Correction</label>
                        <Select
                          value={config.errorCorrection}
                          onValueChange={(value) => setConfig(prev => ({ ...prev, errorCorrection: value as 'L' | 'M' | 'Q' | 'H' }))}

                        >
                          <SelectTrigger className="w-full border border-gray-300 outline-none py-2">
                            <SelectValue placeholder="Select a error correction" />
                          </SelectTrigger>
                          <SelectContent className='bg-white border border-gray-300'>
                            <SelectGroup>
                              <SelectItem value="L">Low (7%)</SelectItem>
                              <SelectItem value="M">Medium (15%)</SelectItem>
                              <SelectItem value="Q">Quartile (25%)</SelectItem>
                              <SelectItem value="H">High (30%)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div >
                          <label className="block text-sm font-medium text-gray-700 mb-2 ">Logo Size</label>
                          <input
                            type="number"
                            value={config.imageSize}
                            max={1.0}
                            min={0.1}
                            step={0.1}
                            onChange={(e) => {
                              const size = parseFloat(e.target.value)
                              
                              setConfig(prev => ({ ...prev, imageSize: size }))
                            } 
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                          />
                        </div>
                    </div>

                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Dots Customization</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dot Type</label>
                        <Select value={config.dotsStyle} onValueChange={(value) => {  setConfig(prev => ({ ...prev, dotsStyle: value as DotType })) }}>
                          <SelectTrigger className="w-full border border-gray-300">
                            <SelectValue placeholder="Select a dot type" />
                          </SelectTrigger>
                          <SelectContent className='bg-white border border-gray-300'>
                            <SelectGroup>
                              {DOT_TYPES.map((dType, index) => {
                                return <SelectItem key={index} value={dType}>{dType}</SelectItem>
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Type</label>
                        <RadioGroup defaultValue="single" value={config.dotColorType} className='flex h-[50%]' onValueChange={(value) => setConfig(prev => ({ ...prev, dotColorType: value as 'single' | 'gradient' }))}>
                          <div className="flex items-center h-full gap-3">
                            <RadioGroupItem value="single" id="r1" />
                            <Label htmlFor="r1">Single</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="gradient" id="r2" />
                            <Label htmlFor="r2">Gradient</Label>
                          </div>

                        </RadioGroup>
                      </div>
                    </div>
                    {config.dotColorType == 'gradient' &&
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                        <div >
                          <label className="block text-sm font-medium text-gray-700 mb-2 ">Gradient Type</label>
                          <RadioGroup defaultValue="linear" value={config.dotGradientType} className='flex h-[50%]' onValueChange={(value) => setConfig(prev => ({ ...prev, dotGradientType: value as GradientType, dotGradient: { ...prev.dotGradient, type: value as GradientType } }))}>
                            <div className="flex items-center h-full gap-3">
                              <RadioGroupItem value="linear" id="r1" />
                              <Label htmlFor="r1">Linear</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="radial" id="r2" />
                              <Label htmlFor="r2">Radial</Label>
                            </div>

                          </RadioGroup>
                        </div>
                        <div >
                          <label className="block text-sm font-medium text-gray-700 mb-2 ">Rotation</label>
                          <input
                            type="number"
                            value={config.dotGradientRotation}
                            onChange={(e) => {
                              const rotation = parseInt(e.target.value) || 0
                              setConfig(prev => ({ ...prev, dotGradientRotation: rotation, dotGradient: { ...prev.dotGradient, rotation } }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                          />
                        </div>
                      </div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {config.dotColorType == 'single' && <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dot Color  </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.dotColor}
                            onChange={(e) => setConfig(prev => ({ ...prev, dotColor: e.target.value }))}
                            className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.dotColor}
                            onChange={(e) => setConfig(prev => ({ ...prev, dotColor: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                          />
                        </div>
                      </div>}
                      {config.dotColorType == 'gradient' && <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Dot Color Start</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={config.dotGradient.colorStops[0].color}
                              onChange={(e) => {
                                const newGrad = { type: config.dotGradientType as GradientType, rotation: config.dotGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: config.dotGradient.colorStops[1].color }] }
                                setConfig(prev => ({ ...prev, dotGradient: newGrad }))
                              }}
                              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.dotGradient.colorStops[0].color}
                              onChange={(e) => {
                                const newGrad = { type: config.dotGradientType as GradientType, rotation: config.dotGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: config.dotGradient.colorStops[1].color }] }
                                setConfig(prev => ({ ...prev, dotGradient: newGrad }))
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Dot Color End</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={config.dotGradient.colorStops[1].color}
                              onChange={(e) => {
                                const newGrad = { type: config.dotGradientType as GradientType, rotation: config.dotGradientRotation, colorStops: [{ offset: 0, color: config.dotGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                                setConfig(prev => ({ ...prev, dotGradient: newGrad }))
                              }}
                              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.dotGradient.colorStops[1].color}
                              onChange={(e) => {
                                const newGrad = { type: config.dotGradientType as GradientType, rotation: config.dotGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: config.dotGradient.colorStops[1].color }] }
                                setConfig(prev => ({ ...prev, dotGradient: newGrad }))
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                            />
                          </div></div></>}

                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Corner Square Customization</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Corner Square Type</label>
                        <Select value={config.cornersSquareStyle} onValueChange={(value) => {  setConfig(prev => ({ ...prev, cornersSquareStyle: value as CornerSquareType })) }}>
                          <SelectTrigger className="w-full border border-gray-300">
                            <SelectValue placeholder="Select a corner type" />
                          </SelectTrigger>
                          <SelectContent className='bg-white border border-gray-300'>
                            <SelectGroup>
                              {CORNER_SQUARE_TYPES.map((cornerType, index) => {
                                return <SelectItem key={index} value={cornerType}>{cornerType}</SelectItem>
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Type</label>
                        <RadioGroup defaultValue="single" value={config.cornerSquareColorType} className='flex h-[50%]' onValueChange={(value) => setConfig(prev => ({ ...prev, cornerSquareColorType: value as 'single' | 'gradient' }))}>
                          <div className="flex items-center h-full gap-3">
                            <RadioGroupItem value="single" id="r1" />
                            <Label htmlFor="r1">Single</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="gradient" id="r2" />
                            <Label htmlFor="r2">Gradient</Label>
                          </div>

                        </RadioGroup>
                      </div>
                    </div>
                    {config.cornerSquareColorType == 'gradient' &&
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                        <div >
                          <label className="block text-sm font-medium text-gray-700 mb-2 ">Gradient Type</label>
                          <RadioGroup defaultValue="linear" value={config.cornerSquareGradientType} className='flex h-[50%]' onValueChange={(value) => setConfig(prev => ({ ...prev, cornerSquareGradientType: value as GradientType, cornerSquareGradient: { ...prev.cornerSquareGradient, type: value as GradientType } }))}>
                            <div className="flex items-center h-full gap-3">
                              <RadioGroupItem value="linear" id="r1" />
                              <Label htmlFor="r1">Linear</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="radial" id="r2" />
                              <Label htmlFor="r2">Radial</Label>
                            </div>

                          </RadioGroup>
                        </div>
                        <div >
                          <label className="block text-sm font-medium text-gray-700 mb-2 ">Rotation</label>
                          <input
                            type="number"
                            value={config.cornerSquareGradientRotation}
                            onChange={(e) => {
                              const rotation = parseInt(e.target.value) || 0
                              setConfig(prev => ({ ...prev, cornerSquareGradientRotation: rotation, cornerSquareGradient: { ...prev.cornerSquareGradient, rotation } }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                          />
                        </div>
                      </div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {config.cornerSquareColorType == 'single' && <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Corner Square Color  </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.cornerSquareColor}
                            onChange={(e) => setConfig(prev => ({ ...prev, cornerSquareColor: e.target.value }))}
                            className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.cornerSquareColor}
                            onChange={(e) => setConfig(prev => ({ ...prev, cornerSquareColor: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                          />
                        </div>
                      </div>}
                      {config.cornerSquareColorType == 'gradient' && <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Corner Square Color Start</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={config.cornerSquareGradient.colorStops[0].color}
                              onChange={(e) => {
                                const newGrad = { type: config.cornerSquareGradientType as GradientType, rotation: config.cornerSquareGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: config.cornerSquareGradient.colorStops[1].color }] }
                                setConfig(prev => ({ ...prev, cornerSquareGradient: newGrad }))
                              }}
                              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.cornerSquareGradient.colorStops[0].color}
                              onChange={(e) => {
                                const newGrad = { type: config.cornerSquareGradientType as GradientType, rotation: config.cornerSquareGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: config.cornerSquareGradient.colorStops[1].color }] }
                                setConfig(prev => ({ ...prev, cornerSquareGradient: newGrad }))
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Corner Square Color End</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={config.cornerSquareGradient.colorStops[1].color}
                              onChange={(e) => {
                                const newGrad = { type: config.cornerSquareGradientType as GradientType, rotation: config.cornerSquareGradientRotation, colorStops: [{ offset: 0, color: config.cornerSquareGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                                setConfig(prev => ({ ...prev, cornerSquareGradient: newGrad }))
                              }}
                              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.cornerSquareGradient.colorStops[1].color}
                              onChange={(e) => {
                                const newGrad = { type: config.cornerSquareGradientType as GradientType, rotation: config.cornerSquareGradientRotation, colorStops: [{ offset: 0, color: config.cornerSquareGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                                setConfig(prev => ({ ...prev, cornerSquareGradient: newGrad }))
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                            />
                          </div></div></>}

                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Corner Dot Customization</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Type</label>
                        <Select value={config.cornerDotStyle} onValueChange={(value) => {  setConfig(prev => ({ ...prev, cornerDotStyle: value as CornerDotType })) }}>
                          <SelectTrigger className="w-full border border-gray-300">
                            <SelectValue placeholder="Select a corner type" />
                          </SelectTrigger>
                          <SelectContent className='bg-white border border-gray-300'>
                            <SelectGroup>
                              {CORNER_DOT_TYPES.map((cornerType, index) => {
                                return <SelectItem key={index} value={cornerType}>{cornerType}</SelectItem>
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Type</label>
                        <RadioGroup defaultValue="single" value={config.cornerDotColorType} className='flex h-[50%]' onValueChange={(value) => setConfig(prev => ({ ...prev, cornerDotColorType: value as 'single' | 'gradient' }))}>
                          <div className="flex items-center h-full gap-3">
                            <RadioGroupItem value="single" id="r1" />
                            <Label htmlFor="r1">Single</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="gradient" id="r2" />
                            <Label htmlFor="r2">Gradient</Label>
                          </div>

                        </RadioGroup>
                      </div>
                    </div>
                    {config.cornerDotColorType == 'gradient' &&
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                        <div >
                          <label className="block text-sm font-medium text-gray-700 mb-2 ">Gradient Type</label>
                          <RadioGroup defaultValue="linear" value={config.cornerDotGradientType} className='flex h-[50%]' onValueChange={(value) => setConfig(prev => ({ ...prev, cornerDotGradientType: value as GradientType, cornerDotGradient: { ...prev.cornerDotGradient, type: value as GradientType } }))}>
                            <div className="flex items-center h-full gap-3">
                              <RadioGroupItem value="linear" id="r1" />
                              <Label htmlFor="r1">Linear</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="radial" id="r2" />
                              <Label htmlFor="r2">Radial</Label>
                            </div>

                          </RadioGroup>
                        </div>
                        <div >
                          <label className="block text-sm font-medium text-gray-700 mb-2 ">Rotation</label>
                          <input
                            type="number"
                            value={config.cornerDotGradientRotation}
                            onChange={(e) => {
                              const rotation = parseInt(e.target.value) || 0
                              setConfig(prev => ({ ...prev, cornerDotGradientRotation: rotation, cornerDotGradient: { ...prev.cornerDotGradient, rotation } }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                          />
                        </div>
                      </div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {config.cornerDotColorType == 'single' && <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Color  </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.cornerDotColor}
                            onChange={(e) => setConfig(prev => ({ ...prev, cornerDotColor: e.target.value }))}
                            className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.cornerDotColor}
                            onChange={(e) => setConfig(prev => ({ ...prev, cornerDotColor: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                          />
                        </div>
                      </div>}
                      {config.cornerDotColorType == 'gradient' && <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Color Start</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={config.cornerDotGradient.colorStops[0].color}
                              onChange={(e) => {
                                const newGrad = { type: config.cornerDotGradientType as GradientType, rotation: config.cornerDotGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: config.cornerDotGradient.colorStops[1].color }] }
                                setConfig(prev => ({ ...prev, cornerDotGradient: newGrad }))
                              }}
                              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.cornerDotGradient.colorStops[0].color}
                              onChange={(e) => {
                                const newGrad = { type: config.cornerDotGradientType as GradientType, rotation: config.cornerDotGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: config.cornerDotGradient.colorStops[1].color }] }
                                setConfig(prev => ({ ...prev, cornerDotGradient: newGrad }))
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Color End</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={config.cornerDotGradient.colorStops[1].color}
                              onChange={(e) => {
                                const newGrad = { type: config.cornerDotGradientType as GradientType, rotation: config.cornerDotGradientRotation, colorStops: [{ offset: 0, color: config.cornerDotGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                                setConfig(prev => ({ ...prev, cornerDotGradient: newGrad }))
                              }}
                              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.cornerDotGradient.colorStops[1].color}
                              onChange={(e) => {
                                const newGrad = { type: config.cornerDotGradientType as GradientType, rotation: config.cornerDotGradientRotation, colorStops: [{ offset: 0, color: config.cornerDotGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                                setConfig(prev => ({ ...prev, cornerDotGradient: newGrad }))
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                            />
                          </div></div></>}

                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Background Customization</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                     
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
                        <RadioGroup defaultValue="single" value={config.backgroundType} className='flex h-[50%]' onValueChange={(value) => setConfig(prev => ({ ...prev, backgroundType: value as 'single' | 'gradient' }))}>
                          <div className="flex items-center h-full gap-3">
                            <RadioGroupItem value="single" id="r1" />
                            <Label htmlFor="r1">Single</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value="gradient" id="r2" />
                            <Label htmlFor="r2">Gradient</Label>
                          </div>

                        </RadioGroup>
                      </div>
                    </div>
                    {config.backgroundType == 'gradient' &&
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                        <div >
                          <label className="block text-sm font-medium text-gray-700 mb-2 ">Gradient Type</label>
                          <RadioGroup defaultValue="linear" value={config.backgroundGradientType} className='flex h-[50%]' onValueChange={(value) => setConfig(prev => ({ ...prev, backgroundGradientType: value as GradientType, backgroundGradient: { ...prev.backgroundGradient, type: value as GradientType } }))}>
                            <div className="flex items-center h-full gap-3">
                              <RadioGroupItem value="linear" id="r1" />
                              <Label htmlFor="r1">Linear</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="radial" id="r2" />
                              <Label htmlFor="r2">Radial</Label>
                            </div>

                          </RadioGroup>
                        </div>
                        <div >
                          <label className="block text-sm font-medium text-gray-700 mb-2 ">Rotation</label>
                          <input
                            type="number"
                            value={config.backgroundGradientRotation}
                            onChange={(e) => {
                              const rotation = parseInt(e.target.value) || 0
                              setConfig(prev => ({ ...prev, backgroundGradientRotation: rotation, backgroundGradient: { ...prev.backgroundGradient, rotation } }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                          />
                        </div>
                      </div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {config.backgroundType == 'single' && <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color  </label>
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
                      </div>}
                      {config.backgroundType == 'gradient' && <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color Start</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={config.backgroundGradient.colorStops[0].color}
                              onChange={(e) => {
                                const newGrad = { type: config.backgroundGradientType as GradientType, rotation: config.backgroundGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: config.backgroundGradient.colorStops[1].color }] }
                                setConfig(prev => ({ ...prev, backgroundGradient: newGrad }))
                              }}
                              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.backgroundGradient.colorStops[0].color}
                              onChange={(e) => {
                                const newGrad = { type: config.backgroundGradientType as GradientType, rotation: config.backgroundGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: config.backgroundGradient.colorStops[1].color }] }
                                setConfig(prev => ({ ...prev, backgroundGradient: newGrad }))
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Color End</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={config.backgroundGradient.colorStops[1].color}
                              onChange={(e) => {
                                const newGrad = { type: config.cornerDotGradientType as GradientType, rotation: config.backgroundGradientRotation, colorStops: [{ offset: 0, color: config.backgroundGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                                setConfig(prev => ({ ...prev, backgroundGradient: newGrad }))
                              }}
                              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.cornerSquareGradient.colorStops[1].color}
                             onChange={(e) => {
                                const newGrad = { type: config.cornerDotGradientType as GradientType, rotation: config.backgroundGradientRotation, colorStops: [{ offset: 0, color: config.backgroundGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                                setConfig(prev => ({ ...prev, backgroundGradient: newGrad }))
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                            />
                          </div></div></>}

                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>


            </div>
          </div>
        </div>
      </div>
    </>
  )
}