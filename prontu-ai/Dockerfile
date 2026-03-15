# ============================================
# Stage 1: Build the React+Vite application
# ============================================
FROM node:22-bookworm-slim AS build

WORKDIR /app

# Cache layer: copia apenas os manifestos do Node primeiro
COPY package.json package-lock.json ./

# Instala as dependências de forma limpa e determinística
RUN npm ci

# Copia o restante do código fonte (ignorado pelo .dockerignore)
COPY . .

# Injeta variáveis de ambiente no momento do build (o Vite exige isto)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_N8N_BASE_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_N8N_BASE_URL=$VITE_N8N_BASE_URL

# Executa o build da aplicação frontend
RUN npm run build

# ============================================
# Stage 2: Serve with Nginx (Alpine) - Secure
# ============================================
FROM nginx:1-alpine3.21 AS runtime

# Remove as configurações padrão e ficheiros estáticos padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copia a sua configuração Nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os artefactos gerados no Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Ajusta as permissões para o utilizador nativo 'nginx'
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Transição de Privilégio: Daqui para baixo, o processo deixa de ser root
USER nginx

# O Nginx non-root não pode escutar na porta 80. Usaremos a 8080.
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]