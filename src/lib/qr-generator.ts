import QRCodeStyling, { CornerDotType, CornerSquareType, DotType, GradientType } from 'qr-code-styling'
import QRCode from 'qrcode'

export interface QRConfig {
  type: string
  data: string
  size: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'

  dotsStyle: DotType
  dotColor: string,
  dotColorType: 'single' | 'gradient',
  dotGradientType: GradientType,
  dotGradientRotation: number,
  dotGradient: {
    type: GradientType,
    rotation: number,
    colorStops: { offset: number, color: string }[]
  },

  backgroundColor: string,
  backgroundType: 'single' | 'gradient',
  backgroundGradientType: GradientType,
  backgroundGradientRotation: number,
  backgroundGradient: {
    type: GradientType,
    rotation: number,
    colorStops: { offset: number, color: string }[]
  },

  cornersSquareStyle: CornerSquareType,
  cornerSquareColorType: 'single' | 'gradient',
  cornerSquareGradientType: GradientType,
  cornerSquareGradientRotation: number,
  cornerSquareColor: string,
  cornerSquareGradient: {
    type: GradientType,
    rotation: number,
    colorStops: { offset: number, color: string }[]
  },

  cornerDotStyle: CornerDotType,
  cornerDotColorType: 'single' | 'gradient',
  cornerDotColor: string,
  cornerDotGradientType: GradientType,
  cornerDotGradientRotation: number,
  cornerDotGradient: {
    type: GradientType,
    rotation: number,
    colorStops: { offset: number, color: string }[]
  },
  imageSize: number,
  logo?: string
}

export async function generateQRCode(config: QRConfig): Promise<{ qrFinal: string, qrDataUrl: QRCodeStyling }> {


  try {
    const qrDataUrl = new QRCodeStyling({
      width: config.size,
      height: config.size,
      type: 'svg',
      data: config.data,
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
    let qrFinal = ''
    const blob = await qrDataUrl.getRawData('png')

    if (blob) {
      // Wrap FileReader in a Promise to properly await it
      qrFinal = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read blob as data URL'));
        };
        reader.readAsDataURL(blob as Blob);
      });


    }

    if (!config.logo) {
      return {qrFinal,qrDataUrl};
    }
    // // Add logo to QR code
    return {qrFinal:await addLogoToQR(qrFinal, config.logo, config.size || 256),qrDataUrl}
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