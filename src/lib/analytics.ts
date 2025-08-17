import { prisma } from './prisma'

export async function trackQRScan(
  qrCodeId: string,
  request: Request
) {
  const userAgent = request.headers.get('user-agent') || ''
  const forwarded = request.headers.get('x-forwarded-for')
  const ipAddress = forwarded ? forwarded.split(',')[0] : '127.0.0.1'

  // Simple user agent parsing (in production, use a proper library)
  const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'Mobile' : 'Desktop'
  const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                 userAgent.includes('Firefox') ? 'Firefox' : 
                 userAgent.includes('Safari') ? 'Safari' : 'Other'
  const os = userAgent.includes('Windows') ? 'Windows' :
            userAgent.includes('Mac') ? 'macOS' :
            userAgent.includes('Linux') ? 'Linux' :
            userAgent.includes('Android') ? 'Android' :
            userAgent.includes('iOS') ? 'iOS' : 'Other'

  try {
    await prisma.qRScan.create({
      data: {
        qrCodeId,
        ipAddress,
        userAgent,
        device,
        browser,
        os,
        // In production, you'd use a geolocation service
        country: 'Unknown',
        city: 'Unknown',
      }
    })
  } catch (error) {
    console.error('Error tracking QR scan:', error)
  }
}

export async function getQRAnalytics(qrCodeId: string) {
  const [totalScans, recentScans, deviceStats, browserStats] = await Promise.all([
    // Total scans
    prisma.qRScan.count({
      where: { qrCodeId }
    }),

    // Recent scans (last 30 days)
    prisma.qRScan.findMany({
      where: {
        qrCodeId,
        scannedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { scannedAt: 'desc' },
      take: 100
    }),

    // Device breakdown
    prisma.qRScan.groupBy({
      by: ['device'],
      where: { qrCodeId },
      _count: { device: true }
    }),

    // Browser breakdown
    prisma.qRScan.groupBy({
      by: ['browser'],
      where: { qrCodeId },
      _count: { browser: true }
    })
  ])

  // Group scans by date for chart
  const scansByDate = recentScans.reduce((acc:any, scan:any) => {
    const date = scan.scannedAt.toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalScans,
    recentScans: recentScans.length,
    scansByDate,
    deviceStats: deviceStats.map((stat:any) => ({
      name: stat.device,
      value: stat._count.device
    })),
    browserStats: browserStats.map((stat:any) => ({
      name: stat.browser,
      value: stat._count.browser
    }))
  }
}