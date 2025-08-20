import { Toaster } from 'sonner'
import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dynamic QR Code Generator',
  description: 'Create and manage dynamic QR codes that can be updated without changing the QR code image',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider afterSignOutUrl={'/'}>
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster richColors/>
      </body>
    </html>
    </ClerkProvider>
  )
}