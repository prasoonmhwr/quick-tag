import { NextRequest, NextResponse } from 'next/server'
import { getQRAnalytics } from '@/lib/analytics'
import { auth } from '@clerk/nextjs/server';
import { userHasDynamicAccess } from '@/lib/billing';

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
    const allowed = await userHasDynamicAccess(userId)
  if (!allowed) {
    return NextResponse.json({ error: "Dynamic access required" }, { status: 402 })
  }
    const { id } = await context.params  
    const analytics = await getQRAnalytics(id)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}