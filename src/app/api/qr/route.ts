import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, destinationUrl, description } = body
    
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
    
    // Generate unique short code
    let shortCode = generateShortCode()
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      const existing = await prisma.qRCode.findUnique({ 
        where: { shortCode } 
      })
      
      if (!existing) {
        break
      }
      
      shortCode = generateShortCode()
      attempts++
    }
    
    if (attempts === maxAttempts) {
      return NextResponse.json(
        { error: 'Unable to generate unique short code' },
        { status: 500 }
      )
    }

    const qrCode = await prisma.qRCode.create({
      data: {
        name,
        destinationUrl,
        description,
        shortCode
      }
    })

    return NextResponse.json(qrCode, { status: 201 })
  } catch (error) {
    console.error('Error creating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to create QR code' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { destinationUrl: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const qrCodes = await prisma.qRCode.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        _count: {
          select: { scans: true }
        }
      }
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    )
  }
}