import { createContext, useContext, useRef } from 'react';
import { createStore, useStore, type StateCreator } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';

type Store<StoreState, StoreType> = (s: Partial<StoreState>) => StateCreator<StoreType>;

const createThisStore = <T, U>(state: Partial<T>, store: Store<T, U>) => {
  const storeWithSubscribe = subscribeWithSelector(store(state));
  return createStore(storeWithSubscribe);
};

export type Ref<T, U> = ReturnType<typeof createThisStore<T, U>>;

declare global {
  interface Window {
    [symbol: symbol]: Ref<any, any>;
  }
}

export const create = <T extends Record<string, any>, U extends T>(
  name: string,
  store: Store<T, U>,
) => {
  const symbol = Symbol.for(name);
  const StoreContext = createContext<Ref<T, U> | undefined>(undefined);

  type Props = {
    children: React.ReactNode;
  } & Partial<T>;

  const Provider: React.FC<Props> = ({ children, ...state }) => {
    const storeRef = useRef<Ref<T, U> | null>(null);

    if (!storeRef.current) {
      if (globalThis.window) {
        if (globalThis.window[symbol]) {
          storeRef.current = globalThis.window[symbol];
        } else {
          storeRef.current = createThisStore(state as unknown as Partial<T>, store);
          globalThis.window[symbol] = storeRef.current;
        }
      } else {
        storeRef.current = createThisStore(state as unknown as Partial<T>, store);
      }
    }
    // 在客户端 支持热更新
    if (globalThis.window) {
      if (globalThis.window[symbol]) {
        globalThis.window[symbol].setState(state);
      }
    }

    return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
  };

  function useThisStore(): U;
  function useThisStore<R>(selector: (s: U) => R): R;
  function useThisStore(s?: (s: U) => Partial<U>) {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(`${name} must be used within StoreProvider`);
    }
    const fullback = (store: U) => store;
    const selector = s || fullback;
    return useStore(store, useShallow(selector));
  }

  const useThisVanillaStore = () => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(`${name} must be used within StoreProvider`);
    }
    return store;
  };

  return {
    Provider,
    useStore: useThisStore,
    useVanillaStore: useThisVanillaStore,
  };
};
