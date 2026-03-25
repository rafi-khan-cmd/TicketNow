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
- Deployment: Render Web Service + Render Postgres
- Structure: Monorepo (`/client`, `/server`)

## Features

- Ticket submission form
  - title, description, category, priority, requester details, department, optional attachment URL
- Ticket lifecycle
  - statuses: Open, In Progress, Waiting on User, Resolved, Closed
  - assignment, escalation notes, resolution notes, timestamps
- Dashboard analytics
  - total/open/resolved cards
  - tickets by status/category/priority
  - average resolution hours
  - overdue/SLA risk section
  - recent activity section
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

## Render Deployment

### Services
1. Create a Render Postgres instance
2. Create a Render Web Service for backend (`server`)
3. Create a Render Static Site (or second Web Service) for frontend (`client`)

### Backend settings
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm run start`
- Env Vars:
  - `NODE_ENV=production`
  - `PORT=10000` (or Render default)
  - `DATABASE_URL=<Render Postgres Internal URL>`
  - `CLIENT_URL=<frontend public URL>`
  - `AGING_THRESHOLD_HOURS=48`

Run seed once after deployment:
- Render Shell/One-off command: `npm run seed`

### Frontend settings
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Env Vars:
  - `VITE_API_BASE_URL=<backend public URL>/api`

## Incremental Build Checklist (Implemented)

1. Folder structure + package setup + schema
2. Backend API + validation + logging + error handling
3. Frontend pages + reusable components + analytics charts
4. Seed data (28 tickets) + smoke test
5. Local run docs + Render deployment guide
