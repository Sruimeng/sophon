# 🚀 GitHub Template 设置指南

本文档说明如何将此仓库设置为 GitHub Template Repository。

## 📋 设置步骤

### 1. 启用 Template Repository

1. 进入你的 GitHub 仓库页面
2. 点击 **Settings**（设置）
3. 在 **General** 部分，找到 **Template repository**
4. ✅ 勾选 **Template repository** 选项

![Template Repository Setting](https://docs.github.com/assets/cb-27528/images/help/repository/template-repository-checkbox.png)

### 2. 更新仓库信息

确保以下信息已正确设置：

- **Description**: 添加清晰的仓库描述
- **Topics**: 添加相关标签（如 `react`, `template`, `react-router`, `vite`, `typescript`）
- **Website**: 如果有演示站点，添加链接

### 3. 配置仓库设置

推荐的仓库设置：

#### Features
- ✅ Issues
- ✅ Discussions（可选，用于社区讨论）
- ❌ Wiki（使用 README 和 docs 目录代替）
- ❌ Projects（除非需要项目管理）

#### Pull Requests
- ✅ Allow merge commits
- ✅ Allow squash merging（推荐）
- ❌ Allow rebase merging
- ✅ Automatically delete head branches

### 4. 添加 License

如果还没有 LICENSE 文件：

1. 点击 **Add file** > **Create new file**
2. 输入文件名 `LICENSE`
3. 点击 **Choose a license template**
4. 选择 **MIT License**（或其他适合的许可证）
5. 填写年份和版权所有者
6. 提交更改

### 5. 设置 Branch Protection（可选）

保护主分支：

1. 进入 **Settings** > **Branches**
2. 点击 **Add rule**
3. Branch name pattern: `main`
4. 推荐设置：
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require conversation resolution before merging

## ✅ 检查清单

在发布模板前，确保：

- [ ] README.md 包含清晰的使用说明
- [ ] package.json 使用通用名称（如 `my-react-app`）
- [ ] 已添加 LICENSE 文件
- [ ] 已添加 CONTRIBUTING.md
- [ ] 已添加 Issue 和 PR 模板
- [ ] 已移除任何敏感信息或个人配置
- [ ] 已测试从模板创建新仓库的流程

## 🎉 完成

设置完成后，其他用户可以通过以下方式使用你的模板：

1. 访问你的仓库页面
2. 点击绿色的 **"Use this template"** 按钮
3. 选择 **"Create a new repository"**
4. 填写新仓库的信息
5. 点击 **"Create repository"**

新仓库将包含模板的所有文件，但不包含 git 历史记录。