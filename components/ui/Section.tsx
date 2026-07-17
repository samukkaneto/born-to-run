import { cn } from '@/lib/utils'
import Container from './Container'

interface SectionProps {
  id?: string
  className?: string
  containerClassName?: string
  title?: string
  subtitle?: string
  centered?: boolean
  children: React.ReactNode
}

export default function Section({
  id,
  className,
  containerClassName,
  title,
  subtitle,
  centered = false,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn('py-16 md:py-24', className)}>
      <Container className={containerClassName}>
        {(title || subtitle) && (
          <div className={cn('mb-10 md:mb-14', centered && 'text-center')}>
            {title && (
              <h2 className={cn('section-title', centered ? 'heading-accent-center' : 'heading-accent')}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn('section-subtitle mt-4', centered && 'mx-auto')}>{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
