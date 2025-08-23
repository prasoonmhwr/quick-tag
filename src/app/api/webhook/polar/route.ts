
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Webhook } from "standardwebhooks";


export async function POST(req: NextRequest) {
  try {
    const secret = Buffer.from(process.env.POLAR_WEBHOOK_SECRET!).toString('base64')

    const webhook = new Webhook(secret);

    const raw = await req.text()
    const signature = req.headers.get('webhook-signature');
    const webhookId = req.headers.get('webhook-id');
    const webhookTimestamp = req.headers.get('webhook-timestamp');
    const webhookHeaders = {
      "webhook-id": webhookId || "",
      "webhook-signature": signature || "",
      "webhook-timestamp": webhookTimestamp || "",
    };
    const isValid = await webhook.verify(raw, webhookHeaders)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(raw)

    // Example event shapes (adjust to Polar’s actual event types/fields)
    // We expect metadata.userId (set on checkout link) and a status
    const type = event.type as string
    const data = event.data

    // Try to read userId from metadata regardless of event type
    const userId =
      data?.metadata?.userId ||
      data?.metadata?.user_id ||
      data?.customer?.metadata?.userId ||
      null
    if (!userId) {
      console.warn("[POLAR] webhook: missing userId in metadata", { type })
      return NextResponse.json({ received: true })
    }

    // Mark access active on events like: order paid / subscription active
    const shouldActivate =
      type?.includes("subscription")

    if (shouldActivate) {
      
      const status =
        data?.status ||
        data?.subscription?.status ||
        "active"

      const currentPeriodEnd =
        data?.current_period_end ||
        data?.subscription?.current_period_end ||
        null
     
      await prisma.dynamicAccess.upsert({
        where: { userId },
        update: {
          status,
          currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : null,
        },
        create: {
          userId,
          status,
          subscriptionId: data?.id || data?.subscription?.id || "",
          currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : null,
          cancel_at_period_end: type == 'subscription.canceled' ? data.cancel_at_period_end : false,
          provider: "polar",
        },
      })
    }

    if(type == "order.paid"){
      // Record the transaction
      const amount = data?.amount || data?.order?.amount || 0
      const invoiceId = data?.id || data?.order?.id || null
      const status = data?.status || data?.order?.status || "paid"
      const paymentDate = data?.created || data?.order?.created || null

      if(!invoiceId){
        console.warn("[POLAR] webhook: missing invoiceId", { type })
        return NextResponse.json({ received: true })
      }

      const existing = await prisma.transaction.findUnique({
        where: { invoiceId }
      })
      if(existing){
        return NextResponse.json({ received: true })
      }

      await prisma.transaction.create({
        data: {
          userId,
          amount,
          invoiceId,
          status,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        }
      })
    }


    return NextResponse.json({ received: true })
  } catch (e) {
    console.error("[POLAR] webhook error", e)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
export const revalidate = 0
