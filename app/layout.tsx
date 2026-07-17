import type { Metadata, Viewport } from 'next'
import { Inter, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Born to Run — Treinamento e Saúde',
  description:
    'Equipe de corrida de rua, caminhada e assessoria esportiva. Treinos para todos os níveis, do iniciante ao atleta experiente. Saúde, qualidade de vida e performance.',
  keywords: [
    'corrida de rua',
    'assessoria esportiva',
    'treinamento funcional',
    'caminhada',
    'saúde',
    'qualidade de vida',
    'Born to Run',
  ],
  authors: [{ name: 'Born to Run Treinamento e Saúde' }],
  openGraph: {
    title: 'Born to Run — Treinamento e Saúde',
    description:
      'Sua transformação começa com o primeiro passo. Assessoria esportiva especializada em corrida e caminhada.',
    type: 'website',
    locale: 'pt_BR',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#DC2626',
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`light bg-[#F9F7F5] ${inter.variable} ${barlowCondensed.variable}`}
    >
      <body className="font-sans antialiased text-[#1C1917]">
        {children}
      </body>
    </html>
  )
}
