
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.dynamicAccess.findUnique({
      where: {
        userId: userId
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });

  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch users'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
    try {
        const { userId } = await auth();
            
            if (!userId) {
              return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
              );
            }
        
        const { numberOfQR } = await request.json();

        if (!numberOfQR) {
            return NextResponse.json({ error: 'Error updating user for update' }, { status: 400 });
        }

        
        const user = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            numberOfQR: numberOfQR,
          },
        });

        return NextResponse.json({ message: `User updated for ` });

    } catch (error) {
        console.error('Error updating resume analysis:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to update resume analysis', details: errorMessage },
            { status: 500 }
        );
    }
}