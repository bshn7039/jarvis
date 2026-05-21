import { useUiStore } from '../store/uiStore';

export function useStoreHydrated() {
  return useUiStore((s) => s.isHydrated);
}
