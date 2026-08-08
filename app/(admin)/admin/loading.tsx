/** Skeleton de carregamento do painel do treinador. */
export default function AdminLoading() {
  return (
    <div className="animate-fade-in space-y-8" aria-busy="true" aria-label="Carregando painel">
      <div className="space-y-3">
        <div className="h-3 w-40 animate-pulse rounded bg-[#E7E5E4]" />
        <div className="h-12 w-2/3 animate-pulse rounded bg-[#E7E5E4]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-[#E7E5E4]" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card space-y-4 p-5">
            <div className="h-11 w-11 animate-pulse rounded-lg bg-[#E7E5E4]" />
            <div className="h-9 w-16 animate-pulse rounded bg-[#E7E5E4]" />
            <div className="h-3 w-24 animate-pulse rounded bg-[#E7E5E4]" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card flex items-center gap-4 p-5">
            <div className="h-11 w-11 animate-pulse rounded-lg bg-[#E7E5E4]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-[#E7E5E4]" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-[#E7E5E4]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
