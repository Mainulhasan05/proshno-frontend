/**
 * Next.js App Router sitemap.xml generator.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap() {
  const baseUrl = 'https://proshnopedia.com';

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // TODO: Fetch dynamic pages (e.g., /pages/[slug]) from the API
  // when a public API endpoint is available for listing published pages.
  // Example:
  // const pages = await fetch(`${API_URL}/pages/public`).then(r => r.json());
  // const dynamicRoutes = pages.data.map(page => ({
  //   url: `${baseUrl}/pages/${page.slug}`,
  //   lastModified: new Date(page.updatedAt),
  //   changeFrequency: 'monthly',
  //   priority: 0.7,
  // }));

  return [...staticRoutes];
}
