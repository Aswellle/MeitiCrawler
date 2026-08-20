# MeitiCrawler 后端 Railway 部署教程

> 将 FastAPI 后端 + Playwright 爬虫部署到 Railway，前端部署到 GitHub Pages，实现完整的云端爬取服务。

---

## 架构概览

```
┌─────────────────────┐         HTTPS          ┌─────────────────────────┐
│  GitHub Pages       │ ◀────────────────────▶ │  Railway                │
│  (前端 WebUI)        │    /api/* 代理         │  (FastAPI + Playwright)  │
│                     │                        │                         │
│  - Vue 3 SPA        │    WebSocket           │  - uvicorn :8080        │
│  - 静态资源 CDN     │ ◀────────────────────▶ │  - Chromium headless    │
│                     │    /ws/logs, /ws/status│  - Volume: /app/data    │
└─────────────────────┘                        └─────────────────────────┘
```

---

## 前置条件

| 要求 | 说明 |
|------|------|
| Railway 账号 | [railway.app](https://railway.app) — 支持 GitHub 登录 |
| GitHub 仓库 | 代码已推送到 GitHub |
| 信用卡/支付方式 | Hobby 计划需要（有 $5 免费额度） |

---

## 第一步：Railway 创建项目

1. 登录 [railway.app](https://railway.app)
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择你的 `MeitiCrawler` 仓库
4. Railway 会自动检测到 `railway.json` 和 `Dockerfile`

---

## 第二步：配置环境变量

在 Railway 项目 dashboard → 你的服务 → **Variables** 标签页添加：

### 必须设置

| 变量 | 值 | 说明 |
|------|-----|------|
| `PORT` | `8080` | Railway 会自动设置，无需手动 |
| `ENABLE_CDP_MODE` | `False` | Railway 无本地 Chrome，必须用 Playwright 内置 Chromium |
| `HEADLESS` | `True` | 服务器环境必须无头模式 |
| `SAVE_DATA_OPTION` | `jsonl` | 推荐 jsonl（纯文本，易存储）或 `postgres`（用 Railway PG） |
| `SAVE_DATA_PATH` | `/app/data` | Railway Volume 挂载路径，重启不丢失 |
| `CRAWLER_MAX_NOTES_COUNT` | `15` | 单次爬取最大帖子数 |
| `CRAWLER_MAX_SLEEP_SEC` | `2` | 请求间隔（秒） |

### 数据库（可选 — 推荐 Railway 托管 PostgreSQL）

| 变量 | 值 | 说明 |
|------|-----|------|
| `SAVE_DATA_OPTION` | `postgres` | 使用 PostgreSQL 存储（有去重功能） |
| `POSTGRES_DB_HOST` | `${{Postgres.RAILWAY_PRIVATE_DOMAIN}}` | Railway PG 内部域名 |
| `POSTGRES_DB_PORT` | `${{Postgres.PORT}}` | 通常是 5432 |
| `POSTGRES_DB_USER` | `${{Postgres.USER}}` | 自动生成的用户名 |
| `POSTGRES_DB_PWD` | `${{Postgres.PASSWORD}}` | 自动生成的密码 |
| `POSTGRES_DB_NAME` | `${{Postgres.DATABASE}}` | 数据库名 |

> 添加 PostgreSQL：在 Railway 项目 → New → Database → Add PostgreSQL → 连接变量会自动注入。

### Redis（可选 — 用于代理 IP 缓存和 SMS 验证码）

| 变量 | 值 | 说明 |
|------|-----|------|
| `REDIS_DB_HOST` | `${{Redis.RAILWAY_PRIVATE_DOMAIN}}` | Railway Redis 内部域名 |
| `REDIS_DB_PORT` | `${{Redis.PORT}}` | 通常是 6379 |
| `REDIS_DB_PWD` | `${{Redis.REDISPASSWORD}}` | 密码 |
| `REDIS_DB_NUM` | `0` | 数据库编号 |

### 代理 IP（可选）

| 变量 | 值 | 说明 |
|------|-----|------|
| `ENABLE_IP_PROXY` | `True` | 启用代理 |
| `IP_PROXY_PROVIDER_NAME` | `kuaidaili` | 或 `wandouhttp` |
| `KDL_SECERT_ID` | `your_id` | 快代理密钥 |
| `KDL_SIGNATURE` | `your_signature` | 快代理签名 |
| `KDL_USER_NAME` | `your_username` | 快代理用户名 |
| `KDL_USER_PWD` | `your_password` | 快代理密码 |

---

## 第三步：配置 Volume（持久化存储）

Railway 容器文件系统是临时的（重启后丢失），必须挂载 Volume 保存爬取数据。

1. 在服务 → **Settings** → **Volumes** → **Add Volume**
2. Mount path: `/app/data`
3. Railway 会自动创建并挂载

> ⚠️ 每个 service 只能挂载 1 个 volume。所有持久化数据（爬取结果、browser_data）都必须在 `/app/data` 下。

---

## 第四步：配置资源

Playwright + Chromium 内存消耗大，必须分配足够资源：

1. 服务 → **Settings** → **Resources**
2. **Memory**: 至少 **2048 MB**（推荐 4096 MB）
3. **CPU**: 至少 **2 vCPU**

---

## 第五步：配置自定义域名（可选）

1. 服务 → **Settings** → **Networking** → **Generate Domain**
   - 默认获得 `*.up.railway.app` 域名（已支持 HTTPS）
2. 或绑定自己的域名：**Custom Domains** → 添加域名 → 配置 DNS CNAME

---

## 第六步：部署

Railway 会在每次 `git push` 到 main 分支时自动重新部署。

手动触发：
```bash
git add .
git commit -m "chore: add Railway deployment config"
git push origin main
```

部署状态在 Railway dashboard → **Deployments** 查看。

---

## 第七步：前端连接后端

### 方式 A：Vite 代理（开发模式）

`webui/vite.config.ts` 中已配置 `/api` 代理。修改代理目标为 Railway 域名：

```ts
// webui/vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://your-app.up.railway.app',
      changeOrigin: true,
    },
  },
},
```

### 方式 B：生产构建（GitHub Pages）

GitHub Pages 不支持 vite.config.ts 的代理。需要在前端代码中配置 API 基础 URL。

1. 在 `webui/.env.production` 中：
```
VITE_API_BASE_URL=https://your-app.up.railway.app
```

2. 修改 `webui/src/lib/api.ts` 中的 baseURL：
```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})
```

3. 重新构建并推送到 GitHub：
```bash
cd webui
npm run build
git add .
git commit -m "chore: point API to Railway backend"
git push origin main
```

---

## 验证部署

部署完成后，访问以下端点验证：

| 端点 | 预期响应 |
|------|----------|
| `https://your-app.up.railway.app/api/health` | `{"status":"ok"}` |
| `https://your-app.up.railway.app/api/config/platforms` | 平台列表 JSON |
| `https://your-app.up.railway.app/api/config/options` | 配置选项 JSON |

---

## 常见问题

### Q: 浏览器启动失败 / 找不到 Chromium

**A**: 确保 `ENABLE_CDP_MODE=False` 且 `HEADLESS=True`。Railway 无本地 Chrome，必须用 Playwright 内置 Chromium。

### Q: 内存不足 / Chromium crash

**A**: 
1. 增加 Railway 服务 Memory 到 2GB+
2. 源码已包含 `--disable-dev-shm-usage`，无需额外配置
3. 设置 `RAILWAY_SHM_SIZE_BYTES=1073741824`（1GB）

### Q: 爬取数据丢失

**A**: 确保已挂载 Volume 到 `/app/data`，且 `SAVE_DATA_PATH=/app/data`。默认的 `data/` 目录在容器重启后会丢失。

### Q: 登录态无法保存

**A**: `browser_data/` 目录也在容器临时文件系统中。如需持久化登录态，修改 `config/base_config.py` 中的 `USER_DATA_DIR` 指向 `/app/data/browser_data/`。

### Q: WebSocket 连接断开

**A**: Railway 的 WebSocket 不受时间限制，可以保持长连接。如果频繁断开，检查 Railway 的 **Health check** 配置是否过于激进。

### Q: 成本估算

**A**: 
- Hobby 计划 $5/月（含 $5 用量）
- Chromium 常驻约 1-2 GB RAM → 约 $10-20/月
- 加上 CPU、Volume、网络，预计 **$15-30/月** 总成本

---

## 文件清单

| 文件 | 用途 |
|------|------|
| `Dockerfile` | 基于官方 Playwright 镜像构建后端容器 |
| `.dockerignore` | 排除前端、测试、文档等无关文件 |
| `railway.json` | Railway 构建和部署配置 |
| `RAILWAY_DEPLOY.md` | 本部署教程 |
