# 🌙 NightDUTY Buchhaltungssystem

Ein umfassendes Buchhaltungs- und Abrechnungssystem für Nachtdienst-Verwaltung. 

## 🚀 Features

- 📊 **Dashboard** mit Echtzeit-Übersicht
- 🏢 **Firmenverwaltung** (24 aktive Firmen)
- 📄 **Rechnungserstellung** mit PDF-Export
- 💰 **Zahlungsverwaltung**
- ⚠️ **Mahnwesen** (3 Mahnstufen)
- 📧 **Email-Versand** (SMTP)
- ⏰ **Stundenreports** & Ausgleich
- 🚗 **Frühzeitige Übernahmen**
- 👥 **Benutzerverwaltung** mit Rollen

## 🛠️ Tech Stack

### Frontend
- Vue 3 + TypeScript
- Vite
- TailwindCSS
- Pinia (State Management)
- Vue Router
- Axios

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- PDFKit (PDF-Generierung)
- Nodemailer (Email)

### Infrastructure
- Docker (PostgreSQL)
- Nginx (Reverse Proxy)
- PM2 (Process Manager)

## 📋 Voraussetzungen

- Node.js 20. x oder höher
- PostgreSQL 16
- Docker & Docker Compose
- Nginx

## 🔧 Installation

### 1. Repository klonen
\`\`\`bash
git clone https://github.com/ElyasRa/NightDUTY-Buchhaltung.git
cd NightDUTY-Buchhaltung
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install

# . env Datei erstellen
cp .env.example .env
# Bearbeiten Sie . env mit Ihren Daten

# Prisma Setup
npx prisma generate
npx prisma db push
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd frontend
npm install
\`\`\`

### 4. Database Setup (Docker)
\`\`\`bash
docker-compose up -d postgres
\`\`\`

## 🚀 Development

### Backend starten
\`\`\`bash
cd backend
npm start
\`\`\`

### Frontend starten
\`\`\`bash
cd frontend
npm run dev
\`\`\`

## 📦 Production Deployment

### Mit PM2
\`\`\`bash
pm2 start backend/src/index.ts --name nightduty-backend
pm2 start "cd frontend && npm run dev" --name nightduty-frontend
pm2 save
\`\`\`

### Nginx Konfiguration
Siehe \`/etc/nginx/sites-available/nightduty\`

## 🗄️ Datenbank-Schema

- **User** - Benutzerverwaltung
- **Company** - Firmenverwaltung mit Wochenplänen
- **Invoice** - Rechnungen
- **Payment** - Zahlungen
- **Dunning** - Mahnungen
- **EarlyTakeover** - Frühzeitige Übernahmen
- **HoursCompensation** - Stundenausgleich
- **SystemSettings** - SMTP/Email-Konfiguration

## 📧 Email-System

Dokumentation siehe:  [EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md)

## 🔐 Sicherheit

- JWT-basierte Authentifizierung
- Bcrypt Password Hashing
- CORS konfiguriert
- SQL Injection Protection (Prisma)

## 📝 Lizenz

Proprietär - Alle Rechte vorbehalten

## 👨‍💻 Autor

Ilias (@ElyasRa)
