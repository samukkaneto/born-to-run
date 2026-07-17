import { cn } from '@/lib/utils'

export default function Card({
  className,
  children,
  lift = false,
}: {
  className?: string
  children: React.ReactNode
  lift?: boolean
}) {
  return <div className={cn('card', lift && 'card-lift', className)}>{children}</div>
}
