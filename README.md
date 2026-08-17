# Daily Gratitude Journal (Django + React JWT Auth Architecture)

A full-stack application demonstrating the **Common Baseline: Django + React JWT Auth Architecture** with **App #3: Daily Gratitude Journal**.

---

## 🌟 Overview & Architecture

### 1. Django REST Framework Backend
- **Framework**: Django 5.x + Django REST Framework + `djangorestframework-simplejwt` + `django-cors-headers`.
- **JWT Authentication & Rotation**:
  - `/api/auth/login/` (or `/api/auth/token/`) returns an **Access Token** (expires in 1 hour) and a **Refresh Token** (expires in 1 day).
  - `/api/auth/token/refresh/` seamlessly issues new access tokens without requiring user re-login.
  - `/api/auth/register/` handles public user sign-ups.
  - `/api/auth/me/` returns the authenticated user profile.
- **Global Security & Data Scoping**:
  - `IsAuthenticated` is set as the global default permission in DRF settings.
  - The `Entry` model contains an `owner = models.ForeignKey(User, on_delete=models.CASCADE)` field with a unique constraint `unique_together = ('owner', 'date')`.
  - ViewSets strictly override `get_queryset()` to return `Entry.objects.filter(owner=self.request.user)`.
  - In `perform_create()`, `serializer.save(owner=self.request.user)` ensures users can never inject or read other users' journal entries.

### 2. React (Vite) Frontend
- **Framework & Libraries**: React 18, Vite, React Router 6, Axios, Lucide React, Canvas Confetti.
- **State Management**:
  - `AuthContext` provides global authentication state (`user`, `tokens`, `login`, `register`, `logout`).
- **Axios Interceptors**:
  - **Request Interceptor**: Automatically attaches `Authorization: Bearer <access_token>` to outgoing requests.
  - **Response Interceptor**: Catches `401 Unauthorized` responses and uses a mutex/queue to refresh the access token via `/api/auth/token/refresh/`, seamlessly retrying failed requests.
- **Protected Routes**:
  - `<ProtectedRoute>` guards all private views, redirecting unauthenticated visitors to `/login`.
- **Journal Features**:
  - **Interactive Calendar View**: Month navigator, highlighted days with logged gratitude, and click-to-edit date selector.
  - **Daily Gratitude Editor**: Distraction-free one-paragraph editor, randomized inspiration prompts, mood picker, autosave, and celebratory confetti effects.
  - **Reflections Timeline**: Searchable and filterable archive with mood tags and quick edit/delete actions.
  - **Stats & Streaks**: Consecutive streak tracker, all-time best streak, and reflection totals.

---

## 📂 Project Structure

```
project/
├── backend/
│   ├── journal_backend/       # Django configuration & settings
│   │   ├── settings.py        # DRF, SimpleJWT, CORS, and DB config
│   │   ├── urls.py            # API routing root
│   │   └── wsgi.py / asgi.py
│   ├── authentication/        # JWT Authentication app
│   │   ├── serializers.py     # Registration, User, and Token serializers
│   │   ├── views.py           # RegisterView, LoginView, MeView
│   │   ├── urls.py            # Auth endpoint routes
│   │   └── tests.py           # Authentication test suite
│   ├── journal/               # Gratitude Journal app
│   │   ├── models.py          # Entry model with owner FK & unique date
│   │   ├── serializers.py     # EntrySerializer
│   │   ├── views.py           # EntryViewSet with scoped queryset & stats
│   │   ├── urls.py            # Entry routes
│   │   └── tests.py           # Isolation and CRUD test suite
│   ├── seed_data.py           # Demo user and streak generator
│   ├── test_integration.py    # Live API and isolation test script
│   └── requirements.txt       # Python package dependencies
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       # Axios instance with JWT interceptors
│   │   ├── context/
│   │   │   └── AuthContext.jsx# Global user state & auth methods
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx # Route guard component
│   │   │   ├── Navbar.jsx         # Header with theme toggle & logout
│   │   │   ├── CalendarView.jsx   # Interactive monthly calendar
│   │   │   ├── JournalEditor.jsx  # One-paragraph gratitude editor
│   │   │   ├── EntriesList.jsx    # Searchable reflections timeline
│   │   │   └── StatsOverview.jsx  # Streak counters & stats cards
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      # Sign in page
│   │   │   ├── RegisterPage.jsx   # Sign up page
│   │   │   └── DashboardPage.jsx  # Main application dashboard
│   │   ├── styles/
│   │   │   └── index.css          # Mindful design system (light/dark mode)
│   │   ├── App.jsx            # React Router setup
│   │   └── main.jsx           # App entry point
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── README.md
```

---

## 🚀 Step-by-Step Setup Guide

### 1. Backend Setup

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     py -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

5. (Optional) Seed demo users and initial gratitude streak:
   ```bash
   python seed_data.py
   ```
   *Creates demo user:* `mindful_user` / `MindfulPass123!` (with a 4-day streak) and `second_user` / `SecondPass123!`.

6. Run the Django development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```

---

### 2. Frontend Setup

1. Open a new terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```
   http://localhost:5173
   ```

---

## 🧪 Testing & Verification

### Run Django Unit Tests:
```powershell
cd backend
.\venv\Scripts\python.exe manage.py test
```
*Validates registration, login, token refresh, protected routes, user-scoped querysets, and streak calculations.*

### Run Live End-to-End API & Isolation Tests:
```powershell
cd backend
.\venv\Scripts\python.exe test_integration.py
```
*Tests live API endpoints, token refresh rotation, and multi-tenant data privacy.*

### Verify Frontend Production Build:
```powershell
cd frontend
npm.cmd run build
```

---

## 🔑 Default Demo Accounts

| Username | Password | Notes |
| :--- | :--- | :--- |
| `mindful_user` | `MindfulPass123!` | Has 5 gratitude entries and an active 4-day streak |
| `second_user` | `SecondPass123!` | Independent user for testing data isolation |
| Or click **"Create one for free"** to register any new account |
