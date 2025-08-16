import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params

    if (!shortCode) {
      return NextResponse.json(
        { error: 'Invalid short code' },
        { status: 400 }
      )
    }

    // Find the QR code by short code
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode }
    })

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      )
    }

    // Log the scan
    try {
      await prisma.scan.create({
        data: {
          qrCodeId: qrCode.id,
          userAgent: request.headers.get('user-agent') || null,
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') ||
                    null
        }
      })

      // Update scan count
      await prisma.qRCode.update({
        where: { id: qrCode.id },
        data: { scanCount: { increment: 1 } }
      })
    } catch (error) {
      console.error('Error logging scan:', error)
      // Continue with redirect even if logging fails
    }

    // Return the destination URL for client-side redirect
    return NextResponse.json({ 
      destinationUrl: qrCode.destinationUrl,
      name: qrCode.name,
      shortCode: qrCode.shortCode
    })

  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}