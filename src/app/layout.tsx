import type { Metadata } from 'next'
import { Open_Sans, Jost } from 'next/font/google'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Adaptieve AI Toetsapplicatie - HAN',
  description: 'AI-ondersteund toetsen in HAN huisstijl',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={`${openSans.variable} ${jost.variable} font-sans bg-neutral-50 min-h-screen`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
} 