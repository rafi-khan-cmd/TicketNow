# TicketNow - IT Support Ticketing System

A full-stack portfolio project that simulates internal IT application support workflows:
triage, prioritization, assignment, SLA risk tracking, lifecycle management, and operations analytics.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Query Layer: `pg` with a clean DB/service module
- Charts: Recharts
- Auth: Mock login context (extensible to real auth later)
- Deployment: Vercel (frontend) + Koyeb (backend) + Neon Postgres
- Structure: Monorepo (`/client`, `/server`)

## Features

- Ticket submission form
  - title, description, category, priority, requester details, department, optional attachment URL
- Ticket lifecycle
  - statuses: Open, In Progress, Waiting on User, Resolved, Closed
  - assignment, escalation notes, resolution notes, timestamps
  - impact + urgency fields with SLA-aware triage
- Dashboard analytics
  - total/open/resolved cards
  - tickets by status/category/priority
  - average resolution hours
  - overdue/SLA risk section
  - recent activity section
  - SLA breached counter
- Ticket management page
  - filter by status/priority/category
  - search by title/requester
  - sort by newest/oldest/highest priority
  - CSV export with current filter set
- Ticket detail page
  - full ticket details
  - lifecycle update + assignment
  - internal/escalation/resolution notes
  - status history timeline
- Triage realism
  - access + high/critical visual flag
  - aging/SLA risk logic based on configurable threshold
- Asset management
  - endpoint and infrastructure inventory registry
  - link tickets to assets
- Knowledge base
  - searchable KB articles
  - related KB suggestions in ticket detail
- Role-based access (mock auth)
  - Requester: create/view tickets
  - Agent: triage/update tickets and add notes
  - Admin: asset and knowledge base management
- Seed data
  - 28 realistic tickets and 4 support agents

## Monorepo Structure

- `client` - React dashboard UI
- `server` - Express API + PostgreSQL schema/services
- `server/src/db/schema.sql` - relational schema
- `server/scripts/seed.js` - demo seed script

## Mandatory Runtime Files

These are the only essential files/folders required for this project to run:

- `package.json` and `package-lock.json`
- `.gitignore`
- `.env.example` (copy to `.env`)
- `client/`
- `server/`
- `README.md`

## Database Schema

Core tables:
- `tickets`
- `ticket_notes`
- `agents`
- `ticket_status_history`
- `assets`
- `knowledge_base_articles`

Includes key fields from the requirement list:
- `id`, `title`, `description`, `category`, `priority`, `status`
- `requester_name`, `requester_email`, `department`
- `assigned_to`, `resolution_notes`, `escalation_notes`
- `created_at`, `updated_at`, `resolved_at`

## API Endpoints

Base URL: `/api`

- `GET /health`
- `GET /dashboard`
- `GET /agents`
- `GET /tickets`
  - query params: `status`, `priority`, `category`, `q`, `sort`
- `GET /tickets/export/csv`
  - query params: `status`, `priority`, `category`, `q`, `sort`
- `GET /tickets/:id`
- `POST /tickets`
- `PATCH /tickets/:id`
- `POST /notes`
- `GET /assets`
- `POST /assets` (Agent/Admin)
- `PATCH /assets/:id` (Admin)
- `GET /knowledge-base`
- `POST /knowledge-base` (Agent/Admin)

## Local Setup

### 1) Prerequisites
- Node.js 20+
- PostgreSQL 14+

### 2) Clone and install

```bash
npm install
npm install --workspace server
npm install --workspace client
```

### 3) Environment variables

Copy `.env.example` to `.env` and adjust values.

Required values:
- `PORT`
- `DATABASE_URL`
- `CLIENT_URL`
- `AGING_THRESHOLD_HOURS`
- `VITE_API_BASE_URL`

If your local Postgres role is your macOS username (common with Homebrew),
use a connection string like:

`DATABASE_URL=postgresql://rafiulalamkhan:postgres@localhost:5432/ticketnow`

### 4) Create DB

```sql
CREATE DATABASE ticketnow;
```

### 5) Seed demo data

```bash
npm run seed
```

### 6) Run app

```bash
npm run dev
```

- Client: `http://localhost:5173`
- API: `http://localhost:4000/api`

## Scripts

Root:
- `npm run dev` - start server + client concurrently
- `npm run build` - build both packages
- `npm run seed` - seed DB via server script
- `npm run start` - start server
- `npm run test` - run server tests

Server:
- `npm run dev --workspace server`
- `npm run start --workspace server`
- `npm run seed --workspace server`
- `npm run test --workspace server`

Client:
- `npm run dev --workspace client`
- `npm run build --workspace client`

## Deployment (Vercel + Koyeb + Neon)

### Architecture
1. Neon Postgres for managed free-tier database
2. Koyeb Web Service for backend API (`server`)
3. Vercel project for frontend SPA (`client`)

### 1) Neon Postgres
- Create a Neon project and copy the connection string
- Use this as `DATABASE_URL` in backend hosting

### 2) Backend on Koyeb
- Create app from GitHub repo
- Service name: `ticketnow-api`
- Root directory: `server`
- Build command: `npm install`
- Run command: `npm run start`
- Environment variables:
  - `NODE_ENV=production`
  - `PORT=8000`
  - `DATABASE_URL=<Neon connection string>`
  - `CLIENT_URL=<your Vercel frontend URL>`
  - `AGING_THRESHOLD_HOURS=48`

After first deploy, run seed once in Koyeb console:
- `npm run seed`

### 3) Frontend on Vercel
- Import GitHub repo into Vercel
- Set root directory to `client`
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_BASE_URL=<Koyeb backend URL>/api`

`client/vercel.json` is included to rewrite all routes to `index.html` for React Router.

## Incremental Build Checklist (Implemented)

1. Folder structure + package setup + schema
2. Backend API + validation + logging + error handling
3. Frontend pages + reusable components + analytics charts
4. Seed data (28 tickets) + smoke test
5. Local run docs + cloud deployment guide
