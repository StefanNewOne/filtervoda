import { Link } from 'react-router';
import { Section } from '../components/ui';
import { api } from '../lib/api.server';
import type { Route } from './+types/blog';

export function meta() {
  return [
    { title: 'Совети за чиста вода | filtervoda.mk' },
    { name: 'description', content: 'Едукативни статии за реверзна осмоза, алкална вода, бигор и вода за фирми.' },
  ];
}

export async function loader() {
  return { posts: await api.posts() };
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;
  return (
    <Section title="Совети за чиста вода">
      {posts.length === 0 ? (
        <p className="text-[var(--color-muted)]">Наскоро додаваме статии.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} to={`/soveti/${p.slug}`} className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-5 hover:shadow-[var(--shadow-md)]">
              <h2 className="text-lg">{p.title}</h2>
              {p.excerpt && <p className="mt-2 text-sm text-[var(--color-muted)]">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}
