import { NextRequest, NextResponse } from 'next/server'
import { getQRAnalytics } from '@/lib/analytics'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analytics = await getQRAnalytics(params.id)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}