import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { formatQRData, generateQRCode } from '@/lib/qr-generator'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
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
      additionalData,
      logo
    } = body

    // Generate short ID for the QR code
    const shortId = nanoid(8)

    // Format the content based on type
    const content = formatQRData(type, data, additionalData)

    // For dynamic QR codes, we'll redirect through our API
    const finalTargetUrl = targetUrl || (type === 'url' ? content : null)
    // const config = {
    //   type: type,
    //   errorCorrection: errorCorrection,
    //   foregroundColor: foregroundColor,
    //   backgroundColor: backgroundColor,
    //   logo: logo
    // }
    // const dataUrl = await generateQRCode({
    //   ...config,
    //   data: `${process.env.NEXT_PUBLIC_APP_URL}/qr/${shortId}`,
    //   size: 256,
    // })
    const dataUrl = `${process.env.NEXT_PUBLIC_APP_URL}/qr/${shortId}`
    const qrCode = await prisma.qRCode.create({
      data: {
        shortId,
        title,
        type: type.toUpperCase(),
        content,
        targetUrl: finalTargetUrl,
        foregroundColor,
        backgroundColor,
        errorCorrection,
        logo,
        dataUrl
      }
    })
await prisma.userToCode.upsert({
      where: {
        userId_qrcodeId: {
          userId,
          qrcodeId: qrCode.id
        }
      },
      update: {},
      create: {
        userId,
        qrcodeId: qrCode.id
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    const qrCodes = await prisma.qRCode.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        userToCodes: {
          some: {
            userId: userId,
          },
        },
      },
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