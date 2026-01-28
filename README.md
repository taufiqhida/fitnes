# IMT Fitness Management System

Aplikasi web untuk manajemen fitness dengan tracking IMT, jadwal latihan, dan komunikasi coach-client.

## 🚀 Fitur Utama

- **Dashboard Client**: Tracking IMT, kurva progres, jadwal latihan
- **Dashboard Coach**: Manajemen client, rekomendasi latihan, monitoring progres
- **Admin Panel**: Manajemen user dan konten
- **Real-time Chat**: Komunikasi antara coach dan client
- **Video Library**: Koleksi video latihan berdasarkan kategori IMT
- **IMT History**: Visualisasi progres dengan grafik interaktif
- **Rekomendasi Makanan**: Saran makanan sehat berdasarkan kategori

## 📋 Persyaratan Sistem

- **Node.js** v18.x atau lebih tinggi
- **PostgreSQL** v14 atau lebih tinggi
- **NPM** v8.x atau lebih tinggi
- **Git**

## 🛠️ Instalasi di VPS (Ubuntu/Debian)

### 1. Update Sistem

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi instalasi
node --version
npm --version
```

### 3. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Buat database dan user
sudo -u postgres psql
```

Di dalam PostgreSQL console:

```sql
CREATE DATABASE fitness_db;
CREATE USER fitness_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE fitness_db TO fitness_user;
\q
```

### 4. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 5. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/taufiqhida/fitnes.git
sudo chown -R $USER:$USER fitnes
cd fitnes
```

## ⚙️ Konfigurasi

### Backend Configuration

1. **Buat file `.env` di folder backend**

```bash
cd backend
nano .env
```

2. **Isi file `.env`:**

```env
# Database
DATABASE_URL="postgresql://fitness_user:your_secure_password@localhost:5432/fitness_db"

# JWT Secret (ganti dengan string random yang kuat)
JWT_SECRET="your-very-secure-random-secret-key-here-change-this"

# Server Port
PORT=5002
```

3. **Install dependencies dan setup database:**

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
```

### Frontend Configuration

1. **Update API URL untuk production**

Edit file `frontend/src/pages/*/` yang menggunakan API_URL:

```bash
cd ../frontend
```

Ganti `http://localhost:5002` dengan IP/domain VPS Anda:
- Jika menggunakan IP: `http://your-vps-ip:5002`
- Jika menggunakan domain: `https://api.yourdomain.com`

2. **Install dependencies:**

```bash
npm install
```

3. **Build production:**

```bash
npm run build
```

## 🚀 Menjalankan Aplikasi

### Development Mode (untuk testing)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Mode dengan PM2

1. **Jalankan Backend:**

```bash
cd /var/www/fitnes/backend
pm2 start src/index.js --name fitness-backend
```

2. **Build dan serve Frontend:**

```bash
cd /var/www/fitnes/frontend
npm run build
pm2 serve dist 5173 --name fitness-frontend --spa
```

3. **Simpan konfigurasi PM2:**

```bash
pm2 save
pm2 startup
```

4. **Monitoring:**

```bash
# Lihat status
pm2 status

# Lihat logs
pm2 logs fitness-backend
pm2 logs fitness-frontend

# Restart aplikasi
pm2 restart fitness-backend
pm2 restart fitness-frontend
```

## 🌐 Setup Nginx (Opsional, untuk Production)

### 1. Install Nginx

```bash
sudo apt install -y nginx
```

### 2. Konfigurasi Nginx

```bash
sudo nano /etc/nginx/sites-available/fitness
```

**Isi konfigurasi:**

```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/fitnes/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy untuk API
    location /api {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API (jika ingin akses langsung)
server {
    listen 5002;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Aktifkan Konfigurasi

```bash
sudo ln -s /etc/nginx/sites-available/fitness /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Setup SSL (HTTPS) dengan Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔐 Keamanan

1. **Firewall (UFW):**

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5002/tcp
sudo ufw enable
```

2. **Ganti JWT Secret:**
   - Edit `backend/.env`
   - Gunakan string random yang kuat untuk `JWT_SECRET`

3. **Secure PostgreSQL:**

```bash
sudo -u postgres psql
\password postgres
```

## 📝 Login Credentials Default

Setelah seeding database:

- **Admin**: 
  - Phone: `admin`
  - Password: `admin`

- **Coach Budi**:
  - Phone: `pelatih`
  - Password: `pelatih`

- **Coach Larisa**:
  - Phone: `larisa`
  - Password: `pelatih`

- **Client**:
  - Phone: `081234567801` - `081234567825`
  - Password: `client123`

**⚠️ PENTING**: Ganti semua password default setelah deployment!

## 🔄 Update Aplikasi

```bash
cd /var/www/fitnes

# Pull perubahan terbaru
git pull origin main

# Update Backend
cd backend
npm install
npx prisma generate
npx prisma db push
pm2 restart fitness-backend

# Update Frontend
cd ../frontend
npm install
npm run build
pm2 restart fitness-frontend
```

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Cek status PostgreSQL
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Cek koneksi
psql -U fitness_user -d fitness_db -h localhost
```

### Port Already in Use

```bash
# Cari process yang menggunakan port
sudo lsof -i :5002
sudo lsof -i :5173

# Kill process
sudo kill -9 <PID>
```

### PM2 Issues

```bash
# Restart semua
pm2 restart all

# Hapus semua dan mulai ulang
pm2 delete all
pm2 start ecosystem.config.js
```

### Nginx Issues

```bash
# Test konfigurasi
sudo nginx -t

# Cek logs
sudo tail -f /var/log/nginx/error.log
```

## 📊 Monitoring

```bash
# CPU & Memory usage
pm2 monit

# Real-time logs
pm2 logs

# Process status
pm2 status

# System resources
htop
```

## 🤝 Support

Untuk bantuan lebih lanjut:
- Email: support@yourapp.com
- GitHub Issues: https://github.com/taufiqhida/fitnes/issues

## 📄 License

MIT License - Feel free to use this project for your purposes.

---

**Dibuat dengan ❤️ untuk manajemen fitness yang lebih baik**
