import type { ProductCardDto } from '@filtervoda/shared';
import { Link } from 'react-router';
import { Badge, Chip, formatPrice } from './ui';

export function ProductCard({ product }: { product: ProductCardDto }) {
  const hasSale = product.priceSale != null && product.priceRegular != null;
  return (
    <Link
      to={`/proizvodi/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:shadow-[var(--shadow-md)]"
    >
      <div className="aspect-[4/5] bg-[var(--color-neutral-100)]">
        {product.image ? (
          <img
            src={product.image.url}
            alt={product.image.alt}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-muted)]">Слика</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-[var(--color-ink)]">{product.name}</h3>
        {product.tagline && <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">{product.tagline}</p>}
        {product.chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.chips.slice(0, 3).map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        )}
        <div className="mt-auto pt-3">
          {product.showPrice ? (
            <div className="flex items-baseline gap-2">
              {hasSale && <span className="text-sm text-[var(--color-muted)] line-through">{formatPrice(product.priceRegular)}</span>}
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
                {formatPrice(product.priceSale ?? product.priceRegular)}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-[var(--color-accent)]">Побарај цена</span>
          )}
          {product.badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.badges.map((b) => (
                <Badge key={b}>{b}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
