/**
 * Next.js App Router sitemap.xml generator.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

const BASE_URL = 'https://proshnopedia.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/** Rebuild the sitemap hourly so newly published CMS pages get picked up. */
export const revalidate = 3600;

/**
 * The API caps `limit` at 200 per page, so published pages are walked a page at a
 * time. The ceiling is a safety net: a sitemap is not worth an unbounded loop against
 * a paginated endpoint that could misreport its total.
 */
const PAGE_SIZE = 200;
const MAX_PAGES = 25;

async function fetchPublishedPages() {
  const collected = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const res = await fetch(`${API_URL}/pages/public?page=${page}&limit=${PAGE_SIZE}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) break;

    const body = await res.json();
    const batch = body?.data || [];
    collected.push(...batch);

    if (batch.length < PAGE_SIZE) break;
  }

  return collected;
}

export default async function sitemap() {
  const staticRoutes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  let dynamicRoutes = [];
  try {
    const pages = await fetchPublishedPages();
    dynamicRoutes = pages
      .filter((page) => page?.slug)
      .map((page) => ({
        url: `${BASE_URL}/pages/${page.slug}`,
        lastModified: new Date(page.updatedAt || page.publishedAt || Date.now()),
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
  } catch (err) {
    // A sitemap missing its dynamic entries still beats a build/route failure that
    // serves search engines nothing at all.
    console.error('sitemap: failed to load published pages', err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
