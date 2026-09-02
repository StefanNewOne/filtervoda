import type { ProductCardDto } from '@filtervoda/shared';
import { Link } from 'react-router';
import { useLeadModal } from '../../components/LeadModal';
import { fmtPrice } from '../types';

/** Б-2 product card: radius 28px, blue gradient image, pill chips, Oswald price. */
export function ProductCard({ product }: { product: ProductCardDto }) {
  const { open } = useLeadModal();
  const hasSale = product.priceSale != null && product.priceRegular != null;
  return (
    <div className="flex flex-col overflow-hidden rounded-[28px] border border-[#E4EDF9] bg-white transition hover:border-[#6FC4F7] hover:shadow-[0_18px_40px_rgba(8,24,47,0.07)]">
      <Link to={`/proizvodi/${product.slug}`} className="relative grid aspect-[4/5] place-items-center [background:linear-gradient(180deg,#E2F0FC,#FFFFFF)]">
        {hasSale && <span className="absolute left-3.5 top-3.5 rounded-full bg-[#08182F] px-2.5 py-1.5 text-[11px] font-extrabold text-white">Акција</span>}
        {product.image ? <img src={product.image.url} alt={product.image.alt} loading="lazy" className="h-full w-full object-contain p-6" /> : <div className="text-[#A9BFDC]">Слика</div>}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-[22px]">
        <h3 className="font-[family-name:Oswald] text-[19px] font-medium tracking-[-0.02em] text-[#08182F]">{product.name}</h3>
        {product.tagline && <p className="text-[14px] leading-relaxed text-[#56698A]">{product.tagline}</p>}
        {product.chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.chips.slice(0, 3).map((c) => <span key={c} className="rounded-full border border-[#E4EDF9] bg-[#F2F8FF] px-3 py-[7px] text-[12px] font-bold text-[#21375A]">{c}</span>)}
          </div>
        )}
        <div className="mt-auto flex items-baseline gap-2.5 pt-3.5">
          {product.showPrice ? (
            <>
              {hasSale && <span className="text-[14px] text-[#64748B] line-through">{fmtPrice(product.priceRegular)}</span>}
              <span className="font-[family-name:Oswald] text-[24px] font-medium tracking-[-0.03em] text-[#08182F]">{fmtPrice(product.priceSale ?? product.priceRegular)}</span>
            </>
          ) : <span className="text-[15px] font-bold text-[#0E7490]">Побарај цена</span>}
        </div>
        <div className="flex gap-2">
          <Link to={`/proizvodi/${product.slug}`} className="flex-1 rounded-2xl bg-[#08182F] px-3.5 py-3.5 text-center text-[15px] font-bold text-white transition hover:bg-[#1156E0]">Детали</Link>
          <button onClick={() => open({ productId: product.id, productName: product.name })} className="rounded-2xl border border-[#D9E9FB] bg-[#F2F8FF] px-4 py-3.5 text-[15px] font-bold text-[#1156E0] transition hover:bg-[#E6F2FE]">Понуда</button>
        </div>
      </div>
    </div>
  );
}
