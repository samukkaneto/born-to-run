import type { Metadata, Viewport } from 'next'
import { Inter, Bebas_Neue, Oswald } from 'next/font/google'
import PwaProvider from '@/components/pwa/PwaProvider'
import VercelObservability from '@/components/observability/VercelObservability'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

/** Títulos condensados atléticos — identidade editorial Born to Run */
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
})

/** Subtítulos condensados (Oswald SemiBold) */
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-oswald',
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
    apple: '/icons/icon-192.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Born to Run',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#DC2626',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`light bg-[#F7F4EF] ${inter.variable} ${bebasNeue.variable} ${oswald.variable}`}
    >
      <body className="font-sans antialiased text-[#171717]">
        <PwaProvider>{children}</PwaProvider>
        <VercelObservability enabled={process.env.VERCEL === '1'} />
      </body>
    </html>
  )
}
