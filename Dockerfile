# Usa una imagen de Node más completa (no slim)
FROM node:18-bullseye

# Evita errores de timezone y claves rotas
ENV DEBIAN_FRONTEND=noninteractive

# Instalación segura de mysql-client
RUN apt-get update && \
    apt-get install -y --no-install-recommends mysql-client && \
    rm -rf /var/lib/apt/lists/*

# Carpeta de trabajo
WORKDIR /app

# Copiar dependencias y código
COPY package*.json ./
RUN npm install
COPY . .

# Expone el puerto
EXPOSE 8080

# Arranca la app
CMD ["node", "index.js"]
