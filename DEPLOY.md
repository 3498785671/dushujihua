# 独属计划 - 部署与构建指南

个人计划管理 APP，采用「前端（React）+ 后端（Node.js + SQLite）」架构，支持多用户注册登录、云端部署、打包 Android APK。

## 目录结构

```
├── src/                 # 前端源码（React + TS + MUI）
├── server/              # 后端源码（Express + SQLite + JWT）
│   ├── index.js         # 服务入口 + 全部 API
│   ├── db.js            # 数据库初始化
│   ├── auth.js          # 密码哈希 + JWT
│   └── data.sqlite      # SQLite 数据库（运行后自动生成）
├── capacitor.config.ts  # Capacitor 打包配置
├── Dockerfile           # 云端容器化部署
└── dist/                # 前端构建产物（npm run build 生成）
```

## 一、本地开发

**后端**（默认端口 3001）：

```bash
cd server
npm install
npm start        # 或 npm run dev（自动重启）
```

**前端**（默认端口 3000，自动代理 /api 到 3001）：

```bash
npm install
npm run dev
```

打开 http://localhost:3000 ，注册账号即可使用。

## 二、云端部署

后端内置了前端静态托管：生产环境把 `dist/` 放在后端同级目录，后端会在 3001 端口同时提供 API 和页面。数据存 SQLite 文件，**务必挂载持久化卷**，否则重启会丢数据。

### 方式 A：Docker

```bash
docker build -t dushu-plan .
docker run -d -p 3001:3001 -v dushu-data:/data -e JWT_SECRET=你的强随机密钥 dushu-plan
```

### 方式 B：Railway / Render 等托管平台

1. 推送代码到 GitHub
2. 平台选择「Dockerfile」部署方式
3. 添加持久化卷，挂载到 `/data`
4. 设置环境变量：
   - `JWT_SECRET`：强随机密钥（必填）
   - `PORT`：默认 3001
   - `DB_PATH`：默认 `/data/app.sqlite`

部署完成后，得到后端地址如 `https://xxx.up.railway.app`。

## 三、打包 Android APK

### 前置条件（一次性）

1. 安装 [Android Studio](https://developer.android.com/studio)（内含 Android SDK + JDK 17）
2. 配置环境变量 `ANDROID_HOME` 指向 SDK 目录

### 构建步骤

```bash
# 1. 安装 Capacitor 依赖并生成 android 工程（首次）
npm install
npx cap add android

# 2. 指定云端后端地址并构建前端
#    （把下面地址换成你第二步部署得到的后端地址）
VITE_API_URL=https://xxx.up.railway.app npm run build

# 3. 同步前端产物到 android 工程
npx cap sync android

# 4. 用 Android Studio 打开 android/ 目录，或命令行打包
cd android
./gradlew assembleDebug
# 产物位于 android/app/build/outputs/apk/debug/app-debug.apk
```

> 正式发布建议用 `./gradlew assembleRelease` 并配置签名（keystore）。

### 修改 appId / 应用名

编辑 `capacitor.config.ts` 的 `appId` 和 `appName`，然后 `npx cap sync android`。

## 四、环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `JWT_SECRET` | JWT 签名密钥（生产必填，强随机） | 开发用固定值 |
| `PORT` | 后端端口 | 3001 |
| `DB_PATH` | SQLite 文件路径 | server/data.sqlite |
| `VITE_API_URL` | 前端调用的后端地址（打包 APK/生产必填） | 空（走同源 /api） |

## 五、安全提示

- 生产环境务必设置强随机 `JWT_SECRET`
- 密码使用 scrypt + 随机盐哈希存储，不存明文
- 所有数据接口均需 JWT 鉴权，数据按用户隔离
