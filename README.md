# Node.js BFF (Backend for Frontend) API

[![CI](https://github.com/sadiks/nodejsApis/actions/workflows/ci.yml/badge.svg)](https://github.com/sadiks/nodejsApis/actions)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A production-grade **Backend for Frontend (BFF)** API built with Node.js and Express. Demonstrates the BFF architectural pattern — aggregating multiple downstream microservices into a single, UI-optimised response for React Micro Frontend (MFE) clients.

---

## What is BFF?

In a Micro Frontend architecture, each frontend widget could independently call 3–5 downstream services. The BFF pattern introduces a **dedicated server-side layer** that:

- **Aggregates** multiple service calls into one shaped response (`Promise.allSettled`)
- **Reduces** client-side network requests (3 calls → 1)
- **Isolates** the frontend from internal service contract changes
- **Centralises** auth, rate limiting, and error formatting per client type

```
React MFE Dashboard
       │
       ▼
  ┌─────────┐
  │   BFF   │  ◄── This project
  └────┬────┘
       │ (parallel)
  ┌────┴──────────────┐
  ▼         ▼         ▼
User     Orders   Notifications
Service  Service  Service
```

---

## Features

- **JWT Authentication** — access + refresh token flow with role-based access control
- **BFF Aggregation** — `Promise.allSettled` parallel calls with partial-failure resilience
- **Rate Limiting** — global limiter + strict auth endpoint limiter
- **Security Headers** — Helmet.js, CORS origin whitelist
- **Structured Logging** — JSON in production, readable in development
- **Standardised Responses** — consistent `{ success, data, message, timestamp }` envelope
- **Graceful Shutdown** — SIGTERM/SIGINT handling for containerised deployments
- **Health Check** endpoint for Docker / Kubernetes probes
- **Dockerised** — multi-stage Dockerfile with non-root user
- **CI/CD** — GitHub Actions pipeline (test on Node 18 & 20, Docker build verification)
- **Test Coverage** — Jest + Supertest integration tests

---

## Project Structure

```
src/
├── app.js                    # Express app — middleware, routes, error handlers
├── server.js                 # Entry point — port binding, graceful shutdown
├── config/index.js           # Centralised config from environment variables
├── middleware/
│   ├── auth.js               # JWT verify + RBAC authorize middleware
│   ├── errorHandler.js       # Global error handler + 404 handler
│   └── rateLimiter.js        # express-rate-limit configs
├── routes/
│   ├── index.js              # Route aggregator + /health endpoint
│   ├── auth.routes.js        # POST /login, POST /refresh, GET /me
│   ├── dashboard.routes.js   # GET /dashboard/:userId  (BFF endpoint)
│   └── user.routes.js        # GET /users, GET /users/:id
├── controllers/              # Request/response handling (thin layer)
├── services/
│   ├── aggregator.service.js # BFF parallel aggregation logic
│   ├── downstream.service.js # Downstream microservice calls (mock → real)
│   └── auth.service.js       # JWT generation + bcrypt verification
└── utils/
    ├── response.js           # Standardised response helpers
    └── logger.js             # Structured logger (JSON prod / readable dev)

tests/
├── auth.test.js
├── dashboard.test.js
└── user.test.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Local Setup

```bash
git clone https://github.com/sadiks/nodejsApis.git
cd nodejsApis

npm install

cp .env.example .env
# Edit .env and set JWT_SECRET to a strong random value

npm run dev       # starts with nodemon on port 3000
```

### Docker

```bash
docker-compose up --build
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login with email + password |
| POST | `/api/auth/refresh` | — | Refresh access token |
| GET | `/api/auth/me` | Bearer | Current user info |

### Dashboard (BFF)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/:userId` | Bearer | Aggregated user + orders + notifications |

### Users

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/users` | Bearer | admin |
| GET | `/api/users/:id` | Bearer | any |

### Health

```
GET /api/health
→ { "status": "ok", "uptime": 42.3, "timestamp": "..." }
```

---

## Example BFF Response

```
GET /api/dashboard/u1
Authorization: Bearer <token>
```

```json
{
  "success": true,
  "message": "Dashboard data aggregated successfully",
  "data": {
    "user": { "id": "u1", "name": "Alice Johnson", "role": "admin" },
    "orders": {
      "total": 2,
      "pending": 1,
      "items": [...]
    },
    "notifications": {
      "total": 2,
      "unread": 1,
      "items": [...]
    },
    "meta": {
      "aggregatedAt": "2025-01-15T10:30:00.000Z",
      "elapsed_ms": 65
    }
  },
  "timestamp": "2025-01-15T10:30:00.050Z"
}
```

---

## Running Tests

```bash
npm test                  # run all tests with coverage
npm run test:watch        # watch mode
```

Coverage threshold: **70%** branches / functions / lines (enforced in CI).

---

## Test Credentials

For local development only:

| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password123 | admin |
| bob@example.com | password123 | user |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Auth | jsonwebtoken + bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Testing | Jest + Supertest |
| Containerisation | Docker (multi-stage), docker-compose |
| CI | GitHub Actions |
| Logging | Custom structured logger |

---

## Author

**Mohamed Sadikul Ameen** — UI Architect / Frontend Lead  
[LinkedIn](https://www.linkedin.com/in/mohamed-sadikul-ameen-68949521/) · [Portfolio](https://portfolio-sadikameen.vercel.app)

---

## License

MIT
