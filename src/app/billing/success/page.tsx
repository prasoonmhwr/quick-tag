import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function BillingSuccess() {
  const { userId } = await auth()
  
  const access = userId
    ? await prisma.dynamicAccess.findUnique({ where: { userId } })
    : null
    if (!access || access.status !== "active") {
        redirect("/pricing")
    }
  return (
    <div className="h-screen w-full flex flex-col justify-center align-center bg-gradient-to-br from-blue-50 via-white to-purple-50 mx-auto py-20 px-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">You’re all set 🎉</h1>
      <p className="mt-2 text-gray-600">
        Dynamic QR is now unlocked for your account.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
        >
          Back to app
        </Link>
      </div>
      <p className="mt-4 text-xs text-gray-500">
        Having trouble? The webhook may take a few seconds. Try again shortly.
      </p>
    </div>
  )
}