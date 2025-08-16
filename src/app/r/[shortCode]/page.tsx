import { redirect } from 'next/navigation'
import { prisma } from '../../../lib/db'
import { headers } from 'next/headers'

interface RedirectPageProps {
  params: { shortCode: string }
}

async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = params

  if (!shortCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600 mb-6">
            The QR code link is invalid or malformed.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to QR Generator
          </a>
        </div>
      </div>
    )
  }

  try {
    // Find the QR code by short code
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode }
    })

    if (!qrCode) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Code Not Found</h1>
            <p className="text-gray-600 mb-6">
              The QR code you're looking for doesn't exist or has been removed.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to QR Generator
            </a>
          </div>
        </div>
      )
    }

    // Get headers for logging
    const headersList = await headers()
    const userAgent = headersList.get('user-agent')
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')

    // Log the scan
    try {
      await prisma.scan.create({
        data: {
          qrCodeId: qrCode.id,
          userAgent: userAgent || null,
          ipAddress: forwarded || realIp || null
        }
      })

      // Update scan count
      await prisma.qRCode.update({
        where: { id: qrCode.id },
        data: { scanCount: { increment: 1 } }
      })
    } catch (error) {
      console.error('Error logging scan:', error)
      // Continue with redirect even if logging fails
    }

    // Redirect to destination
    redirect(qrCode.destinationUrl)

  } catch (error) {
    console.error('Redirect error:', error)
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Processing Request</h1>
          <p className="text-gray-600 mb-6">
            An error occurred while processing the QR code redirect.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to QR Generator
          </a>
        </div>
      </div>
    )
  }
}

export default RedirectPage