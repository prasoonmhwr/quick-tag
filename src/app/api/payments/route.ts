import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userPayments = await prisma.transaction.findMany({
      where: {
        userId: userId
      },
      select:{
        id:true,
        amount: true,
        invoiceId: true,
        status: true,
        userId: true,
        paymentDate: true,
      }
    });
    return NextResponse.json({
      success: true,
      message: 'Payment fetched successfully',
      data: userPayments,
    });

  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch payments'
      },
      { status: 500 }
    );
  }
}