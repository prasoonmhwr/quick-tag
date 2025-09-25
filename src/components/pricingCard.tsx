
"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "./ui/skeleton";
import { useAuth } from '@clerk/nextjs';
import { useRouter } from "next/navigation";
export default function PricingCard() {
  const { userId } = useAuth();
  const router = useRouter();

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    async function createCheckout() {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const { url } = await res.json()
      setCheckoutUrl(url)
    }

    createCheckout()
  }, [userId])

  if (!checkoutUrl) return <div className="space-y-2"><button disabled>Loading...</button> <Skeleton className="h-4 w-[250px] bg-orange-500 opacity-10" /><Skeleton className="h-4 w-[250px] bg-gray-500" /></div>
  async function refreshAccess() {
    const res = await fetch(`/api/access-check?userId=${userId}`);
    const allowed = await res.json();
    if (!allowed.allowed) {
      router.push("/pricing");
    }else{
      router.push("/dashboard");
    }
  }
  return (
    <section className="relative flex ">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-3xl font-semibold tracking-tight text-gray-900">
                Unlock <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">Dynamic QR</span>
              </h3>
              <p className="mt-3 text-gray-600">
                Edit destinations after print. Track scans in real time. Manage campaigns.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-900" /> Real-time URL updates
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-900" /> Scan analytics & geo insights
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-900" /> Short links & branding
                </li>
                {/* <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-900" /> Campaign folders
                </li> */}
              </ul>
            </div>

            <div className="shrink-0 rounded-2xl border border-gray-200 bg-white/70 p-6 text-center">
              <div className="text-4xl font-bold text-gray-900">$5</div>
              <div className="text-xs uppercase tracking-wider text-gray-500">per month</div>

              {checkoutUrl && <a
                href={checkoutUrl}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 transition"
              >
                Get Dynamic QR
              </a>}

              <p className="mt-3 text-xs text-gray-500">
                Secure checkout via Polar
              </p>
              <div className="mt-4 text-[11px] text-gray-400">
                Cancel anytime
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-gray-500">
          Already purchased?{" "}
          <button onClick={refreshAccess} className="underline cursor-pointer">Refresh access</button>
        </p>
      </div>
    </section>
  )
}
