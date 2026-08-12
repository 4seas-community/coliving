import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandLogo({
  className,
  /** Accepted for backwards-compat; size is controlled via `className` height. */
  iconClassName,
  textClassName,
}: {
  className?: string
  iconClassName?: string
  textClassName?: string
}) {
  // Keep the API stable for existing call sites; these are unused now that the
  // logo is a single image lockup containing the clover + wordmark.
  void iconClassName
  void textClassName

  return (
    <span className={cn('inline-flex items-center', className)}>
      <Image
        src="/4seas-logo.png"
        alt="4SEAS"
        width={120}
        height={120}
        priority
        className="h-full w-auto object-contain"
      />
    </span>
  )
}
