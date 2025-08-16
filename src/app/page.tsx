'use client'
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Wifi, Mail, Phone, MessageSquare, Link, Type, Palette, Settings } from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRCodeGenerator from '@/components/QRCodeGenerator';

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

function App() {
  const [config, setConfig] = useState<QRConfig>({
    type: 'url',
    data: '',
    size: 288,
    errorCorrection: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff'
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [smsMessage, setSmsMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showCustomization, setShowCustomization] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

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

  const currentType = QR_TYPES.find(type => type.id === config.type);
  const handleQRCreated = (newQR: any) => {
    console.log('New QR Code Created:', newQR);
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  QuickTag
                </h1>
                {/* <p className="text-sm text-gray-600">Free QR Code Generator</p> */}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-250px)] max-w-6xl mx-auto px-4 py-8 overflow-y-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Generate QR Codes Instantly
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create custom QR codes for URLs, text, WiFi, email, phone numbers, and SMS.
            Fast, free, and fully customizable.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
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
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${config.type === type.id
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

            {/* Customization Options */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 mb-4"
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Customization Options
                </div>
                {/* <div className={`transform transition-transform duration-200 ${showCustomization ? 'rotate-180' : ''}`}>
                  ▼
                </div> */}
              </button>

              {/* {showCustomization && ( */}
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size (px)</label>
                    <input
                      type="range"
                      min="128"
                      max="512"
                      step="32"
                      value={config.size}
                      onChange={(e) => setConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600">{config.size}px</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Error Correction</label>

                    <Select value={config.errorCorrection} onValueChange={(e) => setConfig(prev => ({ ...prev, errorCorrection: e as 'L' | 'M' | 'Q' | 'H' }))}>
                      <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Select a fruit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Error Correction</SelectLabel>
                          <SelectItem value="L">Low (7%)</SelectItem>
                          <SelectItem value="M">Medium (15%)</SelectItem>
                          <SelectItem value="Q">Quartile (25%)</SelectItem>
                          <SelectItem value="H">High (30%)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* )} */}
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

            {/* Features */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose QuickTag?</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  100% Free - No registration required
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Privacy-focused - Generated locally in your browser
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Multiple formats - PNG, JPG, SVG downloads
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                  High quality - Scalable vector graphics support
                </div>
              </div>
            </div>
          </div>
          {/* <QRCodeGenerator onQRCreated={handleQRCreated}/> */}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-transparent text-white pb-8 mt-0 relative bottom-0 w-full max-h-[200px] overflow-hidden">
        <div className="max-w-6xl mx-auto flex justify-center">
          <h2 className="text-5xl md:text-[300px] font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none">
            QUICKTAG
          </h2>
        </div>
      </footer>
    </div>
  );
}

export default App;