# 独属计划 — 个人计划管理 APP

一款多用户、可云端部署、可打包 Android APK 的个人计划管理应用。

## 架构

```
┌─────────────┐   HTTPS/JSON    ┌──────────────────────────┐
│  前端 React  │ ──────────────► │  后端 Node.js（零依赖）   │
│  (Vite+MUI) │ ◄────────────── │  http + crypto + sqlite  │
│  + Capacitor │                 │  JWT 认证 + REST API     │
└─────────────┘                 └──────────────────────────┘
                                      │
                                      ▼
                                 SQLite 数据库
```

## 本次新增能力

| 需求 | 实现 |
|------|------|
| 注册/登录系统 | 用户名+密码注册登录，JWT 认证，密码 scrypt 加盐哈希，数据按用户隔离 |
| 后端 + 数据库 | Node.js 后端（Express→改为零依赖 http 模块），SQLite 持久化 |
| 云端部署 | Dockerfile + Railway/Render 部署说明，静态资源与 API 同端口托管 |
| 移动端 APK | Capacitor 打包为原生 Android APK（见 DEPLOY.md） |
| 日历修复 | 选中日期边框从 0→2px 改为恒定 2px（消除抖动）；点击相邻月份日期自动切换月份 |
| 毛玻璃 UI | 全局面板 backdrop-filter 模糊 + 渐变光斑背景，适配亮/暗色 |

## 技术栈

- **前端**：React 18 + TypeScript + MUI v5 + Tailwind + Vite 5
- **后端**：Node.js 22+ 内置模块（http / crypto / sqlite），零第三方依赖
- **数据库**：SQLite（`node:sqlite`）
- **认证**：JWT（HMAC-SHA256）+ scrypt 密码哈希
- **移动端**：Capacitor（Android）

## 目录结构

```
├── src/                 # 前端源码
│   ├── api/client.ts    # API 客户端（含鉴权、序列化）
│   ├── store/useStore.tsx # 全局状态（认证 + 数据 + 主题）
│   ├── pages/           # 登录/注册/仪表盘/日历/任务/计划/标签
│   └── components/
├── server/              # 后端（零依赖）
│   ├── index.js         # http 服务器 + 全部 API
│   ├── db.js            # SQLite 建表
│   └── auth.js          # 密码哈希 + JWT
├── capacitor.config.ts  # APK 打包配置
├── Dockerfile           # 云端容器化
├── DEPLOY.md            # 部署与 APK 构建指南
└── dist/                # 前端构建产物
```

## 运行

```bash
# 后端（无需 npm install）
cd server && node index.js     # http://localhost:3001

# 前端开发（可选，代理 /api 到 3001）
npm install && npm run dev     # http://localhost:3000

# 生产：构建前端后，后端直接托管
npm run build
# 访问 http://localhost:3001
```

## 关键约定

- 后端默认端口 3001，前端开发端口 3000
- 数据按 `user_id` 隔离，所有接口需 `Authorization: Bearer <token>`
- 环境变量：`JWT_SECRET`（必填）、`PORT`、`DB_PATH`、`VITE_API_URL`
- 主色 `#6366f1`，任务状态 `todo/inProgress/done`
