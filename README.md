# Orocampo — Sistema de Inventario

Sistema de gestión de inventario para productos lácteos (quesos), desarrollado como monorepo con Next.js, Express y PostgreSQL.

---

## Tabla de contenido x

- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Levantar con Docker (recomendado)](#levantar-con-docker-recomendado)
  - [Desarrollo](#desarrollo)
  - [Producción](#producción)
- [Levantar sin Docker](#levantar-sin-docker)
- [Base de datos](#base-de-datos)
- [Roles y accesos](#roles-y-accesos)
- [Rutas disponibles](#rutas-disponibles)

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | Express.js, Node.js 22 |
| Base de datos | PostgreSQL 17 |
| ORM | Prisma |
| Auth | JWT + bcryptjs |
| Validación | Zod |
| Monorepo | Turborepo |
| Lenguaje | TypeScript |

---

## Estructura del proyecto

```
Orocampo/
├── apps/
│   ├── api/              # Backend Express (puerto 4001)
│   │   ├── prisma/       # Schema y migraciones de base de datos
│   │   └── src/
│   │       ├── routes/   # Rutas de la API
│   │       ├── middleware/
│   │       └── lib/      # Prisma client, seed
│   └── web/              # Frontend Next.js (puerto 4000)
│       └── src/
│           ├── app/      # Páginas y rutas API proxy
│           └── components/
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
└── turbo.json
```

---

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/) (para levantar con Docker)
- Node.js 22+ y npm (para levantar sin Docker)

---

## Variables de entorno

El archivo `.env` **solo es necesario para producción**. En desarrollo las variables ya están definidas dentro de `docker-compose.dev.yml`.

Para producción, copia el ejemplo y completa los valores:

```bash
cp .env.example .env
```

Contenido del `.env`:

```env
# Base de datos
POSTGRES_USER=orocampo
POSTGRES_PASSWORD=orocampo123
POSTGRES_DB=orocampo_db

# Auth (cambia esto por algo seguro)
JWT_SECRET=change-this-in-production
```

---

## Levantar con Docker (recomendado)

### Desarrollo

No necesitas configurar nada. Las variables de entorno ya están incluidas en `docker-compose.dev.yml`.

```bash
# Primera vez o cuando cambies dependencias / Dockerfiles
npm run docker:dev:build

# Veces siguientes
npm run docker:dev
```

Para detenerlos:

```bash
npm run docker:dev:down
```

Los servicios quedan disponibles en:

| Servicio | URL |
|---|---|
| Frontend (web) | http://localhost:4000 |
| Backend (API) | http://localhost:4001 |
| PostgreSQL | localhost:5434 |

#### Poblar la base de datos en desarrollo (seed)

La primera vez que levantes el proyecto, corre el seed dentro del contenedor de la API:

```bash
docker exec -it orocampo_api_dev npm run db:seed
```

Esto crea los roles, el usuario root y los tipos de producto iniciales.

### Producción

Asegúrate de tener el `.env` configurado antes de levantar.

```bash
# Primera vez o cuando cambies código
npm run docker:prod:build

# Veces siguientes
npm run docker:prod
```

#### Poblar la base de datos en producción (seed)

```bash
docker exec -it orocampo_api_prod npm run db:seed
```

---

## Levantar sin Docker

Si prefieres correr el proyecto localmente sin Docker, necesitas tener PostgreSQL instalado y corriendo.

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la base de datos

Asegúrate de que tu `.env` tenga la `DATABASE_URL` apuntando a tu PostgreSQL local. Por ejemplo:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/orocampo_db
```

### 3. Aplicar el schema y poblar la base de datos

```bash
cd apps/api

# Aplica el schema a la base de datos
npm run db:push

# Carga los datos iniciales (roles, usuario root, tipos de queso)
npm run db:seed
```

### 4. Levantar en modo desarrollo

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto levanta tanto la API (puerto 4001) como el frontend (puerto 4000) en paralelo con Turborepo.

---

## Base de datos

### Comandos útiles de Prisma

Ejecutar desde `apps/api/`:

```bash
# Aplicar cambios del schema sin migración formal
npm run db:push

# Crear una migración
npm run db:migrate

# Regenerar el cliente de Prisma
npm run db:generate

# Poblar la base de datos con datos iniciales
npm run db:seed

# Abrir Prisma Studio (interfaz visual de la BD)
npx prisma studio
```

### Datos iniciales (seed)

Al correr `db:seed` se crean automáticamente:

**Roles:**
- Root
- Administrador
- Secretaria
- Domiciliario

**Usuario por defecto:**
| Campo | Valor |
|---|---|
| Email | `root@orocampo.com` |
| Contraseña | `root123` |
| Rol | Root |

**Tipos de producto:**
- Queso Blanco
- Doble Crema
- Costeño

---

## Roles y accesos

| Rol | Acceso |
|---|---|
| **Root** | Gestión de usuarios, acceso total |
| **Administrador** | Ver inventario y resumen de stock |
| **Secretaria** | Registrar entradas y movimientos de inventario |
| **Domiciliario** | Sin acceso a panel (rol informativo) |

---

## Rutas disponibles

### Frontend (Next.js)

| Ruta | Descripción | Rol requerido |
|---|---|---|
| `/login` | Inicio de sesión | Público |
| `/dashboard` | Panel principal | Cualquier usuario autenticado |
| `/admin/usuarios` | Gestión de usuarios | Root |
| `/secretaria/inventario` | Registro de inventario | Secretaria |
| `/secretaria/movimientos` | Registro de movimientos | Secretaria |

### API (Express)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servidor |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Perfil del usuario actual |
| GET | `/users` | Listar usuarios |
| POST | `/users` | Crear usuario |
| PUT | `/users/:id` | Editar usuario |
| PATCH | `/users/:id/toggle` | Activar / desactivar usuario |
| GET | `/inventory/summary` | Resumen de stock por tipo |
| GET | `/inventory/alerts` | Alertas de stock bajo y próximos a vencer |
| GET | `/inventory/entries` | Listar lotes |
| POST | `/inventory/entries` | Registrar nuevo lote |
| GET | `/inventory/movements` | Historial de movimientos |
| POST | `/inventory/movements` | Registrar movimiento |
| GET | `/product-types` | Listar tipos de producto |
| POST | `/product-types` | Crear tipo de producto |
| PUT | `/product-types/:id` | Editar tipo de producto |
