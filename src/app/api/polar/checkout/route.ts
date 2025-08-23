import { NextResponse } from "next/server"
import { createCheckoutSessionForUser } from "@/lib/polar"
export async function POST(req: Request) {
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const res = await createCheckoutSessionForUser(userId)
    if (!res) {
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
    }

  return NextResponse.json({ url: res })
}