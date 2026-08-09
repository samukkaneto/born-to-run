'use client'

import { Analytics, type BeforeSendEvent as AnalyticsEvent } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const UUID_SEGMENT = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi

function sanitizeUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl, window.location.origin)
    url.search = ''
    url.hash = ''
    url.pathname = url.pathname.replace(UUID_SEGMENT, ':id')
    return url.toString()
  } catch {
    return rawUrl.split(/[?#]/, 1)[0].replace(UUID_SEGMENT, ':id')
  }
}

export default function VercelObservability({ enabled }: { enabled: boolean }) {
  if (!enabled) return null

  return (
    <>
      <Analytics
        mode="production"
        beforeSend={(event: AnalyticsEvent) => ({ ...event, url: sanitizeUrl(event.url) })}
      />
      <SpeedInsights beforeSend={(event) => ({ ...event, url: sanitizeUrl(event.url) })} />
    </>
  )
}
