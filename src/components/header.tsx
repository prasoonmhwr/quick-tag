'use client'

import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-2">
            <div className="bg-white rounded-lg">
              <img className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" src="/logo.svg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gray-900 bg-clip-text text-transparent">
                <span className='font-[kantithin]'>Quick</span><span className='font-[doto]'>Tag</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
      
      <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-900 text-white shadow-md hover:shadow-lg transition">
        Get Dynamic
      </button>
    </div>
        </div>
      </div>
    </header>
  )
}