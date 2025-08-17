import { QRGenerator } from '@/components/QRGenerator'
import { QRList } from '@/components/QRList'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="min-h-[calc(100vh-280px)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Generate Dynamic & Static QR Codes
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Create custom QR codes for URLs, text, WiFi, email, phone numbers, and SMS.
            Fast, free, and fully customizable with analytics.
          </p>
        </div>

        <QRGenerator />
        <QRList />
      </main>

      <Footer />
    </div>
  )
}