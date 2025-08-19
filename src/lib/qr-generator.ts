import QRCode from 'qrcode'

export interface QRConfig {
  type: string
  data: string
  size?: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  foregroundColor: string
  backgroundColor: string
  logo?: string
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
    width: config.size || 256,
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(config.data, options)
    
    // If no logo, return the basic QR code
    if (!config.logo) {
      return qrDataUrl
    }
    
    // Add logo to QR code
    return await addLogoToQR(qrDataUrl, config.logo, config.size || 256)
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

async function addLogoToQR(qrDataUrl: string, logoDataUrl: string, qrSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }
    
    canvas.width = qrSize
    canvas.height = qrSize
    
    const qrImage = new Image()
    qrImage.onload = () => {
      // Draw QR code
      ctx.drawImage(qrImage, 0, 0, qrSize, qrSize)
      
      const logoImage = new Image()
      logoImage.onload = () => {
        // Calculate logo size (about 20% of QR code size)
        const logoSize = qrSize * 0.2
        const logoX = (qrSize - logoSize) / 2
        const logoY = (qrSize - logoSize) / 2
        
        // Add white background circle for logo
        const padding = logoSize * 0.1
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(qrSize / 2, qrSize / 2, (logoSize + padding) / 2, 0, 2 * Math.PI)
        ctx.fill()
        
        // Draw logo
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
        
        resolve(canvas.toDataURL('image/png'))
      }
      
      logoImage.onerror = () => reject(new Error('Failed to load logo'))
      logoImage.src = logoDataUrl
    }
    
    qrImage.onerror = () => reject(new Error('Failed to load QR code'))
    qrImage.src = qrDataUrl
  })
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