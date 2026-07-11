'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { googleAuth } from '@/store/slices/authSlice';

const SCRIPT_ID = 'google-identity-services';

export default function GoogleAuthButton({ mode = 'signin' }) {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) { setUnavailable(true); return; }
    let cancelled = false;

    const render = () => {
      if (cancelled || !window.google?.accounts?.id || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (credential) dispatch(googleAuth(credential));
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      containerRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'signin_with',
        shape: 'pill',
        width: Math.min(containerRef.current.offsetWidth || 360, 400),
        logo_alignment: 'left',
      });
    };

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      if (window.google?.accounts?.id) render();
      else existing.addEventListener('load', render, { once: true });
    } else {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = render;
      script.onerror = () => setUnavailable(true);
      document.head.appendChild(script);
    }

    return () => { cancelled = true; };
  }, [clientId, dispatch, mode]);

  if (unavailable) {
    return <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">Google login is not configured</p>;
  }

  return <div ref={containerRef} className="flex min-h-11 w-full items-center justify-center overflow-hidden" aria-label="Google দিয়ে চালিয়ে যান" />;
}