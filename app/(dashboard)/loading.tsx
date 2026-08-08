export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando área do atleta…</span>
      <div className="h-12 w-2/3 animate-pulse rounded-lg bg-stone-200" aria-hidden="true" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => <div key={item} className="card h-24 animate-pulse bg-white" />)}
      </div>
      <div className="card h-52 animate-pulse bg-white" aria-hidden="true" />
    </div>
  )
}
