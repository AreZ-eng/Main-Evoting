# Gunakan image Node.js resmi
FROM node:20.17.0

# Buat user non-root untuk keamanan
RUN groupadd -r appuser && useradd -r -g appuser appuser

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

RUN chown -R appuser:appuser /app_main_api

# Buat direktori untuk sertifikat SSL
RUN mkdir -p /etc/ssl/private && chown -R appuser:appuser /etc/ssl/private

# Ekspos port untuk aplikasi
EXPOSE 5000

# Switch ke user non-root
USER appuser

# Jalankan aplikasi
CMD ["node", "server.js"]
