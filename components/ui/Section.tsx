import { cn } from '@/lib/utils'
import Container from './Container'

interface SectionProps {
  id?: string
  className?: string
  containerClassName?: string
  /** Kicker editorial numerado, ex.: "01 · Sobre" */
  kicker?: string
  title?: string
  subtitle?: string
  centered?: boolean
  /** Título/subtítulo claros para seções com fundo carbono */
  dark?: boolean
  children: React.ReactNode
}

export default function Section({
  id,
  className,
  containerClassName,
  kicker,
  title,
  subtitle,
  centered = false,
  dark = false,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn('py-16 md:py-24', className)}>
      <Container className={containerClassName}>
        {(kicker || title || subtitle) && (
          <div className={cn('mb-10 md:mb-14', centered && 'text-center')}>
            {kicker && (
              <p className={cn('section-kicker mb-5', centered && 'justify-center')}>
                {kicker}
              </p>
            )}
            {title && (
              <h2
                className={cn(
                  'section-title',
                  dark && 'text-white',
                  !kicker && (centered ? 'heading-accent-center' : 'heading-accent'),
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={cn(
                  'section-subtitle mt-4',
                  dark && 'text-[#A8A29E]',
                  centered && 'mx-auto',
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
