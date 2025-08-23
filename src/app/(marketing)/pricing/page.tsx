import { auth } from "@clerk/nextjs/server"
import PricingCard from "@/components/pricingCard"

export default async function PricingPage() {
  const { userId } = await auth()
  return <div className="min-h-screen flex items-center justify-center  bg-gradient-to-br from-blue-50 via-white to-purple-50"><PricingCard /></div>
}