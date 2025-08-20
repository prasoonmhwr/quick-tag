export const dynamic = "force-dynamic"
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackQRScan } from '@/lib/analytics'

export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    // const { userId } = await auth();

    // if (!userId) {
    //   return NextResponse.json(
    //     { success: false, message: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
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
      return NextResponse.redirect(new URL(qrCode.targetUrl),{
  headers: {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
  },
})
    }

    // For static QR codes, return the content
    return NextResponse.json({ content: qrCode.content })
  } catch (error) {
    console.error('Error processing QR scan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}