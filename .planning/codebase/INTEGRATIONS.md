# FocusFlow External & API Integrations

## Backend REST Endpoints
FocusFlow frontend communicates with the backend Express server via standard JSON REST endpoints configured with JWT Bearer authentication:

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Create user with email and password
- `POST /api/auth/login`: Authenticate existing user
- `POST /api/auth/google`: Google OAuth credential sign-in
- `GET /api/auth/me`: Validate active JWT session and return current user
- `POST /api/auth/logout`: Revoke/clear session token

### User & Preferences (`/api/user`)
- `GET /api/user/profile`: Fetch user details, academic level, exam dates
- `PUT /api/user/profile`: Update user profile details
- `PUT /api/user/settings`: Update settings (daily study targets, notifications)
- `DELETE /api/user/account`: Guarded account deletion

### Subjects (`/api/subject`)
- `GET /api/subject`: List user subjects with topic counts and metrics
- `POST /api/subject`: Create new subject
- `PUT /api/subject/:id`: Update subject metadata (title, color, exam date)
- `DELETE /api/subject/:id`: Delete subject and cascade delete topics

### Topics (`/api/topic`)
- `GET /api/topic/subject/:subjectId`: Fetch topics for a subject
- `POST /api/topic`: Create topic
- `PUT /api/topic/:id`: Update topic status, revision dates, or details
- `DELETE /api/topic/:id`: Delete topic

### Focus Sessions (`/api/session`)
- `GET /api/session`: Fetch focus sessions (filterable by date range)
- `POST /api/session`: Schedule a focus session
- `PUT /api/session/:id`: Update session details
- `POST /api/session/:id/start`: Transition session to in-progress (server timestamp synchronization)
- `POST /api/session/:id/pause`: Pause active timer
- `POST /api/session/:id/complete`: Complete focus session and record study time

## LocalStorage Integration
- `focusflow_token`: User JWT authentication token
- `focusflow_user`: Cached user profile JSON
- `focusflow_theme`: Theme preference ("light" | "dark" | "system")
