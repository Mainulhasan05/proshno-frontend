'use client';

/**
 * Reusable JSON-LD structured data component for SEO.
 * Renders a <script type="application/ld+json"> tag with the provided schema.
 *
 * Usage:
 *   <JsonLd data={{ "@type": "WebSite", ... }} />
 *   <JsonLd data={[schema1, schema2]} />  // multiple schemas
 */
export default function JsonLd({ data }) {
  if (!data) return null;

  // Support both single schema object and array of schemas
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => {
        const jsonLd = {
          '@context': 'https://schema.org',
          ...schema,
        };
        return (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        );
      })}
    </>
  );
}
