import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import PwaProvider from '@/components/pwa/PwaProvider'
import VercelObservability from '@/components/observability/VercelObservability'
import './globals.css'

const inter = localFont({
  src: './fonts/Inter-Variable.ttf',
  weight: '100 900',
  style: 'normal',
  variable: '--font-inter',
  display: 'swap',
})

/** Títulos condensados atléticos — identidade editorial Born to Run */
const bebasNeue = localFont({
  src: './fonts/BebasNeue-Regular.ttf',
  weight: '400',
  style: 'normal',
  variable: '--font-bebas',
  display: 'swap',
})

/** Subtítulos condensados (Oswald SemiBold) */
const oswald = localFont({
  src: './fonts/Oswald-Variable.ttf',
  weight: '500 700',
  style: 'normal',
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
        <VercelObservability
          enabled={process.env.VERCEL === '1' && Boolean(process.env.VERCEL_ENV)}
        />
      </body>
    </html>
  )
}
