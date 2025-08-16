import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid QR code ID' },
        { status: 400 }
      )
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: {
        scans: {
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        _count: {
          select: { scans: true }
        }
      }
    })

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error('Error fetching QR code:', error)
    return NextResponse.json(
      { error: 'Failed to fetch QR code' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, destinationUrl, description } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid QR code ID' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!name || !destinationUrl) {
      return NextResponse.json(
        { error: 'Name and destination URL are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(destinationUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const updatedQR = await prisma.qRCode.update({
      where: { id },
      data: {
        name,
        destinationUrl,
        description,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedQR)
  } catch (error) {
    console.error('Error updating QR code:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update QR code' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid QR code ID' },
        { status: 400 }
      )
    }

    await prisma.qRCode.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'QR code deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting QR code:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete QR code' },
      { status: 500 }
    )
  }
}