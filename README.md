# BoilerPlates.Nest_GraphQL

![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![NestJS](https://img.shields.io/badge/NestJS-10-red?logo=nestjs)
![GraphQL](https://img.shields.io/badge/GraphQL-16-e10098?logo=graphql)
![Prisma](https://img.shields.io/badge/Prisma-5-blue?logo=prisma)
![Postgres](https://img.shields.io/badge/Postgres-17-blue?logo=postgresql)
![Apollo](https://img.shields.io/badge/Apollo-3-311c87?logo=apollo-graphql)
![License](https://img.shields.io/badge/License-MIT-yellow)

A boilerplate setup for running a **NestJS** backend with **GraphQL**, **PostgreSQL** and **Prisma ORM** using Docker Compose.
This repository provides a ready-to-use **NestJS + GraphQL API** connected to PostgreSQL for rapid backend development.

---

## 🚀 Features

- NestJS + GraphQL API with Apollo Server
- PostgreSQL database running in Docker
- Prisma ORM for type-safe database access
- GraphQL Playground for API exploration
- Role-based access control with GraphQL guards
- pgAdmin 4 for database management
- Environment-based configuration
- Fully Dockerized for easy setup and deployment

---

## 📂 Project Structure

```
BoilerPlates.Nest_GraphQL/
├───prisma/
│   ├── schema.prisma        # Database schema with models
│   └── seed.ts              # Database seeding script
└───src/
   ├───main.ts               # NestJS entry point
   ├───app/                  # Application core
   │   ├── app.module.ts     # Root module
   │   ├── app.controller.ts # Root controller
   │   └── app.service.ts    # Root service
   ├───auth/                 # Authentication module
   │   ├── auth.resolver.ts  # GraphQL resolver
   │   ├── auth.service.ts
   │   ├── auth.module.ts
   │   └── auth.inputs.ts    # GraphQL input types
   ├───user/                 # User management
   │   ├── user.resolver.ts  # GraphQL resolver
   │   ├── user.service.ts
   │   ├── user.module.ts
   │   ├── user.types.ts     # GraphQL object types
   │   └── user.inputs.ts    # GraphQL input types
   ├───role/                 # Role management
   │   ├── role.resolver.ts  # GraphQL resolver
   │   ├── role.service.ts
   │   ├── role.module.ts
   │   ├── role.types.ts     # GraphQL object types
   │   └── role.inputs.ts    # GraphQL input types
   ├───permission/           # Permission management
   │   ├── permission.resolver.ts # GraphQL resolver
   │   ├── permission.service.ts
   │   ├── permission.module.ts
   │   ├── permission.types.ts    # GraphQL object types
   │   └── permission.inputs.ts   # GraphQL input types
   └───prisma/
       └── prisma.service.ts # Prisma database service
```

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/ThisIsTheWizard/BoilerPlates.Nest_GraphQL.git
cd BoilerPlates.Nest_GraphQL
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.sample` to `.env` and update your configuration:

```bash
cp .env.sample .env
```

Example `.env` entries:

```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
PORT=8000
```

### 4. Start services with Docker

```bash
docker-compose up -d --build
```

---

## 🌐 Access

- **GraphQL Playground** → [http://localhost:8000/graphql](http://localhost:8000/graphql)
- **NestJS API** → [http://localhost:8000](http://localhost:8000)
- **PostgreSQL** → [http://localhost:5432](http://localhost:5432)
- **pgAdmin** → [http://localhost:4000](http://localhost:4000)
  Use credentials from `.env`

---

## 🛠️ Commands

- Start containers:

```bash
docker-compose up -d --build
```

- Stop containers:

```bash
docker-compose down
```

- View logs:

```bash
docker-compose logs -f
```

- Run NestJS server locally (without Docker):

```bash
npm run start:dev
```

- Run Prisma migrations:

```bash
npx prisma migrate dev
```

- Generate Prisma client:

```bash
npx prisma generate
```

- Seed the database:

```bash
ts-node prisma/seed.ts
```

---

## 📦 Volumes

Data is persisted via Docker volumes:

- `node_server_data` → Stores Node server files for hot reload in dev mode
- `postgres_admin_data` → Stores pgAdmin configuration
- `postgres_data` → Stores PostgreSQL database files

---

## 📝 License

This boilerplate is provided under the MIT License.
Feel free to use and modify it for your projects.

---

👋 Created by [Elias Shekh](https://sheikhthewizard.world)
If you find this useful, ⭐ the repo or reach out!
