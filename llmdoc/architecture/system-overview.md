---
id: system-overview
type: architecture
related_ids: [constitution, doc-standard, index]
---

# 系统架构概览

## 1. 架构类型

```
TYPE: Single Page Application (SPA)
RENDER_MODE: Client-Side Rendering (SSR=false)
FRAMEWORK: React Router v7
REACT_VERSION: 19.0.0
BUILD_TOOL: Vite 6.3.5
PACKAGE_MANAGER: pnpm 9.6.0
```

## 2. 目录结构

```
react-template-spa/
├── app/
│   ├── entry.client.tsx        # 客户端入口
│   ├── entry.server.tsx        # 服务端入口 (CSR 配置)
│   ├── root.tsx                # 根组件 (Layout)
│   ├── routes.ts               # 路由配置
│   │
│   ├── components/             # UI 组件
│   │   ├── canonical.tsx       # SEO 元标签
│   │   ├── error-boundary.tsx  # 错误边界
│   │   └── layout/             # 布局组件
│   │       ├── footer.tsx
│   │       └── header.tsx
│   │
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── theme.ts            # 主题切换
│   │   ├── debounce.ts         # 防抖
│   │   ├── navigate.ts         # 路由跳转
│   │   └── request.ts          # 网络请求
│   │
│   ├── store/                  # 状态管理
│   │   ├── index.ts            # Store 导出
│   │   └── utils/              # Store 工具
│   │       └── immer.ts        # Immer 集成
│   │
│   ├── utils/                  # 工具函数
│   │   ├── storage.ts          # 本地存储
│   │   ├── cookie.ts           # Cookie 操作
│   │   └── utils.ts            # 通用工具
│   │
│   ├── constants/              # 常量配置
│   │   ├── meta.ts             # 元数据
│   │   └── static/
│   │       └── storage.ts      # 存储键名
│   │
│   ├── locales/                # 国际化
│   │   ├── en/                 # English
│   │   ├── zh/                 # 中文
│   │   ├── ja/                 # 日本語
│   │   ├── ko/                 # 한국어
│   │   ├── es/                 # Español
│   │   ├── pt/                 # Português
│   │   └── ru/                 # Русский
│   │
│   └── routes/                 # 路由页面
│       ├── _index.tsx          # 首页
│       └── 404/                # 404 页面
│
├── llmdoc/                     # LLM 文档中心
├── public/                     # 静态资源
└── vite.config.ts              # Vite 配置
```

## 3. 数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                           Browser                           │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                ┌─────────────────▼─────────────────┐
                │    entry.client.tsx (Hydration)   │
                └─────────────────┬─────────────────┘
                                  │
                ┌─────────────────▼─────────────────┐
                │    root.tsx (Layout + i18n)       │
                │    - ThemeProvider                │
                │    - I18nextProvider              │
                └─────────────────┬─────────────────┘
                                  │
                ┌─────────────────▼─────────────────┐
                │         Routes (pages)            │
                │    - _index.tsx                   │
                │    - 404/route.tsx                │
                └─────────────────┬─────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐       ┌──────────────────┐     ┌──────────────┐
│   Hooks       │       │   Store          │     │   Utils      │
│               │       │                  │     │              │
│ • theme       │       │ • Zustand        │     │ • storage    │
│ • debounce    │◄──────┤ • immer utils    │────►│ • cookie     │
│ • navigate    │       │                  │     │ • utils      │
│ • request     │       │                  │     │              │
└───────┬───────┘       └──────────────────┘     └──────────────┘
        │
        ▼
┌───────────────┐
│  Backend API  │
│  (ofetch)     │
└───────────────┘
```

## 4. 核心模块职责

### 4.1 路由系统

| 文件 | 职责 | 关键技术 |
|------|------|----------|
| `routes.ts` | 路由配置 | React Router v7 |
| `routes/_index.tsx` | 首页 | React Component |
| `routes/404/` | 404 页面 | Error Handling |

**路由配置示例:**
```typescript
// routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index/route.tsx"),
  route("*", "routes/404/route.tsx"),
] satisfies RouteConfig;
```

### 4.2 主题系统

| 文件 | 职责 | 关键技术 |
|------|------|----------|
| `hooks/theme.ts` | 主题切换 Hook | `useSyncExternalStore` |
| `root.tsx` | 主题注入 | React Context |

**架构设计:**
```typescript
// Pseudocode
CLASS ThemeManager:
  SUBSCRIBE(listener):
    listeners.push(listener)
    RETURN unsubscribe

  NOTIFY():
    FOR EACH listener IN listeners:
      listener()

  TOGGLE():
    newTheme = current === 'light' ? 'dark' : 'light'
    localStorage.set('theme', newTheme)
    NOTIFY()

FUNCTION useTheme():
  RETURN useSyncExternalStore(
    subscribe: ThemeManager.subscribe,
    getSnapshot: () => ThemeManager.getTheme(),
  )
```

### 4.3 国际化系统

| 文件 | 职责 | 关键技术 |
|------|------|----------|
| `locales/*/` | 翻译资源 | i18next |
| `root.tsx` | i18n 初始化 | `I18nextProvider` |

**支持语言:**
- `en` (English) - 默认
- `zh` (中文)
- `ja` (日本語)
- `ko` (한국어)
- `es` (Español)
- `pt` (Português)
- `ru` (Русский)

### 4.4 状态管理

| 文件 | 职责 | 关键技术 |
|------|------|----------|
| `store/index.ts` | Store 导出 | Zustand |
| `store/utils/immer.ts` | 不可变更新 | Immer |

**Store 架构:**
```typescript
// Pseudocode
INTERFACE StoreState<T>:
  data: T
  update: (updater: (draft: T) => void) => void

FUNCTION createStore<T>(initialData: T):
  RETURN zustand.create((set) => ({
    data: initialData,
    update: (updater) => set(
      produce(state, (draft) => updater(draft.data))
    )
  }))
```

### 4.5 网络请求

| 文件 | 职责 | 关键技术 |
|------|------|----------|
| `hooks/request.ts` | 请求 Hook 封装 | `ofetch` |
| `utils/utils.ts` | 工具函数 | TypeScript |

**请求流程:**
```
FUNCTION useRequest<T>(url, options):
  1. INIT state = { data: null, loading: true, error: null }
  2. ON_MOUNT:
     TRY:
       response = AWAIT ofetch(url, options)
       SET state.data = response
     CATCH error:
       SET state.error = error
     FINALLY:
       SET state.loading = false
  3. RETURN state
```

### 4.6 表单处理

| 技术 | 用途 |
|------|------|
| `react-hook-form` | 表单状态管理 |
| `zod` | 数据验证 |

### 4.7 样式系统

| 技术 | 用途 |
|------|------|
| `UnoCSS` | 原子化 CSS |
| `root.css` | 全局样式 |

## 5. 扩展点识别

### 5.1 新增路由

```
LOCATION: app/routes/
STEPS:
  1. CREATE routes/{route-name}/route.tsx
  2. UPDATE routes.ts:
     route("{path}", "routes/{route-name}/route.tsx")
  3. (Optional) ADD loader/action
```

### 5.2 新增全局状态

```
LOCATION: app/store/
STEPS:
  1. CREATE store/{store-name}.ts
  2. DEFINE interface {StoreName}State
  3. EXPORT useStore = create<{StoreName}State>(...)
  4. IMPORT in components
```

### 5.3 新增 Hook

```
LOCATION: app/hooks/
STEPS:
  1. CREATE hooks/{hook-name}.ts
  2. EXPORT function use{HookName}()
  3. UPDATE hooks/index.ts for re-export
```

### 5.4 新增工具函数

```
LOCATION: app/utils/
STEPS:
  1. ADD function to utils/utils.ts
  2. OR CREATE utils/{util-name}.ts
  3. EXPORT utility
```

### 5.5 新增国际化语言

```
LOCATION: app/locales/
STEPS:
  1. CREATE locales/{lang-code}/
  2. ADD common.json, error-toast.json
  3. UPDATE i18n config
```

## 6. 关键技术决策

### 6.1 CSR vs SSR

```
DECISION: Client-Side Rendering (CSR)
REASON:
  - 部署简单 (静态托管)
  - 无需 Node.js 服务器
  - 适用于 SPA 模板
CONFIG: react-router.config.ts → ssr: false
```

### 6.2 状态管理选型

```
DECISION: Zustand
REASON:
  - 轻量 (3kb)
  - API 简洁
  - 无需 Provider
  - 支持 Immer
ALTERNATIVE: Redux (重量级), Jotai (Atom 模式)
```

### 6.3 样式方案

```
DECISION: UnoCSS
REASON:
  - 按需生成
  - 性能优异
  - Tailwind 兼容
  - 支持自定义规则
ALTERNATIVE: Tailwind CSS, Styled-Components
```

### 6.4 表单方案

```
DECISION: React Hook Form + Zod
REASON:
  - 性能优化 (无重渲染)
  - 类型安全 (Zod Schema)
  - 声明式验证
ALTERNATIVE: Formik, React Final Form
```

## 7. 性能优化点

### 7.1 已实现

- ✅ 路由懒加载 (React Router v7)
- ✅ UnoCSS 按需生成
- ✅ Vite 构建优化
- ✅ 防抖 Hook (`useDebounce`)

### 7.2 可扩展

- 虚拟滚动 (大列表)
- React.memo (组件缓存)
- Code Splitting (动态导入)
- Service Worker (离线支持)

## 8. 依赖关系图

```
┌───────────────────────────────────────────────────────────┐
│                     Application Layer                     │
│                                                           │
│  Components ──► Hooks ──► Store ──► Utils               │
│      │           │         │          │                  │
│      └───────────┴─────────┴──────────┘                  │
│                     │                                     │
└─────────────────────┼─────────────────────────────────────┘
                      │
┌─────────────────────┼─────────────────────────────────────┐
│                Framework Layer                            │
│                                                           │
│  React Router ◄──► React ◄──► i18next                   │
│      │                │            │                     │
└──────┼────────────────┼────────────┼──────────────────────┘
       │                │            │
┌──────┼────────────────┼────────────┼──────────────────────┐
│  Build Layer          │            │                      │
│                       │            │                      │
│  Vite ──► TypeScript ─┼──► UnoCSS ─┘                     │
│                       │                                   │
└───────────────────────┼───────────────────────────────────┘
                        │
                   ┌────▼────┐
                   │ Browser │
                   └─────────┘
```

## ⛔ 架构约束 (Do NOTs)

- 🚫 **不要**在 Components 中直接调用 API (使用 Hooks)
- 🚫 **不要**在 Routes 中定义可复用组件 (提取到 components/)
- 🚫 **不要**在 Store 中存储可派生状态 (使用计算属性)
- 🚫 **不要**在 Utils 中使用 React Hooks (保持纯函数)
- 🚫 **不要**硬编码配置 (使用 constants/)
- 🚫 **不要**跳过类型定义 (必须定义 TypeScript 接口)

## 相关文档

- 技术规范: [`constitution.md`](../reference/constitution.md)
- 文档标准: [`doc-standard.md`](../guides/doc-standard.md)
- 技术债务: [`technical-debt.md`](../reference/technical-debt.md)
