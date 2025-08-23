import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server';
import { userHasDynamicAccess } from '@/lib/billing';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      targetUrl,
      isActive,
      size,
      foregroundColor,
      backgroundColor,
      errorCorrection,
      logo
    } = body

    const qrCode = await prisma.qRCode.update({
      where: { id: params.id },
      data: {
        title,
        targetUrl,
        isActive,
        foregroundColor,
        backgroundColor,
        errorCorrection,
        logo,
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    await prisma.userToCode.deleteMany({
      where: {
        userId:userId,
        qrcodeId: params.id
      }
    })
    await prisma.qRCode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting QR code:', error)
    return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 })
  }
}