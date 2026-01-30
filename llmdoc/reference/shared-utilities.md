---
id: shared-utilities
type: reference
related_ids: [tech-stack, architecture-overview]
---

# Shared Utilities

Cross-cutting utilities for DOM, storage, async, and state management.

## 1. Type Definitions

```typescript
// utils/utils.ts
type VideoInfo =
  | { type: 'bilibili'; bvid: string }
  | { type: 'youtube'; src: string }
  | null;

type PromiseFactory<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

// utils/storage.ts
type S<T> = T extends Record<string, any> ? T | null : string | null;

// hooks/theme.ts
type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';

// store/utils/utils.tsx
type Store<StoreState, StoreType> = (s: Partial<StoreState>) => StateCreator<StoreType>;
type Ref<T, U> = ReturnType<typeof createThisStore<T, U>>;

// constants/static/storage.ts
enum Storage {
  UID = 't_uid'
}

enum CommonStorage {
  Signup = 't_signup',
  Login = 't_login',
  UserDetail = 't_user_detail',
  EuCookie = 't.cookieAccept',
  Comment = 't_comment'
}
```

## 2. Utility Functions

### 2.1 DOM & Device

**`isMobileDevice(ua: string | null): boolean`**
- Check mobile device via user agent regex.

```typescript
IF ua matches /android|iphone|ipod/i THEN true ELSE false
```

**`jump(url: string, blank = true): void`**
- Open URL in new tab or current window.

```typescript
CREATE <a> element -> SET href -> IF blank THEN target="_blank" -> CLICK
```

### 2.2 Async Utilities

**`sleep(ms: number): Promise<void>`**
- Pause execution for specified milliseconds.

**`pf<T>(): PromiseFactory<T>`**
- Create promise with exposed resolve/reject functions.

```typescript
RETURN { promise, resolve, reject }
// Usage: const { promise, resolve } = pf<number>(); resolve(42);
```

### 2.3 Data Formatting

**`formatFileSize(bytes: number, decimals = 2): string`**
- Convert bytes to human-readable format.

```typescript
IF bytes === 0 THEN return ''
COMPUTE i = log(bytes) / log(1024)
RETURN (bytes / 1024^i).toFixed(decimals) + ' ' + sizes[i]
```

**`copy(text: string): Promise<boolean>`**
- Copy text to clipboard via navigator API.

### 2.4 Video URL Parsers

**`extractBVId(url: string): string | null`**
- Extract Bilibili video ID from URL.

```typescript
MATCH /\/video\/(BV[^/]+)/ -> RETURN match[1] OR null
```

**`extractVideoId(url: string): string | null`**
- Extract YouTube video ID from URL (handles standard/share/shorts).

**`videoUrlHandler(url: string): VideoInfo`**
- Parse video URL and return platform-specific info.

```typescript
IF url contains Chinese characters THEN return null
TRY extractBVId -> RETURN { type: 'bilibili', bvid }
TRY extractVideoId -> RETURN { type: 'youtube', src: `//youtube.com/embed/${id}` }
RETURN null
```

## 3. Storage System

### 3.1 Common Storage (Global)

**`getCommonStorage<T>(key: CommonStorage): S<T> | null`**
- Retrieve JSON-parsed data from localStorage.

```typescript
GET localStorage[key] -> TRY JSON.parse() -> RETURN parsed OR null
```

**`setCommonStorage(key: CommonStorage, value: unknown): void`**
- Store JSON-stringified data to localStorage.

**`removeCommonStorage(key: CommonStorage): void`**
- Delete key from localStorage.

### 3.2 User-Scoped Storage

**`getStorage<T>(key: Storage): S<T> | null`**
- Retrieve user-scoped data (key + userId prefix).

```typescript
GET userId from CommonStorage.UserDetail
GET localStorage[key + userId] -> TRY JSON.parse()
```

**`setStorage(key: Storage, value: unknown): void`**
- Store user-scoped data.

**`removeStorage(key: Storage): void`**
- Delete user-scoped key.

### 3.3 Cookie Utilities

**`isInEU(): boolean`**
- Check if user timezone is in EU (GDPR compliance).

```typescript
GET Intl.DateTimeFormat().resolvedOptions().timeZone
RETURN timezone IN euTimezones
```

**`allowCookies(): boolean`**
- Check if cookies are allowed (EU: requires consent, non-EU: always true).

## 4. React Hooks

### 4.1 Debounce & Throttle

**`useDebounce<T>(fn: T, deps: DependencyList): DebouncedFunc<T>`**
- Debounce function with 200ms delay.

**`useThrottle<T>(fn: T, deps: DependencyList): DebouncedFunc<T>`**
- Throttle function with 100ms interval.

### 4.2 Loading State

**`useLoadingRequest<T>(fn: T, deps: DependencyList): { request, isLoading }`**
- Wrap async function with loading state + debounce.

```typescript
ON request() -> SET isLoading=true -> AWAIT fn() -> SET isLoading=false
```

**`useLoading(): { isLoading, withLoading }`**
- Simple loading wrapper without debounce.

```typescript
withLoading(async () => { ... }) -> AUTO manage isLoading state
```

### 4.3 Navigation

**`useNavigateWithQuery(): (path: string) => void`**
- Navigate while preserving query string.

```typescript
navigateWithQuery('/home') -> navigate('/home' + window.location.search)
```

### 4.4 Theme

**`useTheme(): [Theme, (preference: ThemePreference) => void]`**
- Get/Set theme with system preference support.

```typescript
INIT: READ localStorage['theme'] OR default 'system'
IF preference='system' THEN resolve via matchMedia('prefers-color-scheme')
APPLY: SET document.documentElement.dataset.theme + classList.toggle('dark')
LISTEN: matchMedia changes -> AUTO re-apply IF preference='system'
```

## 5. Zustand Store Factory

**`create<T, U>(name: string, store: Store<T, U>): { Provider, useStore, useVanillaStore }`**
- Create Zustand store with Context Provider + global singleton.

```typescript
LOGIC:
  1. CREATE symbol from name
  2. IF window[symbol] exists THEN reuse (HMR support)
  3. ELSE create new store with subscribeWithSelector middleware
  4. PROVIDER: inject store via Context
  5. useStore(): shallow-select from store
  6. useVanillaStore(): return raw store reference

USAGE:
  const { Provider, useStore } = create('myStore', (state) => () => ({ count: 0 }));
  <Provider count={10}><App /></Provider>
  const count = useStore((s) => s.count);
```

## 6. Dependency Graph

```
hooks/request.ts  --> hooks/debounce.ts --> lodash-es
hooks/navigate.ts --> react-router
hooks/theme.ts    --> localStorage + matchMedia
utils/storage.ts  --> constants/static/storage.ts (Enums)
utils/cookie.ts   --> utils/storage.ts
store/utils/utils.tsx --> zustand + zustand/middleware
```

## 7. Usage Examples

### 7.1 Storage Pattern

```typescript
// Set user-specific data
setStorage(Storage.UID, '12345');

// Get with type safety
const uid = getStorage<string>(Storage.UID);

// Common storage (global)
setCommonStorage(CommonStorage.UserDetail, { detail: { userId: '123' } });
```

### 7.2 Loading Request

```typescript
const { request, isLoading } = useLoadingRequest(async (id: string) => {
  await fetch(`/api/data/${id}`);
});

<Button onClick={() => request('123')} disabled={isLoading}>Fetch</Button>
```

### 7.3 Theme Toggle

```typescript
const [theme, setTheme] = useTheme();

<Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme}
</Button>
```

### 7.4 Video URL Handler

```typescript
const info = videoUrlHandler('https://www.bilibili.com/video/BV1xx411c7XD');
// Returns: { type: 'bilibili', bvid: 'BV1xx411c7XD' }

const info2 = videoUrlHandler('https://youtu.be/dQw4w9WgXcQ');
// Returns: { type: 'youtube', src: '//www.youtube.com/embed/dQw4w9WgXcQ' }
```

## 8. Constraints

### ⛔ Do NOTs

- 🚫 DO NOT call `setStorage` before user login (userId required).
- 🚫 DO NOT use `useDebounce` without specifying deps (causes stale closures).
- 🚫 DO NOT manually set `document.documentElement.dataset.theme` (use `useTheme`).
- 🚫 DO NOT access Zustand store outside Provider (throws error).
- 🚫 DO NOT modify `window[symbol]` directly (internal to store factory).

### ✅ Do's

- ✅ Use `getCommonStorage` for global config/auth data.
- ✅ Use `getStorage` for user-scoped preferences.
- ✅ Always handle `null` return from storage functions.
- ✅ Check `allowCookies()` before setting analytics cookies.
