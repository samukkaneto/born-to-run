import { cn } from '@/lib/utils'

type Variant = 'red' | 'green' | 'orange' | 'gray'

export default function Badge({
  variant = 'gray',
  className,
  children,
}: {
  variant?: Variant
  className?: string
  children: React.ReactNode
}) {
  return <span className={cn('badge', `badge-${variant}`, className)}>{children}</span>
}
