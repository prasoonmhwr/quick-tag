
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Feature from '@/components/feature'
import QRGeneratorLanding from '@/components/QRGeneratorLanding'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="min-h-[calc(100vh-280px)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-18">
          {/* Background gradient blob */}
          <div className="absolute inset-0 -z-20">
            <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-orange-300 via-pink-300 to-purple-300 opacity-30 blur-3xl" />
          </div>

          

          <div className="max-w-5xl mx-auto px-6 text-center relative">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 leading-[1.1]">
              Generate
              <span className="relative mx-2 inline-block">
                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Dynamic
                </span>
              </span>
              & Static
              <br />
              <span className="text-gray-800">QR Codes</span>
            </h2>

            <p className="mt-8 text-lg sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-[kantithin]">
              Design QR codes that don’t just work — but look stunning.
              Fully customizable, brand-ready, and trackable with real-time analytics.
            </p>

           
          </div>
        </section>

        <QRGeneratorLanding />
        <Feature />
      </main>

      <Footer />
    </div>
  )
}