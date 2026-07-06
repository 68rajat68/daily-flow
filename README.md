# Daily Flow

A simple, clean daily task planner that helps you plan your day, track progress, and view monthly stats.

## Features

- **Daily Task Planning** — Add tasks grouped by Morning, Afternoon, Evening
- **Built-in Timer** — Set a duration per task, start/pause/reset, auto-completes when time is up
- **Categories** — Work, Personal, Health, Other
- **Priority Levels** — Low, Medium, High with color-coded borders
- **Progress Tracking** — Daily progress ring and completion count
- **Calendar View** — Monthly calendar with color-coded dots (green/yellow/red)
- **Monthly Stats** — Completion %, weekly trends, category breakdown, streak counter
- **Firebase Auth** — Email/password login, data stored per user
- **PWA Ready** — Add to home screen on mobile for app-like experience
- **Lucide Icons** — Clean, consistent icon system throughout

## Tech Stack

| Tool            | Purpose             |
| --------------- | ------------------- |
| React 18        | UI framework        |
| Vite            | Build tool          |
| Firebase Auth   | User authentication |
| Cloud Firestore | Data storage        |
| Zustand         | State management    |
| date-fns        | Date utilities      |
| Lucide React    | Icons               |

## Setup

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication > Email/Password**
4. Create **Firestore Database** in test mode
5. Add a **Web App** and copy the `firebaseConfig` JSON

### 2. Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Use as Mobile App

On your phone, open the URL in Chrome:

- **Android**: Menu > "Add to Home Screen"
- **iOS**: Share > "Add to Home Screen"

## Project Structure

```
daily-flow/
├── public/
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   ├── MiniCalendar.jsx
│   │   ├── ProgressRing.jsx
│   │   └── TaskCard.jsx
│   ├── screens/
│   │   ├── AddTaskScreen.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── MonthViewScreen.jsx
│   │   ├── SettingsScreen.jsx
│   │   └── StatsScreen.jsx
│   ├── store/
│   │   └── useTaskStore.js
│   ├── utils/
│   │   └── dateHelpers.js
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## License

MIT
