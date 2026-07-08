/**
 * Next.js App Router robots.txt generator.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/teacher/', '/api/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/teacher/', '/api/'],
      },
    ],
    sitemap: 'https://proshnopedia.com/sitemap.xml',
    host: 'https://proshnopedia.com',
  };
}
