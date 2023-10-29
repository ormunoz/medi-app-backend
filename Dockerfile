# Utiliza una imagen base de Node.js
FROM node:20.1.0

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de tu proyecto, incluyendo package.json y package-lock.json
COPY package*.json ./

COPY . .

COPY .env .env

# Instala las dependencias de tu proyecto
RUN npm install

# Instala nodemon de forma global
RUN npm install -g nodemon

# Instala las herramientas de línea de comandos de Prisma globalmente
RUN npm install -g prisma

# Genera el modelo Prisma y aplica las migraciones (ajusta el comando según tu configuración)
RUN prisma generate

# Instala las dependencias (en este caso, bcrypt)
RUN npm install bcrypt

# Expone el puerto en el que se ejecutará tu aplicación (ajusta según tu configuración)
EXPOSE 5000

# Comando para iniciar tu aplicación Node.js (ajusta según tu configuración)
CMD ["npm","run", "dev"]