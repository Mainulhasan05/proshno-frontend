import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function preprocessMathText(text) {
  if (!text) return '';

  let processed = text;

  // 1. Strip custom competitor tags
  processed = processed.replace(/<utfq[^>]*>/gi, '');
  processed = processed.replace(/<\/(xscr|vres|utfq)>/gi, '');
  processed = processed.replace(/<et\s*\/?>/gi, '');
  processed = processed.replace(/<gu\s*\/?>/gi, '');
  processed = processed.replace(/<fw\s*\/?>/gi, '');
  processed = processed.replace(/<dv\s*\/?>/gi, '');
  processed = processed.replace(/<t>/gi, '');
  processed = processed.replace(/<\/t>/gi, '');
  processed = processed.replace(/<\/r>/gi, '');
  processed = processed.replace(/<\/u>/gi, '');
  processed = processed.replace(/<\/s>/gi, '');

  // 2. Strip span tags used to wrap math
  processed = processed.replace(/<span class="math-tex">/gi, '');
  processed = processed.replace(/<\/span>/gi, '');

  // 3. Convert LaTeX delimiters \( ... \) to $ ... $
  processed = processed.replace(/\\\( ([\s\S]*?) \\\)/gi, '$$1$');
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, '$$1$');

  // 4. Convert LaTeX delimiters \[ ... \] to $$ ... $$
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$$$');

  // 5. Replace HTML entities that interfere with KaTeX parsing
  processed = processed.replace(/&#39;/g, "'")
                       .replace(/&quot;/g, '"')
                       .replace(/&nbsp;/g, ' ')
                       .replace(/&lt;/g, '<')
                       .replace(/&gt;/g, '>')
                       .replace(/&amp;/g, '&');

  // 6. Convert newlines (\n) to <br /> to preserve Shift+Enter line breaks
  processed = processed.replace(/\r?\n/g, '<br />');

  // 7. Auto-format polynomial statements (i., ii., iii. or i), ii), iii) or (i), (ii), (iii)) onto separate lines
  processed = processed.replace(/([^\n>])\s*(\b(i{1,3}|iv|v|vi{1,3})\.|\((i{1,3}|iv|v|vi{1,3})\)|(i{1,3}|iv|v|vi{1,3})\))\s+/gi, (match, p1, p2) => {
    return `${p1}<br />${p2} `;
  });

  // 8. Auto-break "নিচের কোনটি সঠিক?" onto its own line
  processed = processed.replace(/([^\n>])\s*(নিচের কোনটি সঠিক\??|কোনটি সঠিক\??)/gi, '$1<br />$2');

  return processed;
}

export default function MathRenderer({ text, className = '' }) {
  if (!text) return null;

  const cleanText = preprocessMathText(text);

  // Standard split regex to capture math blocks
  const actualParts = cleanText.split(/(\$\$.*?\$\$|\$.*?\$)/g);

  return (
    <span className={`${className} inline-block max-w-full`}>
      {actualParts.map((part, index) => {
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
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </span>
  );
}
