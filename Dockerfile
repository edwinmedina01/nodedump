FROM node:18-slim

# Instala el cliente de MySQL (trae mysqldump)
RUN apt-get update && apt-get install -y mysql-client && apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
