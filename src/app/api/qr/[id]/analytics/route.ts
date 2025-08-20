import { NextRequest, NextResponse } from 'next/server'
import { getQRAnalytics } from '@/lib/analytics'
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
 context: { params: Promise<{ id: string }> }  
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { id } = await context.params  
    const analytics = await getQRAnalytics(id)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}