import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Figtree } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/heysalad/auth-provider'
import './globals.css'

const figtree = Figtree({ 
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: 'HeySalad — Hardware Prototyping AI',
  description: 'AI-powered 3D enclosure design, PCB fitting, and 3D printer management. Powered by HeySalad.',
  generator: 'v0.app',
  keywords: ['HeySalad', '3D printing', 'PCB', 'enclosure design', 'hardware prototyping', 'CAD', 'AI'],
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${figtree.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
