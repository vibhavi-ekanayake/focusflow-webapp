# FocusFlow — Modern Education & Focus Platform

A production-quality education-focused web application designed to help students study, stay focused, track progress, and manage their study time with scientific habit-building principles.

---

## 🛠 Tech Stack

- **Frontend**: React.js 18 (Vite, pure JavaScript — No TypeScript)
- **Styling**: Tailwind CSS (with persistent Dark Mode support)
- **Icons**: Lucide React
- **Charts & Visualizations**: Recharts
- **API Communication**: Axios (with JWT interceptors)
- **Routing**: React Router DOM v6
- **Backend**: Node.js & Express.js (ES Modules)
- **Database**: MongoDB & Mongoose (with embedded `mongodb-memory-server` auto-fallback for zero-friction local execution)
- **Authentication**: JWT & bcryptjs password hashing

---

## 🚀 Key Features

1. **Tab-Proof Focus Timer**:
   - Calculates time remaining using timestamp deltas (`Date.now()`) rather than drift-prone simple intervals.
   - Presets: Pomodoro (25m), Deep Work (50m), Extended (90m), Custom duration (1-180m), and Break timers (5m, 15m).
   - Subject tagging, live session notes, and soothing Web Audio API chime on completion.
   - Prevents double submissions or duplicate records.

2. **Unified Dashboard**:
   - Time-based greeting ("Good morning / afternoon / evening, [User Name]") + rotating motivational quote.
   - Real-time statistics: Today's study time, past 7 days accumulated time, total completed sessions, active streak, and daily goal progress.
   - Prominent focus timer widget, live daily goal progress bar, and recent study session logs.

3. **Study Sessions History (`/sessions`)**:
   - Search across subjects and session notes.
   - Filter by date range (from/to) and subject.
   - Delete session records with a safety confirmation dialog.
   - Paginated display with responsive desktop table and mobile card stack.

4. **Analytics (`/analytics`)**:
   - Recharts visualisations:
     - 7-day daily study time bar chart
     - 30-day focus trend area chart
     - Subject distribution donut/pie chart
     - Week-over-week study comparison
   - High-level KPI cards: Total study hours, daily average, longest session, top subject, and streak records.

5. **Dynamic Streak System**:
   - Evaluates consecutive calendar study days dynamically from real session timestamps.
   - Does not use hardcoded or fake streak counters.

6. **Daily & Weekly Goals (`/goals`)**:
   - Custom daily and weekly focus target configuration.
   - Visual progress indicators updating automatically upon session completion.

7. **Student Profile & Settings (`/profile`, `/settings`)**:
   - Avatar theme picker, display name updates, and password change.
   - Dark/Light mode toggle, default focus/break duration preferences, audio chime settings.

---

## 💻 Getting Started

### 1. Environment Configuration

Copy the sample environment file in `server/`:
```bash
# In server directory:
cp .env.example .env
```
Default `.env` settings:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/focusflow
JWT_SECRET=super_secret_focusflow_jwt_token_key_2026_xyz987
JWT_EXPIRE=30d
```
> *Note: If a local MongoDB instance is not currently active, the server will seamlessly boot an embedded in-memory MongoDB runner so you can test all features immediately.*

### 2. Seed Demo Data (Optional)

To seed realistic study history, subjects, and a demo student account:
```bash
npm --prefix server run seed
```
Demo Credentials:
- **Email**: `demo@focusflow.edu`
- **Password**: `password123`

### 3. Start the Backend API Server
```bash
npm --prefix server run dev
# Server will listen on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 4. Start the Frontend Client
```bash
npm --prefix client run dev
# Vite client will run on http://localhost:5173
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` — Create a new student account
- `POST /api/auth/login` — Sign in and obtain JWT
- `POST /api/auth/logout` — End user session
- `GET /api/auth/me` — Retrieve current authenticated user

### User & Profile
- `GET /api/users/profile` — Full profile with aggregate study statistics
- `PUT /api/users/profile` — Update name, avatar, or password
- `PUT /api/users/settings` — Update theme and timer preferences

### Study Sessions
- `POST /api/sessions` — Record a completed study session
- `GET /api/sessions` — Search, filter, and paginate previous sessions
- `GET /api/sessions/:id` — Retrieve a single session
- `DELETE /api/sessions/:id` — Remove a session

### Analytics & Goals
- `GET /api/analytics/overview` — Dashboard summary stats & streak
- `GET /api/analytics/weekly` — 7-day breakdown & week-over-week comparison
- `GET /api/analytics/monthly` — 30-day study trend
- `GET /api/analytics/subjects` — Distribution by subject
- `GET /api/goals` — Live daily and weekly goal progress
- `PUT /api/goals` — Update daily and weekly targets
