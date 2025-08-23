import { NextResponse } from "next/server";
import { userHasDynamicAccess } from "@/lib/billing";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }


    const allowed = await userHasDynamicAccess(userId)

    return NextResponse.json({ allowed });
  } catch (error) {
    console.error("Access check failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}