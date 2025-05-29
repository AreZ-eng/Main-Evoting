# Gunakan image Node.js resmi
FROM node:20.14.0

# Direktori kerja dalam kontainer
WORKDIR /app_main_api

# Salin file package.json dan package-lock.json terlebih dahulu untuk memanfaatkan cache Docker
COPY package*.json ./

# Install dependencies
RUN npm install

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client nano && \
    rm -rf /var/lib/apt/lists/*

# Salin aplikasi ke dalam kontainer
COPY . .

# Salin sertifikat SSL ke direktori yang tepat
COPY certs/server.key /etc/ssl/private/server.key
COPY certs/server.crt /etc/ssl/private/server.crt

# Ekspos port untuk aplikasi
EXPOSE 5000

# Jalankan aplikasi
CMD ["node", "server.js"]
