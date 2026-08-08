'use client'

import RouteError from '@/components/ui/RouteError'

export default function GlobalError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#F7F4EF] font-sans text-[#171717]">
        <RouteError {...props} />
      </body>
    </html>
  )
}
