---
id: tech-stack
type: reference
related_ids: []
---

# 技术栈参考

## 核心依赖

| Layer | Package | Version | Purpose |
|-------|---------|---------|---------|
| **Framework** | React | 19.0.0 | UI 渲染 |
| | React Router | 7.6.2 | SPA 路由 (SSR 禁用) |
| **Build** | Vite | 7.3.1 | 构建工具 |
| | TypeScript | 5.8.3 | 类型系统 |
| **CSS** | UnoCSS | 66.2.0 | 原子化样式 |
| **State** | Zustand | 5.0.3 | 状态管理 |
| **Form** | react-hook-form | 7.54.2 | 表单控制 |
| | Zod | 4.3.5 | Schema 验证 |
| **I18n** | i18next | 25.7.3 | 国际化 |
| | react-i18next | 16.5.1 | React 绑定 |
| **Utils** | lodash-es | 4.17.21 | 工具函数 |
| | dayjs | 1.11.13 | 日期处理 |
| | ofetch | 1.4.1 | HTTP 客户端 |
| | immer | 11.1.3 | 不可变数据 |

## 构建配置

### React Router (`react-router.config.ts`)

```typescript
{
  ssr: false,              // 纯 SPA 模式
  buildDirectory: './dist' // 输出目录
}
```

### Vite (`vite.config.ts`)

```typescript
{
  plugins: [
    reactRouter(),     // React Router 集成
    tsconfigPaths(),   // 路径别名 (@/*)
    UnoCSS()           // 原子化 CSS
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('lodash-es') || id.includes('dayjs')) {
            return 'vendor-utils';  // 工具库分离
          }
        }
      }
    },
    chunkSizeWarningLimit: 600  // KB
  },
  server: {
    host: 'localhost',
    port: 3000
  }
}
```

## 路径别名

| Alias | Target | Usage |
|-------|--------|-------|
| `@/*` | `./app/*` | `import { Foo } from '@/components/Foo'` |

## 开发命令

| Command | Action |
|---------|--------|
| `pnpm dev` | 启动开发服务器 (localhost:3000) |
| `pnpm build` | 生产构建 (默认) |
| `pnpm build-production` | 生产构建 (NODE_ENV=production) |
| `pnpm build-staging` | 预发布构建 (NODE_ENV=staging) |
| `pnpm lint` | ESLint 自动修复 |
| `pnpm typecheck` | TypeScript 类型检查 (无输出) |
| `pnpm preview` | 预览生产构建 |
| `pnpm pruned` | 生成生产依赖快照 (./pruned) |

## DevTools

| Tool | Config | Purpose |
|------|--------|---------|
| **ESLint** | `eslint.config.js` | 代码规范 |
| **Prettier** | `.prettierrc` | 格式化 |
| **Stylelint** | `.stylelintrc` | CSS 规范 |
| **Husky** | `.husky/` | Git Hooks |
| **lint-staged** | `package.json` | 提交前检查 |

## 环境约束

```typescript
{
  node: ">=20.0.0",
  pnpm: ">=9.6.0"
}
```

## Chunk 分割策略

**规则** (`vite.config.ts:11-14`):

```
IF module.id INCLUDES 'lodash-es' OR 'dayjs' THEN
  OUTPUT chunk = 'vendor-utils'
ELSE
  DEFAULT bundling
```

**Result**:
- `vendor-utils.js`: lodash-es + dayjs (共享工具层)
- `main.js`: 应用代码
- `react-*.js`: React + React Router (自动分离)

## ⛔ 负面约束

- 🚫 不要启用 SSR (`react-router.config.ts:4` 禁用)
- 🚫 不要修改 `@/*` 别名 (全局依赖)
- 🚫 不要绕过 ESLint (`lint-staged` 强制检查)
- 🚫 不要使用 npm/yarn (强制 pnpm >= 9.6.0)
