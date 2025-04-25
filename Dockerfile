# Imagen base más completa (no slim)
FROM node:18-bullseye

# Instala mysql-client
RUN apt-get update && \
    apt-get install -y gnupg && \
    apt-get install -y mysql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
