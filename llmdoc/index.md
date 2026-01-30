---
id: index
type: overview
related_ids: [constitution, style-hemingway, system-overview, doc-standard]
---

# LLMDoc - React Template SPA

> **Template**: React Router v7 + React 19 SPA
> **Status**: ✅ Production Ready
> **Philosophy**: High Signal, Low Noise

## ⚡ Start Here

**MANDATORY READS** (The Constitution):
1. **[`constitution.md`](./reference/constitution.md)** - Project law. Tech stack, naming conventions, forbidden patterns.
2. **[`style-hemingway.md`](./reference/style-hemingway.md)** - Code style law. Iceberg principle, zero fluff.

**Skip these, break the build.**

---

## 📐 Architecture

| Doc | Description |
|-----|-------------|
| [`system-overview.md`](./architecture/system-overview.md) | System architecture, data flow, module boundaries, extension points. |

---

## 📖 Guides

| Doc | Description |
|-----|-------------|
| [`doc-standard.md`](./guides/doc-standard.md) | LLMDoc spec. Frontmatter schema, type-first protocol, pseudocode > prose. |

---

## 📋 Reference

| Doc | Description |
|-----|-------------|
| **[`constitution.md`](./reference/constitution.md)** | **Project constitution. Tech stack, directory rules, TypeScript constraints, ESLint config.** |
| **[`style-hemingway.md`](./reference/style-hemingway.md)** | **Coding style. No "what" comments, max nesting depth 3, early returns, type-first.** |
| [`tech-stack.md`](./reference/tech-stack.md) | Dependency versions, Vite config, build commands, chunk splitting strategy. |
| [`data-models.md`](./reference/data-models.md) | Type definitions. Theme, locale, storage layer, Zustand factory patterns. |
| [`shared-utilities.md`](./reference/shared-utilities.md) | Utility functions. Storage API, hooks (debounce, loading, theme), video parsers. |
| [`technical-debt.md`](./reference/technical-debt.md) | Debt report. Tripo GameHub cleanup completed 2026-01-07. |

---

## 🗂️ Project Structure

```
react-template-spa/
├── app/
│   ├── entry.client.tsx        # Client bootstrap
│   ├── entry.server.tsx        # Server bootstrap (CSR mode)
│   ├── root.tsx                # Root layout (theme + i18n)
│   ├── routes.ts               # Route config
│   ├── components/             # UI primitives (NO logic)
│   ├── hooks/                  # Custom hooks (theme, debounce, request)
│   ├── store/                  # Zustand stores (flat, NO derived state)
│   ├── utils/                  # Pure functions (NO side effects)
│   ├── constants/              # Env vars, enums, storage keys
│   ├── locales/                # i18n (en, zh, ja, ko, es, pt, ru)
│   └── routes/                 # Route components
├── llmdoc/                     # This documentation
├── public/                     # Static assets
├── vite.config.ts              # Vite config
└── uno.config.ts               # UnoCSS config
```

---

## 🚀 Quick Commands

```bash
pnpm install               # Install deps
pnpm dev                   # Dev server (localhost:3000)
pnpm build                 # Production build
pnpm typecheck             # TypeScript check
pnpm lint                  # ESLint auto-fix
```

---

## 🧭 Navigation by Role

**New to Project?**
1. Read [`constitution.md`](./reference/constitution.md)
2. Read [`style-hemingway.md`](./reference/style-hemingway.md)
3. Read [`system-overview.md`](./architecture/system-overview.md)

**Adding Features?**
1. Check [`system-overview.md`](./architecture/system-overview.md) → Section 5 (Extension Points)
2. Review [`tech-stack.md`](./reference/tech-stack.md) → Dependencies
3. Follow [`constitution.md`](./reference/constitution.md) → Module Boundaries

**Writing Docs?**
1. Read [`doc-standard.md`](./guides/doc-standard.md)
2. Use YAML frontmatter (id, type, related_ids)
3. Type-first. Pseudocode > prose.

**Debugging Storage?**
1. [`data-models.md`](./reference/data-models.md) → Storage Layer
2. [`shared-utilities.md`](./reference/shared-utilities.md) → Storage API

**Refactoring Styles?**
1. [`style-hemingway.md`](./reference/style-hemingway.md) → All rules
2. [`constitution.md`](./reference/constitution.md) → Section 10 (Forbidden Patterns)

---

## 📦 Tech Stack

| Layer | Package | Version |
|-------|---------|---------|
| Framework | React | 19.0.0 |
| Router | React Router | 7.6.2 |
| Build | Vite | 7.3.1 |
| Language | TypeScript | 5.8.3 |
| Styles | UnoCSS | 66.2.0 |
| State | Zustand | 5.0.3 |
| i18n | i18next | 25.7.3 |
| Forms | React Hook Form + Zod | 7.54.2 + 4.3.5 |

---

## ⛔ Forbidden Patterns

```typescript
// 🚫 NO any type
const data: any = {};                // ❌

// 🚫 NO deep nesting (max 3)
if (a) { if (b) { if (c) { if (d) {} } } }  // ❌

// 🚫 NO Manager/Factory/Abstract suffixes
class UserManager {}                 // ❌

// 🚫 NO hardcoded config
const API = "https://...";           // ❌

// 🚫 NO fetch in components
useEffect(() => fetch('/api'));      // ❌

// 🚫 NO "what" comments
// Loop through items               // ❌
items.map(...)                       // ✅

// 🚫 NO var keyword
var x = 1;                           // ❌
```

See full list: [`constitution.md`](./reference/constitution.md) → Section 10

---

## 🔗 Related Docs

- Constitution: [`constitution.md`](./reference/constitution.md)
- Style Guide: [`style-hemingway.md`](./reference/style-hemingway.md)
- Architecture: [`system-overview.md`](./architecture/system-overview.md)
- Doc Standard: [`doc-standard.md`](./guides/doc-standard.md)
