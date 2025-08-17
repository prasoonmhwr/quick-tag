import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      title,
      targetUrl,
      isActive,
      size,
      foregroundColor,
      backgroundColor,
      errorCorrection
    } = body

    const qrCode = await prisma.qRCode.update({
      where: { id: params.id },
      data: {
        title,
        targetUrl,
        isActive,
        size,
        foregroundColor,
        backgroundColor,
        errorCorrection,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error('Error updating QR code:', error)
    return NextResponse.json({ error: 'Failed to update QR code' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.qRCode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting QR code:', error)
    return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 })
  }
}