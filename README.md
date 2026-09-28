# Temora — Modern Education & Focus Platform

A production-quality education-focused web application designed to help students study, stay focused, track progress, and manage their study time with scientific habit-building principles.

---

# Tech Stack

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

# Key Features

1. **Tab-Proof Focus Timer**:
   - Calculates time remaining using timestamp deltas rather than drift-prone simple intervals.
   - Presets: Pomodoro (25m), Deep Work (50m), Extended (90m), Custom duration (1-180m), and Break timers (5m, 15m).
   - Subject tagging, live session notes, and soothing Web Audio API chime on completion.
   - Prevents double submissions or duplicate records.

2. **Unified Dashboard**:
   - Time-based greeting ("Good morning / afternoon / evening,") + rotating motivational quote.
   - Real-time statistics: Today's study time, past 7 days accumulated time, total completed sessions, active streak, and daily goal progress.
   - Prominent focus timer widget, live daily goal progress bar, and recent study session logs.

3. **Study Sessions History**:
   - Search across subjects and session notes.
   - Filter by date range (from/to) and subject.
   - Delete session records with a safety confirmation dialog.
   - Paginated display with responsive desktop table and mobile card stack.

4. **Analytics**:
   - Recharts visualisations:
     - 7-day daily study time bar chart
     - 30-day focus trend area chart
     - Subject distribution donut/pie chart
     - Week-over-week study comparison
   - High-level KPI cards: Total study hours, daily average, longest session, top subject, and streak records.

5. **Dynamic Streak System**:
   - Evaluates consecutive calendar study days dynamically from real session timestamps.
   - Does not use hardcoded or fake streak counters.

6. **Daily & Weekly Goals**:
   - Custom daily and weekly focus target configuration.
   - Visual progress indicators updating automatically upon session completion.

7. **Student Profile & Settings**:
   - Avatar theme picker, display name updates, and password change.
   - Dark/Light mode toggle, default focus/break duration preferences, audio chime settings.
