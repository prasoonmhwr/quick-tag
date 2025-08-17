import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackQRScan } from '@/lib/analytics'

export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortId: params.shortId }
    })

    if (!qrCode || !qrCode.isActive) {
      return NextResponse.json({ error: 'QR Code not found' }, { status: 404 })
    }

    // Track the scan
    await trackQRScan(qrCode.id, request)

    // Redirect to target URL for dynamic QR codes
    if (qrCode.targetUrl) {
      return NextResponse.redirect(qrCode.targetUrl)
    }

    // For static QR codes, return the content
    return NextResponse.json({ content: qrCode.content })
  } catch (error) {
    console.error('Error processing QR scan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}