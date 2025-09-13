export const dynamic = "force-dynamic"
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackQRScan } from '@/lib/analytics'
import { decryptQRData } from '@/lib/encryption'

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

    if (qrCode.targetUrl) {
      try {
        const dTargetUrl = decryptQRData(qrCode.targetUrl)
        const finalTargetURl = dTargetUrl.targetUrl ? dTargetUrl.targetUrl : qrCode.targetUrl
        return NextResponse.redirect(new URL(finalTargetURl), {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Surrogate-Control": "no-store",
          },
        })
      } catch (error) {
        console.error('Error decrypting target URL:', error)
        return new NextResponse('Error processing QR code', { status: 500 })
      }

    }
    try {
      const dContent = decryptQRData(qrCode.content)
      const finalContent = dContent.originalContent ? dContent.originalContent : qrCode.content
      return NextResponse.json({ content: finalContent })
    } catch (error) {
      console.error('Error decrypting content:', error)
      return new NextResponse('Error processing QR code', { status: 500 })
    }

  } catch (error) {
    console.error('Error processing QR scan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}