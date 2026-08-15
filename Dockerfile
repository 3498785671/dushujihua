# ---- 构建阶段：构建前端 ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm install
COPY . .
RUN npm run build

# ---- 运行阶段：运行后端 + 托管前端 ----
# 后端零第三方依赖，只需 Node 内置模块
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
# 数据库文件路径（挂载持久化卷到 /data）
ENV DB_PATH=/data/app.sqlite

# 后端源码 + 前端产物
COPY server/*.js server/
COPY --from=build /app/dist ./dist

# 数据持久化卷
VOLUME ["/data"]

EXPOSE 3001
CMD ["node", "server/index.js"]
