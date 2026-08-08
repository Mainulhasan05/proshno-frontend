'use client';

import { useEffect, useState } from 'react';

/**
 * Return `value` only after it has stopped changing for `delay` milliseconds.
 *
 * Used to keep a text input responsive while preventing a request per keystroke —
 * typing a ten-character search term fires one query instead of ten.
 *
 * @param {*} value      The rapidly-changing value (e.g. an input's contents).
 * @param {number} delay Quiet period in milliseconds before the value settles.
 */
export default function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
