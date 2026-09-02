import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('proizvodi', 'routes/catalog.tsx'),
  route('proizvodi/:slug', 'routes/product.tsx'),
  route('za-biznis', 'routes/b2b.tsx'),
  route('soveti', 'routes/blog.tsx'),
  route('soveti/:slug', 'routes/post.tsx'),
  route('za-nas', 'routes/about.tsx'),
  route('kontakt', 'routes/contact.tsx'),
  route('blagodarime', 'routes/thank-you.tsx'),
  route('pravni/:slug', 'routes/legal.tsx'),
  route('sitemap.xml', 'routes/sitemap.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
