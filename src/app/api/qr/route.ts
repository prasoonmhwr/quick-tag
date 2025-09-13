import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { formatQRData, generateQRCode } from '@/lib/qr-generator'
import { auth } from '@clerk/nextjs/server'
import { userHasDynamicAccess } from '@/lib/billing'
import { decryptQRData, encryptQRData } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    const allowed = await userHasDynamicAccess(userId)
    if (!allowed) {
      return NextResponse.json({ error: "Dynamic access required" }, { status: 402 })
    }
    const body = await request.json()
    const {
      title,
      type,
      data,
      targetUrl,
      size = 256,
      foregroundColor = '#000000',
      errorCorrection = 'M',
      additionalData,
      logo,
      dotsStyle,
      dotColor,
      dotColorType,
      dotGradientType,
      dotGradientRotation,
      dotGradient,

      backgroundColor,
      backgroundType,
      backgroundGradientType,
      backgroundGradientRotation,
      backgroundGradient,

      cornersSquareStyle,
      cornerSquareColorType,
      cornerSquareGradientType,
      cornerSquareGradientRotation,
      cornerSquareColor,
      cornerSquareGradient,

      cornerDotStyle,
      cornerDotColorType,
      cornerDotColor,
      cornerDotGradientType,
      cornerDotGradientRotation,
      cornerDotGradient,
      imageSize
    } = body
    const styleConfig = JSON.stringify({
      dotsStyle,
      dotColor,
      dotColorType,
      dotGradientType,
      dotGradientRotation,
      dotGradient,

      backgroundColor,
      backgroundType,
      backgroundGradientType,
      backgroundGradientRotation,
      backgroundGradient,

      cornersSquareStyle,
      cornerSquareColorType,
      cornerSquareGradientType,
      cornerSquareGradientRotation,
      cornerSquareColor,
      cornerSquareGradient,

      cornerDotStyle,
      cornerDotColorType,
      cornerDotColor,
      cornerDotGradientType,
      cornerDotGradientRotation,
      cornerDotGradient,
      imageSize
    })
    // Generate short ID for the QR code
    const shortId = nanoid(8)

    // Format the content based on type
    const content = formatQRData(type, data, additionalData)

    // For dynamic QR codes, we'll redirect through our API
    const finalTargetUrl = targetUrl || (type === 'url' ? content : null)
    const encryptedContent = encryptQRData({
      originalContent: content,
      data: data,
      additionalData: additionalData
    })


    const encryptedTargetUrl = finalTargetUrl ? encryptQRData({
      targetUrl: finalTargetUrl
    }) : null
    const dataUrl = `${process.env.NEXT_PUBLIC_APP_URL}/qr/${shortId}`
    const qrCode = await prisma.qRCode.create({
      data: {
        shortId,
        title,
        type: type.toUpperCase(),
        content: encryptedContent,
        targetUrl: encryptedTargetUrl,
        foregroundColor,
        backgroundColor,
        errorCorrection,
        logo,
        dataUrl,
        styleConfig
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
    const responseQrCode = {
      ...qrCode,
      content: decryptQRData(qrCode.content).originalContent,
      targetUrl: qrCode.targetUrl ? decryptQRData(qrCode.targetUrl).targetUrl : null
    }

    return NextResponse.json(responseQrCode)
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
    for (const qrCode of qrCodes) {
      if (qrCode.targetUrl) {
        try {
          const dTargetUrl = decryptQRData(qrCode.targetUrl)
          qrCode.targetUrl = dTargetUrl.targetUrl ? dTargetUrl.targetUrl : null

        } catch (error) {
          console.error('Error decrypting target URL:', error)
          return new NextResponse('Error processing QR code', { status: 500 })
        }
      } else {

        try {
          const dContent = decryptQRData(qrCode.content)
          qrCode.content = dContent.originalContent ? dContent.originalContent : qrCode.content

        } catch (error) {
          console.error('Error decrypting content:', error)
          return new NextResponse('Error processing QR code', { status: 500 })
        }
      }
    }
    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 })
  }
}