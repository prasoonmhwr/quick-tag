import QRCode from 'qrcode'

export interface QRConfig {
  type: string
  data: string
  size: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  foregroundColor: string
  backgroundColor: string
}

export async function generateQRCode(config: QRConfig): Promise<string> {
  const options = {
    errorCorrectionLevel: config.errorCorrection,
    type: 'image/png' as const,
    quality: 0.92,
    margin: 1,
    color: {
      dark: config.foregroundColor,
      light: config.backgroundColor,
    },
    width: config.size,
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(config.data, options)
    return qrDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export function formatQRData(type: string, data: string, additionalData?: any): string {
  switch (type) {
    case 'url':
      return data.startsWith('http') ? data : `https://${data}`
    
    case 'wifi':
      const { security, password } = additionalData || {}
      return `WIFI:T:${security};S:${data};P:${password || ''};H:false;;`
    
    case 'email':
      const { subject, body } = additionalData || {}
      let emailString = `mailto:${data}`
      const params = []
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
      if (body) params.push(`body=${encodeURIComponent(body)}`)
      if (params.length > 0) emailString += `?${params.join('&')}`
      return emailString
    
    case 'phone':
      return `tel:${data}`
    
    case 'sms':
      const { message } = additionalData || {}
      return message ? `sms:${data}?body=${encodeURIComponent(message)}` : `sms:${data}`
    
    case 'text':
    default:
      return data
  }
}