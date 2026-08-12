import { PRICING_DISPLAY } from '@/lib/pricing'
import { cn } from '@/lib/utils'

// Shared flat-rate pricing rows used by both the single room card and the
// unified (all-rooms) card on the public co-living page. Callers own the
// surrounding `<dl>`/grid wrapper since the two cards use different layouts;
// this only dedupes the repeated label/price row markup.
export function PricingGrid({ itemClassName }: { itemClassName?: string }) {
  return (
    <>
      {PRICING_DISPLAY.map(({ label, price }) => (
        <div
          key={label}
          className={cn(
            'group/price cursor-default bg-card transition-colors duration-200 hover:bg-neon/5',
            itemClassName,
          )}
        >
          <dt className="text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-200 group-hover/price:text-foreground">
            {label}
          </dt>
          <dd className="mt-1 font-bold text-foreground">
            <span className="inline-block transition-transform duration-200 group-hover/price:-translate-y-0.5 group-hover/price:text-neon">
              {price}
            </span>
          </dd>
        </div>
      ))}
    </>
  )
}
