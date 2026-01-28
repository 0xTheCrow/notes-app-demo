import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'
import { getServerSession } from 'next-auth'
import React, { ReactNode } from 'react'

const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notes App',
  description: 'Demo of Next.js notes app using AWS Cognito, API Gateway, nextauth.js',
}

const RootLayout: React.FC<{ children: ReactNode }> = async ({ children }) => {
  const session = await getServerSession()

  return (
    <html lang="en">
      <body className={montserrat.className}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
