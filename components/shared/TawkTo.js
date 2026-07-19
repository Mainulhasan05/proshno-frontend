'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Routes where Tawk.to should NOT appear
const PRIVATE_PREFIXES = ['/admin', '/teacher', '/portal', '/dashboard'];

export default function TawkTo() {
  const pathname = usePathname();
  const isPrivate = PRIVATE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    if (isPrivate) {
      // Hide widget on private pages
      if (window.Tawk_API?.hideWidget) {
        window.Tawk_API.hideWidget();
      }
      return;
    }

    // Show widget on public pages (if already loaded)
    if (window.Tawk_API?.showWidget) {
      window.Tawk_API.showWidget();
      return;
    }

    // First load — inject script
    if (document.getElementById('tawk-script')) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s = document.createElement('script');
    s.id = 'tawk-script';
    s.async = true;
    s.src = 'https://embed.tawk.to/6a5c793caa83a11d48ca4b97/1jtsjj5hj';
    s.charset = 'UTF-8';
    s.setAttribute('crossorigin', '*');
    document.head.appendChild(s);
  }, [isPrivate, pathname]);

  return null;
}
