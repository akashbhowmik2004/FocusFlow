# FocusFlow Directory Structure

```text
FocusFlow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma database schema
│   │   └── migrations/             # Database migrations
│   ├── src/
│   │   ├── controllers/            # Express controllers (auth, session, subject, topic, user)
│   │   ├── middleware/             # Auth, error, rate-limit middleware
│   │   ├── routes/                 # Express API routes
│   │   ├── schemas/                # Backend Zod validation schemas
│   │   ├── services/               # Database interaction services
│   │   ├── utils/                  # Utility helpers
│   │   └── app.js                  # Express app setup and middleware configuration
│   └── server.js                   # HTTP server entry point
├── frontend/
│   ├── public/                     # Static public assets (SVGs, logos)
│   ├── src/
│   │   ├── assets/                 # Component assets
│   │   ├── components/             # Reusable UI and domain components
│   │   │   ├── analytics/          # Analytics cards and charts
│   │   │   ├── auth/               # Route guards (ProtectedRoute, PublicRoute)
│   │   │   ├── dashboard/          # Dashboard bento components
│   │   │   ├── planner/            # Calendar view components (Day, Week, Month)
│   │   │   ├── revision/           # Active recall and revision deck components
│   │   │   ├── sessions/           # Focus session list and cards
│   │   │   ├── subjects/           # Subject cards, headers, diagnostic meters
│   │   │   ├── topics/             # Topic rows, drawers, review modals
│   │   │   └── ui/                 # Primitives (Button, Card, Dialog, Input, Toaster, etc.)
│   │   ├── context/                # AppContext and AuthContext
│   │   ├── data/                   # Mock data fallbacks for tests/offline
│   │   ├── layouts/                # AppLayout shell
│   │   ├── lib/                    # Business logic, analytics, utilities
│   │   ├── pages/                  # Page routes (Landing, Auth, App views)
│   │   ├── schemas/                # Client-side Zod validation schemas
│   │   ├── services/               # REST API client services
│   │   ├── App.jsx                 # Route definitions and code splitting
│   │   ├── index.css               # Global tokens, Tailwind imports, themes
│   │   └── main.jsx                # React DOM root entry
│   ├── package.json
│   └── vite.config.js
├── .planning/                      # GSD planning and progress state
├── AGENTS.md                       # Architecture and project rules
└── design.md                       # Design system source of truth
```
