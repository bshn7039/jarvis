import { useEffect, useState } from 'react';
import { useUiStore } from '../store/uiStore';

export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(() => useUiStore.persist.hasHydrated());

  useEffect(() => {
    if (useUiStore.persist.hasHydrated()) {
      setHydrated(true);
      return undefined;
    }

    return useUiStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
