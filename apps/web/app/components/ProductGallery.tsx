import type { MediaDto } from '@filtervoda/shared';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useState } from 'react';

/** Product gallery: main image + thumbnails + Radix Dialog lightbox. Falls back to a placeholder. */
export function ProductGallery({ gallery, name }: { gallery: MediaDto[]; name: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  if (gallery.length === 0) {
    return <div className="aspect-[4/5] rounded-[var(--radius-card)] bg-[var(--color-neutral-100)]" aria-hidden />;
  }

  const current = gallery[active] ?? gallery[0];
  if (!current) return null;
  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="block aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-neutral-100)]"
        aria-label="Зголеми слика"
      >
        <img src={current.url} alt={current.alt || name} className="h-full w-full object-contain p-6" />
      </button>
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {gallery.map((g, i) => (
            <button
              key={g.id}
              onClick={() => setActive(i)}
              className={`size-16 shrink-0 overflow-hidden rounded-md border ${i === active ? 'border-[var(--color-cta)]' : 'border-[var(--color-border)]'}`}
            >
              <img src={g.url} alt={g.alt} className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-black/80" />
          <Dialog.Content className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-6">
            <Dialog.Title className="sr-only">{name}</Dialog.Title>
            <img src={current.url} alt={current.alt || name} className="max-h-[85vh] max-w-[90vw] object-contain" />
            <Dialog.Close aria-label="Затвори" className="absolute right-4 top-4 rounded-full bg-white/90 p-2">
              <X size={22} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
