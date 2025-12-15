# Build stage
FROM node:lts-alpine AS builder
WORKDIR /app

# Install deps first for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --ignore-scripts

# Copy source
COPY tsconfig.json ./
COPY src ./src
COPY data ./data

# Build TypeScript to JS
RUN npm run build

# Runtime stage
FROM node:lts-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy only built app and required files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

EXPOSE 3001
CMD ["node", "dist/app.js"]
