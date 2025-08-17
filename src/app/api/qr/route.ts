import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { formatQRData } from '@/lib/qr-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      type,
      data,
      targetUrl,
      size = 256,
      foregroundColor = '#000000',
      backgroundColor = '#ffffff',
      errorCorrection = 'M',
      additionalData
    } = body

    // Generate short ID for the QR code
    const shortId = nanoid(8)

    // Format the content based on type
    const content = formatQRData(type, data, additionalData)

    // For dynamic QR codes, we'll redirect through our API
    const finalTargetUrl = targetUrl || (type === 'url' ? content : null)

    const qrCode = await prisma.qRCode.create({
      data: {
        shortId,
        title,
        type: type.toUpperCase(),
        content,
        targetUrl: finalTargetUrl,
        size,
        foregroundColor,
        backgroundColor,
        errorCorrection,
      }
    })

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error('Error creating QR code:', error)
    return NextResponse.json({ error: 'Failed to create QR code' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const qrCodes = await prisma.qRCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { scans: true }
        }
      }
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 })
  }
}