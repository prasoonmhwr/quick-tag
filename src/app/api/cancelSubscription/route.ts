import { cancelSubscription } from "@/lib/polar";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }
        const { subscriptionId } = await req.json();
        if (!subscriptionId) {
            return NextResponse.json({ message: "Missing subscriptionId" }, { status: 400 });
        }
        const result = await cancelSubscription(subscriptionId);
        return NextResponse.json({ message: "Subscription cancellation initiated", result });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}