import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-20 h-20 text-2xl' }

export default function Avatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string | null
  name: string
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-full bg-red-100 flex items-center justify-center overflow-hidden shrink-0',
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={`Avatar de ${name}`}
          width={80}
          height={80}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="text-[#DC2626] font-bold">{getInitials(name || 'A')}</span>
      )}
    </div>
  )
}
