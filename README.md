# React Router v7 Template

[![Use this template](https://img.shields.io/badge/Use%20this-template-blue?style=for-the-badge)](https://github.com/YOUR_USERNAME/react-router-v7-template/generate)
[![GitHub license](https://img.shields.io/github/license/YOUR_USERNAME/react-router-v7-template?style=for-the-badge)](./LICENSE)

一个基于 React Router v7 的现代化 React SSR 项目模板。

## 🚀 使用此模板

### 方式一：GitHub Template（推荐）

1. 点击上方的 **"Use this template"** 按钮
2. 选择 **"Create a new repository"**
3. 填写你的仓库名称和描述
4. 点击 **"Create repository"**

### 方式二：手动克隆

```bash
# 使用 degit 克隆（不包含 git 历史）
npx degit YOUR_USERNAME/react-router-v7-template my-project

# 或者使用 git clone
git clone https://github.com/YOUR_USERNAME/react-router-v7-template.git my-project
cd my-project
rm -rf .git
git init
```

### 初始化项目

克隆后，请执行以下步骤：

1. **更新 `package.json`**：
   - 修改 `name` 为你的项目名称
   - 更新 `description`、`author`、`repository` 等字段

2. **安装依赖**：
   ```bash
   pnpm install
   ```

3. **启动开发服务器**：
   ```bash
   pnpm dev
   ```

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| **框架** | React | ^19.0.0 |
| **路由** | React Router | ^7.6.2 |
| **构建工具** | Vite | ^6.3.5 |
| **样式方案** | UnoCSS | ^66.2.0 |
| **状态管理** | Zustand | ^5.0.3 |
| **国际化** | i18next + remix-i18next | ^24.2.1 / ^7.2.0 |
| **主题** | remix-themes | ^2.0.4 |
| **表单** | react-hook-form + zod | ^7.54.2 / ^3.24.1 |
| **HTTP 客户端** | ofetch | ^1.4.1 |
| **包管理** | pnpm | >=9.6.0 |

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 9.6.0

### 安装

```bash
# 克隆项目
git clone <your-repo-url>
cd react-router-v7-template

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev
```

### 构建

```bash
# 生产构建
pnpm build

# 或指定环境
pnpm build-production
pnpm build-staging
```

### 启动生产服务器

```bash
pnpm start
```

## 项目结构

```
├── app/
│   ├── components/       # 通用组件
│   │   ├── canonical.tsx
│   │   ├── error-boundary.tsx
│   │   └── layout.tsx
│   ├── constants/        # 常量配置
│   │   ├── meta/         # 环境变量、服务配置
│   │   └── static/       # 静态枚举、存储键
│   ├── hooks/            # 自定义 Hooks
│   │   ├── debounce.ts
│   │   ├── navigate.ts
│   │   └── request.ts
│   ├── locales/          # 国际化资源
│   │   ├── lib/          # i18next 配置
│   │   ├── en/           # 英文
│   │   ├── zh/           # 中文
│   │   └── ...           # 其他语言
│   ├── routes/           # 路由页面
│   │   ├── _index.tsx    # 首页
│   │   ├── 404/          # 404 页面
│   │   ├── api.set-locale.ts
│   │   └── api.set-theme.ts
│   ├── store/            # 状态管理
│   │   └── utils/        # Zustand 工具
│   ├── utils/            # 工具函数
│   ├── entry.client.tsx  # 客户端入口
│   ├── entry.server.tsx  # 服务端入口
│   ├── root.tsx          # 根组件
│   ├── root.css          # 全局样式
│   └── routes.ts         # 路由配置
├── llmdoc/               # LLM 文档
├── .husky/               # Git Hooks
├── .vscode/              # VSCode 配置
├── package.json
├── tsconfig.json
├── vite.config.ts
├── uno.config.ts
├── eslint.config.js
├── stylelint.config.js
└── react-router.config.ts
```

## 核心功能

### 🌐 国际化 (i18n)

支持多语言，默认包含：en, zh, ja, ko, es, pt, ru

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  return <h1>{t('welcome')}</h1>;
}
```

### 🎨 主题切换

支持亮色/暗色主题切换：

```tsx
import { useTheme } from 'remix-themes';

function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

### 📦 状态管理

使用 Zustand 进行状态管理：

```tsx
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 🎯 UnoCSS

原子化 CSS 框架，支持 Tailwind CSS 语法：

```tsx
<div className="flex items-center justify-center min-h-screen bg-background">
  <h1 className="text-4xl font-bold text-foreground">Hello World</h1>
</div>
```

### 📝 表单处理

使用 react-hook-form + zod 进行表单验证：

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });
  // ...
}
```

## 脚本命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 ESLint 检查并修复 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm clear` | 清理构建产物 |

## 配置文件

- [`vite.config.ts`](vite.config.ts) - Vite 构建配置
- [`uno.config.ts`](uno.config.ts) - UnoCSS 样式配置
- [`tsconfig.json`](tsconfig.json) - TypeScript 配置
- [`eslint.config.js`](eslint.config.js) - ESLint 配置
- [`stylelint.config.js`](stylelint.config.js) - Stylelint 配置
- [`react-router.config.ts`](react-router.config.ts) - React Router 配置

## License

MIT