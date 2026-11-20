# FocusFlow Tech Stack

## Frontend Runtime & Build
- **Language / Runtime:** JavaScript (ES2022+), Browser DOM (React 19.3.1, React DOM 19.3.1)
- **Bundler & Dev Server:** Vite 8.3.4 with `@vitejs/plugin-react` 6.1.2
- **Routing:** React Router DOM 7.18.4 (declarative client-side routing with lazy route splitting)
- **Styling Architecture:** Tailwind CSS v4 (`@tailwindcss/vite` 4.3.3, `@import "tailwindcss"`), `clsx` 2.1.1, `tailwind-merge` 3.7.0, `class-variance-authority` 0.7.1
- **Design Token System:** CSS Custom Properties (`:root` and `.dark` in `frontend/src/index.css`)
- **Iconography:** Lucide React (`lucide-react` 1.61.0)
- **Animation & Motion:** Motion 14.6.0 (`motion/react`)
- **Forms & Client Schema Validation:** React Hook Form 7.91.0, `@hookform/resolvers` 6.0.0, Zod 4.6.7
- **Toasts & Notifications:** Sonner 2.0.8 (`<Toaster />`)
- **Data Visualization & Charts:** Recharts 3.10.1
- **Date Utilities:** Date-fns 4.4.0

## Frontend Testing Framework
- **Test Runner:** Vitest 5.0.5
- **Environment:** JSDOM 29.1.1
- **Testing Libraries:** `@testing-library/react` 16.3.3, `@testing-library/jest-dom` 7.0.1, `@testing-library/user-event` 14.6.8
- **E2E / Browser Automation:** Playwright 1.64.1

## Backend Runtime & Database
- **Runtime:** Node.js (v20+), CommonJS / ES Modules hybrid
- **Web Framework:** Express 4.x
- **ORM / Database Access:** Prisma 7 with PostgreSQL / SQLite fallback
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **API Security:** CORS, Express Rate Limit, helmet
- **Validation:** Zod schemas in `backend/src/schemas/`
