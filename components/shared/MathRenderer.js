import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathRenderer({ text, className = '' }) {
  if (!text) return null;

  // Split text by $$ (block math) and $ (inline math)
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2);
          try {
            const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
            return <div key={index} dangerouslySetInnerHTML={{ __html: html }} className="my-2 overflow-x-auto overflow-y-hidden py-1" />;
          } catch (e) {
            return <span key={index} className="text-error-500 font-mono">{part}</span>;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="inline-block px-0.5" />;
          } catch (e) {
            return <span key={index} className="text-error-500 font-mono">{part}</span>;
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
