import { useEffect, useState } from 'react';
import { useUiStore } from '../store/uiStore';

export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(() => useUiStore.persist.hasHydrated());

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[jarvis] store hydration check start');
    }

    if (useUiStore.persist.hasHydrated()) {
      if (import.meta.env.DEV) {
        console.log('[jarvis] store already hydrated');
      }
      setHydrated(true);
      return undefined;
    }

    return useUiStore.persist.onFinishHydration(() => {
      if (import.meta.env.DEV) {
        console.log('[jarvis] store hydration complete');
      }
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
