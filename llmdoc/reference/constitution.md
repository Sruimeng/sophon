---
id: constitution
type: reference
related_ids: [doc-standard, style-hemingway]
---

# Constitution - React Template SPA

> **Template Type**: React Router v7 SPA
> **Architecture**: Zero Bureaucracy
> **Status**: ✅ Production Ready

## 1. Tech Stack

```typescript
interface TechStack {
  framework: "React 19.0.0";
  router: "React Router 7.6.2";
  bundler: "Vite 7.3.1";
  language: "TypeScript 5.8.3";
  styles: "UnoCSS 66.2.0";
  state: "Zustand 5.0.3";
  i18n: "i18next 25.7.3";
  forms: "React Hook Form 7.54.2 + Zod 4.3.5";
}
```

## 2. Directory Structure

```
app/
├── entry.client.tsx     # Client bootstrap
├── entry.server.tsx     # Server bootstrap (SPA mode)
├── root.tsx             # Root layout
├── routes.ts            # Route config
├── components/          # Reusable UI
├── hooks/               # Custom hooks
├── store/               # Zustand stores
├── utils/               # Pure functions
├── constants/           # Config & env
└── locales/             # i18n JSON files
```

## 3. Naming Conventions

```typescript
// Files
"kebab-case.tsx"         // Components, utils
"camelCase.ts"           // Hooks (e.g., debounce.ts, navigate.ts)

// Code
PascalCase               // Components, Types, Interfaces
camelCase                // Functions, variables
UPPER_SNAKE_CASE         // Constants (CDNBaseURL, ApiURL)
```

## 4. Module Boundaries

```typescript
// routes/ - Route components ONLY
export default function Route() {
  const data = useLoaderData<typeof loader>();
  return <View data={data} />;
}

// components/ - UI primitives (NO business logic)
export function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// hooks/ - Stateful logic extraction
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  // ...
}

// store/ - Global state (NOT derived state)
interface CounterStore {
  count: number;
  increment: () => void;
}

// utils/ - Pure functions (NO side effects)
export function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}
```

## 5. TypeScript Rules

```typescript
// tsconfig.json enforced
interface CompilerRules {
  strict: true;
  noUnusedLocals: true;
  noUnusedParameters: true;
  noFallthroughCasesInSwitch: true;
  forceConsistentCasingInFileNames: true;
}

// Type-first design
interface User {
  id: number;
  name: string;
}

// NO implicit any
type Callback = (data: unknown) => void;  // ✅
const callback = (data) => {};            // ❌
```

## 6. React Router v7 Patterns

```typescript
// routes.ts - Centralized routing
export default [
  index("routes/_index/route.tsx"),
  route("about", "routes/about/route.tsx"),
  route("*", "routes/404/route.tsx"),
] satisfies RouteConfig;

// Route file structure
export async function loader({ request }: LoaderFunctionArgs) {
  return json({ data: await fetchData() });
}

export default function Route() {
  const { data } = useLoaderData<typeof loader>();
  return <Component data={data} />;
}
```

## 7. State Management Protocol

```typescript
// Zustand - Flat stores (NO nested objects)
interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const useThemeStore = create<ThemeStore>((set) => ({
  theme: getSystemTheme(),
  setTheme: (theme) => set({ theme }),
}));

// NO derived state in store
// ❌ WRONG
interface BadStore {
  count: number;
  doubled: number;  // Derived from count
}

// ✅ CORRECT
const doubled = count * 2;  // Compute in component
```

## 8. Styling Rules

```typescript
// UnoCSS atomic classes
<div className="flex items-center gap-4 p-4" />

// NO inline styles (except dynamic values)
<div style={{ width: `${progress}%` }} />  // ✅
<div style={{ display: 'flex' }} />        // ❌
```

## 9. Max Nesting Depth: 3

```typescript
// ✅ CORRECT (depth: 2)
if (user) {
  if (user.isAdmin) {
    return <AdminPanel />;
  }
}

// ❌ WRONG (depth: 4)
if (a) {
  if (b) {
    if (c) {
      if (d) {  // TOO DEEP
        return x;
      }
    }
  }
}

// ✅ REFACTOR with early return
if (!a) return null;
if (!b) return null;
if (!c) return null;
return x;
```

## 10. ESLint Enforced Rules

```javascript
// eslint.config.js
{
  'spaced-comment': 'error',                       // Force space after //
  '@typescript-eslint/no-explicit-any': 'warn',    // Avoid any
  '@typescript-eslint/consistent-type-imports': 'error',  // type imports
  'react-hooks/rules-of-hooks': 'error',
  'react/self-closing-comp': 'error',
}
```

## ⛔ Forbidden Patterns

```typescript
// 🚫 NO Bureaucratic Naming
AbstractManagerImpl           // ❌
FactoryProviderService        // ❌
button.tsx                    // ✅

// 🚫 NO any type
const data: any = {};         // ❌
const data: unknown = {};     // ✅

// 🚫 NO deep nesting (>3 levels)
if (a) {
  if (b) {
    if (c) {
      if (d) { /* ... */ }    // ❌
    }
  }
}

// 🚫 NO hardcoded config
const API = "https://...";    // ❌
const API = import.meta.env.VITE_API_URL;  // ✅

// 🚫 NO fetch in components
export default function Route() {
  const [data, setData] = useState();
  useEffect(() => {
    fetch('/api/data');       // ❌
  }, []);
}
// USE loader instead ✅

// 🚫 NO derived state in Zustand
interface Store {
  count: number;
  doubled: number;            // ❌
}

// 🚫 NO skipping TypeScript errors
// @ts-ignore                 // ❌
// @ts-expect-error with reason  // ✅ (rare cases)

// 🚫 NO var keyword
var x = 1;                    // ❌
const x = 1;                  // ✅

// 🚫 NO comments explaining WHAT
// Loop through items          // ❌
items.map(...)                // ✅ (code is self-explanatory)

// 🚫 NO Manager/Factory/Abstract suffixes
class UserManager {}          // ❌
class UserRepository {}       // ✅
```

## 11. Config Management

```typescript
// constants/env.ts - Single source of truth
export const CDNBaseURL = import.meta.env.VITE_CDN_BASE_URL;
export const ApiURL = import.meta.env.VITE_API_URL;

// NO magic values in code
fetch(`${ApiURL}/users`);     // ✅
fetch('https://api.../users'); // ❌
```

## 12. i18n Protocol

```typescript
// Supported locales
type Locale = 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'pt' | 'ru';

// Usage
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('common.welcome')}</h1>;
}
```

## 13. Doc-Driven Development

```
WORKFLOW:
1. READ llmdoc/reference/constitution.md (this file)
2. READ llmdoc/reference/style-hemingway.md
3. DESIGN in llmdoc/architecture/
4. IMPLEMENT code
5. UPDATE llmdoc/guides/
```

## 14. Related Docs

- Style Guide: [style-hemingway.md](./style-hemingway.md)
- Doc Standard: [doc-standard.md](../guides/doc-standard.md)
