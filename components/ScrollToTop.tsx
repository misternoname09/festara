'use client';

import { useEffect, useRef } from 'react';

export default function ScrollToTop({ trigger }: { trigger: any }) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (trigger) {
      const el = document.getElementById('studio-banner');
      if (el) {
        // Un petit délai pour s'assurer que le DOM est à jour après la Server Action
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [trigger]);

  return null;
}
