import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const notoSans = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto', weight: ['400', '700'] })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jb-mono' })

export const metadata: Metadata = {
  title: 'ダメージ倍率計算 | 無期迷途 シミュレータ',
  description: '無期迷途（Path to Nowhere）のパーティ編成からスキルダメージ倍率を計算するシミュレータ',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${notoSans.variable} ${mono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
