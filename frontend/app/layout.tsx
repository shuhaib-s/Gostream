import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ToastProvider } from '@/components/Toast'
import { APP_CONFIG } from '@/lib/constants'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `${APP_CONFIG.NAME} - ${APP_CONFIG.TAGLINE}`,
  description: APP_CONFIG.DESCRIPTION,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen bg-dark-bg-primary">
            <Navbar />
            <main>
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}


