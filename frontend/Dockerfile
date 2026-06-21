# --- Estágio de Build ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Estágio de Produção ---
FROM nginx:alpine

# Copiar build estático do Vite
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copiar arquivo de configuração do Nginx para suportar React Router (removendo 404 em refresh)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
