import { Link } from 'react-router';
import { Section } from '../components/ui';
import { api } from '../lib/api.server';
import type { Route } from './+types/post';

export async function loader({ params }: Route.LoaderArgs) {
  const post = await api.post(params.slug);
  if (!post) throw new Response('Not found', { status: 404 });
  return { post };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.post ? `${data.post.title} | Совети` : 'Статија' }];
}

export default function Post({ loaderData }: Route.ComponentProps) {
  const post = loaderData.post as { title: string; content?: { html?: string } | null };
  return (
    <Section>
      <div className="grid gap-14 lg:grid-cols-[1fr_300px] lg:items-start">
        <article className="max-w-[34em]">
          <h1 className="max-w-[24em] text-[clamp(32px,4vw,54px)] font-medium text-[var(--color-foreground)]">{post.title}</h1>
          {post.content?.html && (
            <div
              className="mt-8 space-y-4 text-[17px] leading-[1.75] text-[var(--color-muted)] [&_h2]:mt-10 [&_h2]:text-[28px] [&_h2]:font-medium [&_h2]:text-[var(--color-foreground)] [&_li]:ml-5 [&_li]:list-disc [&_p]:text-[17px]"
              dangerouslySetInnerHTML={{ __html: post.content.html }}
            />
          )}
        </article>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-[100px]">
          <div className="rounded-[18px] border border-[var(--color-border)] p-6">
            <div className="font-[family-name:var(--font-mono)] text-[12px] font-extrabold tracking-[0.06em] text-[var(--color-muted)]">СОВЕТ</div>
            <p className="mt-2 text-[15px] text-[var(--color-muted)]">Не сте сигурни кој систем ви одговара? Оставете телефон — ќе ве советуваме бесплатно.</p>
            <Link to="/kontakt" className="mt-4 inline-block rounded-[var(--radius-cta)] bg-[var(--color-cta)] px-5 py-3 text-[15px] font-bold text-[var(--color-cta-fg)]">Побарај консултација</Link>
          </div>
          <div className="mt-4 rounded-[18px] border border-[var(--color-border)] p-6">
            <div className="font-[family-name:var(--font-mono)] text-[12px] font-extrabold tracking-[0.06em] text-[var(--color-muted)]">СПОДЕЛИ</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="https://facebook.com" className="rounded-[10px] border border-[var(--color-border)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--color-foreground)]">Facebook</a>
              <a href="https://instagram.com" className="rounded-[10px] border border-[var(--color-border)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--color-foreground)]">Instagram</a>
            </div>
          </div>
        </aside>
      </div>
    </Section>
  );
}
