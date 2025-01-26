# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# 启用 standalone 输出（使用 ES 模块语法）
RUN echo 'export default {output: "standalone"};' > next.config.js
RUN npm run build

# 生产阶段
FROM node:20-alpine
WORKDIR /app

# 只复制 standalone 构建产物
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000/tcp
CMD ["node", "server.js"]