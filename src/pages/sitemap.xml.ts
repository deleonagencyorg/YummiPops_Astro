import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import config from '../i18n/config';

// Only pages that are in the navigation menu
const staticPages = [
  '/',
  '/recetas',
  '/recipes',
  '/blog',
  '/contacto',
  '/contact'
];

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  
  // Generate URLs with proper language prefixes
  const pageUrls = staticPages.map(page => {
    // Pages already have language prefix or are root
    if (page === '/') {
      return config.supportedLocales.map(lang => `/${lang}`);
    }
    // Check if page already has language prefix
    const hasLangPrefix = config.supportedLocales.some(lang => page.startsWith(`/${lang}`));
    if (hasLangPrefix) {
      return [page];
    }
    // Add language prefix to pages without it
    return config.supportedLocales.map(lang => `/${lang}${page}`);
  }).flat();

  // Blog posts with language prefixes
  const blogPosts = posts.map((post: any) => 
    `/${post.slug.split('/')[0]}/blog/${post.slug.split('/')[1]}`
  );

  const allUrls = [...pageUrls, ...blogPosts];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allUrls.map(url => `
        <url>
          <loc>https://ranchitas.com${url}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`.trim(),
    {
      headers: {
        'Content-Type': 'application/xml',
      },
    }
  );
};
