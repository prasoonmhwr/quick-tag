import { prisma } from "@/lib/prisma"

export async function userHasDynamicAccess(userId: string | null | undefined) {
  if (!userId) return false
  const a = await prisma.dynamicAccess.findUnique({ where: { userId } })
  if (!a) return false
  // Simple rule: status must be "active"
  return a.status === "active"
}