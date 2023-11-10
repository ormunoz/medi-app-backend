# Utiliza una imagen base de Node.js
FROM node:20.1.0

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de tu proyecto, incluyendo package.json y package-lock.json
COPY package*.json ./

COPY . .

# COPY .env .env

# Instala las dependencias de tu proyecto
RUN npm install

# Instala nodemon de forma global

RUN npx prisma generate 

EXPOSE 5000

# Comando para iniciar tu aplicación Node.js (ajusta según tu configuración)
CMD ["npm","run", "dev"]