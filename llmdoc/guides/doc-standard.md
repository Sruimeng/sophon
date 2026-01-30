---
id: doc-standard
type: guide
related_ids: []
---

# 📘 LLMDoc 文档规范

## 1. 文档结构

```
llmdoc/
├── index.md              # 入口文件，文档导航
├── architecture/         # 架构文档 (数据流、关键路径)
├── guides/               # 操作指南 (SOP、开发流程)
├── reference/            # 参考规范 (API 类型、技术栈)
├── overview/             # 概览文档 (模块简介)
└── agent/                # 策略记忆 (strategy-*.md)
```

## 2. Frontmatter 规范

**所有文档必须包含 YAML frontmatter：**

```yaml
---
id: unique-doc-id          # 必填：唯一标识符 (kebab-case)
type: architecture|guide|reference|overview|strategy  # 必填：文档类型
related_ids: [id1, id2]    # 必填：关联文档 ID 列表
---
```

## 3. 内容规范

### 3.1 Type-First 原则

**先定义接口/类型，再描述逻辑：**

```typescript
// ✅ 正确：先定义类型
interface DailyWorldItem {
  id: number;
  date: string;
  content: string;
}

// 然后描述行为
```

### 3.2 伪代码优于散文

**用伪代码替代长段落描述：**

```
// ✅ 正确
FUNCTION fetchNews():
  1. GET /api/daily-world
  2. IF response.ok THEN parse JSON
  3. RETURN data

// ❌ 错误
"首先我们需要调用 API 获取新闻数据，然后检查响应状态..."
```

### 3.3 负面约束

**明确列出"禁止事项"：**

```markdown
## ⛔ 禁止事项 (Do NOTs)

- 🚫 不要在 Server Component 中使用 `useState`
- 🚫 不要直接修改 Zustand store 外部的状态
```

## 4. 链接规范

**所有代码引用必须使用可点击链接：**

```markdown
<!-- ✅ 正确 -->
参见 [`DailyWorldItem`](../reference/daily-world-api.md:15)
实现位于 [`route.tsx`](../../packages/studio/app/routes/daily/route.tsx:1)

<!-- ❌ 错误 -->
参见 DailyWorldItem 接口
```

## 5. 文档类型说明

| 类型 | 用途 | 示例 |
|------|------|------|
| `architecture` | 系统架构、数据流图 | `daily-world.md` |
| `guide` | 开发指南、SOP | `daily-world-dev.md` |
| `reference` | API 类型、技术规范 | `daily-world-api.md` |
| `overview` | 模块概览、功能简介 | `modules.md` |
| `strategy` | Agent 策略记录 | `strategy-*.md` |