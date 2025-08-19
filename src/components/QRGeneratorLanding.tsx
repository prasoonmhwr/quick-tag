'use client'
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Wifi, Mail, Phone, MessageSquare, Link, Type, Palette, Settings, Upload, X } from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

interface QRConfig {
  type: string;
  data: string;
  size: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
}

const QR_TYPES = [
  { id: 'url', label: 'URL', icon: Link, placeholder: 'https://example.com' },
  { id: 'text', label: 'Text', icon: Type, placeholder: 'Enter your text here' },
  { id: 'wifi', label: 'WiFi', icon: Wifi, placeholder: 'Network Name' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'email@example.com' },
  { id: 'phone', label: 'Phone', icon: Phone, placeholder: '+1234567890' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, placeholder: '+1234567890' }
];

function QRGeneratorLanding() {
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
  
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [smsMessage, setSmsMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [showCustomization, setShowCustomization] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateQRData = () => {
    switch (config.type) {
      case 'url':
        return config.data;
      case 'text':
        return config.data;
      case 'wifi':
        return `WIFI:T:${wifiSecurity};S:${config.data};P:${wifiPassword};;`;
      case 'email':
        return `mailto:${config.data}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${config.data}`;
      case 'sms':
        return `sms:${config.data}?body=${encodeURIComponent(smsMessage)}`;
      default:
        return config.data;
    }
  };

  useEffect(() => {
    const generateQR = async () => {
      const qrData = generateQRData();
      if (!qrData) {
        setQrDataUrl('');
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(qrData, {
          width: config.size,
          errorCorrectionLevel: config.errorCorrection,
          color: {
            dark: config.foregroundColor,
            light: config.backgroundColor
          },
          margin: 2
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
        setQrDataUrl('');
      }
    };

    generateQR();
  }, [config, wifiPassword, wifiSecurity, smsMessage, emailSubject, emailBody]);

  const downloadQR = async (format: 'png' | 'svg' | 'jpg') => {
    if (!qrRef.current || !qrDataUrl) return;

    try {
      if (format === 'png' || format === 'jpg') {
        const canvas = await html2canvas(qrRef.current, {
          backgroundColor: config.backgroundColor,
          scale: 2
        });
        
        const link = document.createElement('a');
        link.download = `qr-code.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
      } else if (format === 'svg') {
        const qrData = generateQRData();
        const svgString = await QRCode.toString(qrData, {
          type: 'svg',
          width: config.size,
          errorCorrectionLevel: config.errorCorrection,
          color: {
            dark: config.foregroundColor,
            light: config.backgroundColor
          }
        });
        
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'qr-code.svg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };
const removeLogo = () => {
    setLogoFile(null)
    setConfig(prev => ({ ...prev, logo: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
  const currentType = QR_TYPES.find(type => type.id === config.type);

  return (
   
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* QR Type Selection */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Type className="h-5 w-5 mr-2 text-blue-600" />
                QR Code Type
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {QR_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setConfig(prev => ({ ...prev, type: type.id, data: '' }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        config.type === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <Icon className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Fields */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                {currentType && <currentType.icon className="h-5 w-5 mr-2 text-blue-600" />}
                {currentType?.label} Details
              </h3>
              
              <div className="space-y-4">
                <div>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* WiFi Additional Fields */}
                {config.type === 'wifi' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Security Type</label>
                      <select
                        value={wifiSecurity}
                        onChange={(e) => setWifiSecurity(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Email Additional Fields */}
                {config.type === 'email' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject (Optional)</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Email subject"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                      <textarea
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Email message"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </>
                )}

                {/* SMS Additional Field */}
                {config.type === 'sms' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                    <textarea
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder="SMS message"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                )}
              </div>
            </div>

           
          </div>

          {/* Right Column - QR Code Preview */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">QR Code Preview</h3>
              
              <div className="flex justify-center mb-6">
                <div 
                  ref={qrRef}
                  className="bg-white p-6 rounded-2xl shadow-lg border-4 border-gray-100"
                  style={{ backgroundColor: config.backgroundColor }}
                >
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="Generated QR Code" 
                      className="max-w-full h-auto"
                      style={{ width: config.size, height: config.size }}
                    />
                  ) : (
                    <div 
                      className="bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500"
                      style={{ width: config.size, height: config.size }}
                    >
                      <div className="text-center">
                        <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Enter data to generate QR code</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {qrDataUrl && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">Download your QR code</p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => downloadQR('png')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PNG
                      </button>
                      <button
                        onClick={() => downloadQR('jpg')}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        JPG
                      </button>
                      <button
                        onClick={() => downloadQR('svg')}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        SVG
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

             {/* Customization Options */}
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
      </main>

      
  
  );
}

export default QRGeneratorLanding;