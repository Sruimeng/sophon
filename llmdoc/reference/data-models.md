---
id: data-models
type: reference
related_ids: [architecture-overview, storage-layer]
---

# Data Models

Pure frontend SPA. No backend database. 3-layer persistence.

## Type Definitions

### Theme System

```typescript
type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';

// Storage Key: 'theme' (localStorage)
// Persistence: Sync via useSyncExternalStore
// System Listener: window.matchMedia('(prefers-color-scheme: dark)')
```

### Localization

```typescript
type SupportedLanguage = 'en' | 'zh' | 'es' | 'ko' | 'ru' | 'pt' | 'ja';

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
}

const Lngs: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'ko', label: '한국어' },
  { code: 'ru', label: 'Русский' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
];

// Default: 'en'
// Namespace: 'common'
// i18next Integration: Type-safe via module augmentation
```

### Storage Layer

```typescript
// User-Scoped Storage (prefixed with userId)
enum Storage {
  UID = 't_uid',
}

// Global Storage (no prefix)
enum CommonStorage {
  Signup = 't_signup',
  Login = 't_login',
  UserDetail = 't_user_detail',
  EuCookie = 't.cookieAccept',
  Comment = 't_comment',
}

// Storage Type Inference
type S<T> = T extends Record<string, any> ? T | null : string | null;

// API Surface
getStorage<T>(key: Storage): S<T> | null
setStorage(key: Storage, value: unknown): void
removeStorage(key: Storage): void

getCommonStorage<T>(key: CommonStorage): S<T> | null
setCommonStorage(key: CommonStorage, value: unknown): void
removeCommonStorage(key: CommonStorage): void
```

### User Detail Shape

```typescript
// Inferred from storage.ts line 26
interface UserDetail {
  detail: {
    userId: string;
  };
}

// Usage: Storage prefix resolution
// getPrefix() → userInfo.detail.userId
```

### Loading State

```typescript
// Debounced Loading (useLoadingRequest)
interface LoadingRequest<T extends (...p: Parameters<T>) => Promise<unknown>> {
  request: (...args: Parameters<T>) => Promise<void>;
  isLoading: boolean;
}

// Simple Loading (useLoading)
interface LoadingController {
  isLoading: boolean;
  withLoading<T>(fn: () => Promise<T>): Promise<T>;
}
```

### EU Compliance

```typescript
// EU Timezone Detection
const euTimezones: string[] = ['Europe/Amsterdam', 'Europe/Berlin', ...];

isInEU(): boolean → Intl.DateTimeFormat().resolvedOptions().timeZone in euTimezones
allowCookies(): boolean → isInEU() ? getCommonStorage(EuCookie) === 'true' : true
```

### Zustand Store Factory

```typescript
type Store<StoreState, StoreType> = (s: Partial<StoreState>) => StateCreator<StoreType>;
type Ref<T, U> = ReturnType<typeof createStore<subscribeWithSelector(store(state))>>;

interface StoreFactory<T, U> {
  Provider: React.FC<Props & Partial<T>>;
  useStore: {
    (): U;
    <R>(selector: (s: U) => R): R;
  };
  useVanillaStore: () => Ref<T, U>;
}

// HMR Support: window[Symbol.for(name)] cache
// SSR Safety: storeRef.current null check
```

## Storage Architecture

```
┌─────────────────────────────────────────┐
│          External API Layer             │
│  (ofetch: REST/GraphQL requests)        │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         Memory Layer (Zustand)          │
│  - Custom Factory (HMR-aware)           │
│  - subscribeWithSelector middleware     │
│  - Symbol-based global cache            │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│       Browser Storage (localStorage)    │
│  - CommonStorage (global keys)          │
│  - Storage (userId-prefixed keys)       │
│  - Theme (reactive sync)                │
└─────────────────────────────────────────┘
```

## Storage Flow Pseudocode

```
FUNCTION getStorage<T>(key: Storage):
  1. prefix ← getCommonStorage(UserDetail).detail.userId
  2. raw ← localStorage.getItem(key + prefix)
  3. IF raw IS NULL THEN RETURN null
  4. TRY JSON.parse(raw)
  5. CATCH RETURN null

FUNCTION setStorage(key: Storage, value: unknown):
  1. prefix ← getPrefix()
  2. localStorage.setItem(key + prefix, JSON.stringify(value))

FUNCTION getCommonStorage<T>(key: CommonStorage):
  1. raw ← localStorage.getItem(key)
  2. IF raw IS NULL THEN RETURN null
  3. TRY JSON.parse(raw)
  4. CATCH RETURN null
```

## Theme System Flow

```
INIT:
  1. stored ← localStorage.getItem('theme')
  2. preference ← stored || 'system'
  3. theme ← preference === 'system' ? getSystemTheme() : preference
  4. applyTheme(theme)
  5. LISTEN window.matchMedia('(prefers-color-scheme: dark)').change

SET:
  1. localStorage.setItem('theme', preference)
  2. theme ← resolveTheme(preference)
  3. document.documentElement.setAttribute('data-theme', theme)
  4. document.documentElement.classList.toggle('dark', theme === 'dark')
  5. notifyListeners()
```

## Zustand Factory Pattern

```
CREATE store(name: string, storeCreator: Store<T, U>):
  1. symbol ← Symbol.for(name)
  2. IF window[symbol] EXISTS THEN REUSE (HMR)
  3. ELSE CREATE subscribeWithSelector(storeCreator(state))
  4. CACHE window[symbol] ← store
  5. RETURN { Provider, useStore, useVanillaStore }

USE:
  1. context ← useContext(StoreContext)
  2. IF context IS NULL THEN THROW
  3. useStore(context, useShallow(selector))
```

## ⛔ Negative Constraints

- 🚫 **NO direct localStorage access** outside storage utils
- 🚫 **NO user-scoped keys in CommonStorage** (breaks multi-user)
- 🚫 **NO theme state in Zustand** (localStorage is source of truth)
- 🚫 **NO EU cookie check bypass** (legal requirement)
- 🚫 **NO store creation outside Provider** (breaks HMR/SSR)
- 🚫 **NO JSON.parse without try-catch** (corruption protection)
- 🚫 **NO localStorage in SSR context** (typeof window check required)

## Integration Points

**Theme System:**
- Entry: [`app/hooks/theme.ts`](../../app/hooks/theme.ts:1)
- Persistence: localStorage key `'theme'`
- Reactivity: useSyncExternalStore + manual listener registry

**Storage Layer:**
- API: [`app/utils/storage.ts`](../../app/utils/storage.ts:1)
- Keys: [`app/constants/static/storage.ts`](../../app/constants/static/storage.ts:1)
- Prefix Resolution: UserDetail.detail.userId

**Zustand Factory:**
- Factory: [`app/store/utils/utils.tsx`](../../app/store/utils/utils.tsx:1)
- Export: [`app/store/index.ts`](../../app/store/index.ts:1)
- HMR Cache: window[Symbol.for(storeName)]

**Loading State:**
- API: [`app/hooks/request.ts`](../../app/hooks/request.ts:1)
- Debounce: useDebounce wrapper
- Pattern: Closure over useState + try-finally

**EU Compliance:**
- Detector: [`app/utils/cookie.ts`](../../app/utils/cookie.ts:1)
- Timezone List: 45 Europe/* entries
- Consent Key: CommonStorage.EuCookie
