# Inventory Platform

Plataforma web de gestión de inventario multi-contexto (restaurantes, hospitales, retail, etc.) con autenticación JWT, roles y permisos granulares (RBAC).

## Tecnologías

**Frontend** -> Next.js 14, React, TypeScript, TailwindCSS, React Query
**Backend** -> Node.js, Express, TypeScript, Prisma ORM
**Base de datos** -> PostgreSQL 16
**Autenticación** -> JWT (access + refresh tokens), bcrypt, RBAC
**Infraestructura** -> Docker, docker-compose

## Estructura del Proyecto
inventory-platform/
├── backend/ # API REST con Express + Prisma
├── frontend/ # UI con Next.js + Tailwind
├── docker/ # Configuración Docker
├── api/ # Documentación OpenAPI/Swagger
├── database/ # Seeds y backups
└── docs/ # Documentación técnica


## ⚡ Inicio Rápido

### 1. Requisitos
- Node.js 18+
- Docker + Docker Compose
- PostgreSQL (vía Docker)

### 2. Configuración
bash
# Clonar repo
git clone https://github.com/tu-usuario/inventory-platform.git
cd inventory-platform

# Backend
cd backend
npm install
cp .env.example .env  # Editar con tus variables

# Frontend  
cd ../frontend
npm install
cp .env.example .env.local

# Levantar PostgreSQL
docker compose up -d

# Aplicar migraciones y seed
cd backend
npx prisma migrate dev --name init
npm run seed

# Backend (puerto 4000)
cd backend && npm run dev

# Frontend (puerto 3000)
cd frontend && npm run dev

Roles: Admin, Manager, Viewer
Email: admin@plataforma.com, (crear vía seed), (crear vía seed)
Contraseña: Admin123!, (crear vía seed), (crear vía seed)