FROM node:20-alpine

WORKDIR /app

# Instalar dependencias nativas necesarias para better-sqlite3
RUN apk add --no-cache python3 make g++

# Copiar manifiestos e instalar solo dependencias de producción
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Crear directorio de datos con permisos correctos
RUN mkdir -p data && chown -R node:node /app

USER node

EXPOSE 3001

CMD ["node", "server.js"]
