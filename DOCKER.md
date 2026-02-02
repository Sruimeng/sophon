# Docker 部署指南

## 快速开始

### 1. 构建镜像

```bash
docker build -t llm-viz:latest .
```

### 2. 使用docker-compose启动

```bash
# 确保app_network网络存在
docker network create app_network

# 启动服务
docker-compose up -d
```

### 3. 直接运行 (不使用compose)

```bash
docker run -d \
  --name llm-viz \
  -p 8080:8080 \
  --env-file .env \
  llm-viz:latest
```

## 配置说明

### Dockerfile特性

- **多阶段构建**: 使用node:20-alpine构建,zeabur/caddy-static提供静态服务
- **pnpm版本**: 9.6.0
- **输出目录**: `dist/client/`
- **端口**: 8080
- **WebLLM支持**: 添加了COOP/COEP头以支持SharedArrayBuffer

### docker-compose.yml

| 配置 | 说明 |
|------|------|
| `container_name` | `llm_viz_app` |
| `networks` | `app_network` (外部网络) |
| `env_file` | `.env` |
| `healthcheck` | 每30秒检查一次 |

### 环境变量

创建 `.env` 文件:

```env
NODE_ENV=production
TZ=Asia/Shanghai
```

## 与Caddy反向代理集成

如果使用Caddy作为主反向代理:

```caddyfile
# /etc/caddy/Caddyfile
yourdomain.com {
    reverse_proxy llm_viz_app:8080
}
```

## 阿里云部署

### 推送到阿里云容器镜像

```bash
# 登录阿里云
docker login --username=your_username registry.cn-hangzhou.aliyuncs.com

# 打标签
docker tag llm-viz:latest registry.cn-hangzhou.aliyuncs.com/your_namespace/llm-viz:latest

# 推送
docker push registry.cn-hangzhou.aliyuncs.com/your_namespace/llm-viz:latest
```

### 使用阿里云镜像启动

```bash
ALIYUN_IMAGE=registry.cn-hangzhou.aliyuncs.com/your_namespace/llm-viz:latest \
  docker-compose up -d
```

## 故障排查

### 查看日志

```bash
docker-compose logs -f llm-viz
```

### 健康检查状态

```bash
docker inspect llm_viz_app | grep -A 10 Health
```

### 重启服务

```bash
docker-compose restart llm-viz
```

## 性能优化

### 构建缓存

```bash
# 使用BuildKit加速构建
DOCKER_BUILDKIT=1 docker build -t llm-viz:latest .
```

### 资源限制

```yaml
# docker-compose.yml
services:
  llm-viz:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 关键差异 vs vestige

1. **容器名称**: `llm_viz_app` (vs `vestige_app`)
2. **端口**: 8080 (vs 8000)
3. **安全头**: 添加了COOP/COEP支持WebLLM
4. **健康检查**: 添加了HTTP健康检查
5. **pnpm版本**: 9.6.0 (vs 9.0)
