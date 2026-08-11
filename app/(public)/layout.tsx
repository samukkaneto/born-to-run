import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main id="main-content" className="pt-[76px] md:pt-[96px]">
        {children}
      </main>
      <Footer />
    </>
  )
}
