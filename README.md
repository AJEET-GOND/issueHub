
<div align="center">

# 🚨 IssueHub

### *Report. Track. Resolve.*

<p>
  <strong>A minimal, modern campus issue reporting platform built for students and administrators.</strong>
</p>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&duration=2800&pause=900&color=8B5CF6&center=true&vCenter=true&width=650&lines=Report+campus+issues+in+seconds;Track+every+report+from+start+to+resolution;Connect+students+with+campus+administration;Make+your+campus+better%2C+one+issue+at+a+time" alt="IssueHub animated tagline" />

<br/>

<p>
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-8B5CF6?style=flat-square" alt="Frontend"/>
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-111113?style=flat-square" alt="Backend"/>
  <img src="https://img.shields.io/badge/Database-MongoDB-22C55E?style=flat-square" alt="Database"/>
  <img src="https://img.shields.io/badge/Auth-HTTP--Only%20JWT-E5E7EB?style=flat-square" alt="Authentication"/>
</p>

</div>

---

IssueHub makes it easy for students to **report campus problems, track progress, discover related issues, and raise community urgency**, while giving administrators a secure dashboard to manage, prioritize, and resolve those problems.

Built with a modern **React + Node.js + MongoDB** stack, IssueHub is designed to be clean, responsive, secure, and ready for real-world campus deployment.

---

## ✨ Why IssueHub?

Campus problems are often reported through scattered WhatsApp messages, verbal complaints, or paper forms. This makes issues difficult to track and prioritize.

**IssueHub brings everything into one place.**

### 🎓 For Students
- Submit campus complaints with optional photos
- Track submitted reports and their current status
- Browse problems reported across campus
- Search, filter, and sort campus issues
- Mark important reports as **Urgent**
- See related or potentially duplicate reports
- View personal profile and report history

### 🛡️ For Administrators
- Secure administrator authentication
- Real-time dashboard statistics from MongoDB
- Review and filter all campus reports
- Change report status
- Delete reports after confirmation
- Review uncertain duplicate/related issue groups
- View recurring issues and long-pending problems
- Monitor community urgency signals

---

## 🎨 UI & Design

IssueHub follows a **minimal dark UI**: quiet surfaces, strong typography, one accent color, and motion that helps users understand what is happening.

### ✨ Motion language

Animations should feel **fast, subtle, and purposeful**:

```text
Page transition       → 180–250ms ease-out
Card hover            → 150–200ms
Button interaction    → 120–160ms
Status changes        → 250–350ms
Dashboard counters    → 600–900ms
Loading states        → soft pulse / skeleton
```

### Minimal visual system

| Element | Direction |
|---|---|
| Background | Deep charcoal |
| Cards | Slightly elevated charcoal |
| Accent | Restrained purple |
| Typography | Clean, bold, readable |
| Borders | Thin and low-contrast |
| Shadows | Soft, minimal |
| Animation | Subtle, never distracting |

```text
Background       #111113
Surface          #19191D
Elevated Surface #222228
Purple Accent    #8B5CF6
Text             #F5F5F5
Muted Text       #A1A1AA
Border           #2D2D34
Success          #22C55E
Warning          #F59E0B
Danger           #EF4444
```

### 🎞️ Recommended UI animations

```text
Dashboard
   ↓
Cards gently fade + slide upward
   ↓
Numbers count into their real values
   ↓
Charts/insights appear progressively

Issue card
   ↓
Hover → tiny lift + soft shadow
   ↓
Click → quick scale feedback

Report status
   ↓
Status badge smoothly changes
   ↓
Small success confirmation appears
```

> **Design rule:** animation should communicate state or hierarchy—not decorate every element.

## 🚀 Core Features

### 🔐 Authentication

- Student signup and login
- Separate admin authentication flow
- Password hashing with `bcryptjs`
- JWT-based authentication
- HTTP-only authentication cookies
- Session restoration through `GET /api/auth/me`
- No authentication tokens stored in `localStorage`
- Server-side role enforcement
- Signup always creates a student account unless the protected admin signup flow is used

### 📝 Issue Reporting

Students can submit reports containing:

- Title
- Description
- Category
- Location
- Optional image
- Issue information required by the backend

Issue photos support:

- JPEG
- PNG
- WebP
- Maximum size: 5 MB
- Image signature validation
- ImageKit storage

### 🔎 Smart Duplicate Detection

IssueHub compares new reports with active reports using normalized:

- Category
- Location
- Title
- Description

Matching behavior:

```text
Score ≥ 80
    ↓
Automatically grouped as a related issue

Score 65–79
    ↓
Proposed group → Admin review

Score < 65
    ↓
No duplicate group
```

Students can inspect similar reports and **submit anyway** when the issue is genuinely separate.

> Duplicate detection never deletes or merges the original reports.

### 🚨 Community Urgency

Students can mark a report as urgent.

- One urgency vote per student per report
- Students can remove their own vote
- Votes are stored separately from reports
- Unique `(report, user)` database index prevents duplicate votes
- Official report priority remains independent from community urgency

### 📊 Admin Insights

The admin dashboard derives its information from real MongoDB data.

It can surface:

- Total reports
- Pending reports
- Resolved reports
- Recent reports
- Recurring issue groups
- Community urgency
- Long-pending problems
- Concern flags

No fake or seeded dashboard statistics are used.

---

# 🪄 Experience at a Glance

```text
╭────────────────────────────────────────────────────────────╮
│  IssueHub                                      🔔   👤     │
│                                                            │
│  Good morning 👋                                           │
│  What needs attention on campus?                           │
│                                                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │  12        │ │  04        │ │  08        │              │
│  │  Reports   │ │  Pending   │ │  Resolved  │              │
│  └────────────┘ └────────────┘ └────────────┘              │
│                                                            │
│  Recent Campus Issues                                     │
│  ────────────────────────────────────────────────────────  │
│  🔴 Water leakage          Maintenance     ● In Progress  │
│  🟣 Broken classroom fan   Electrical      ● Reported     │
│  🟢 Street light issue     Infrastructure  ● Resolved     │
│                                                            │
│                  + Report an Issue                          │
╰────────────────────────────────────────────────────────────╯
```

The interface intentionally avoids visual clutter: **one strong action, clear status, useful information, and restrained motion.**

---

# 🏗️ Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                      IssueHub                            │
├───────────────────────────┬──────────────────────────────┤
│       React Frontend      │       Express Backend        │
│                           │                              │
│  ┌─────────────────────┐  │  ┌────────────────────────┐  │
│  │ Public Pages        │  │  │ Auth API               │  │
│  │ Login / Signup      │  │  │ Report API             │  │
│  └─────────────────────┘  │  │ Admin API              │  │
│                           │  │ User API                │  │
│  ┌─────────────────────┐  │  │ Health API              │  │
│  │ Student Dashboard   │  │  └────────────┬───────────┘  │
│  │ Reports             │  │               │              │
│  │ Campus Problems     │  │       ┌───────▼────────┐     │
│  │ Profile             │  │       │ Auth Middleware│     │
│  └─────────────────────┘  │       └───────┬────────┘     │
│                           │               │              │
│  ┌─────────────────────┐  │       ┌───────▼────────┐     │
│  │ Admin Dashboard     │  │       │ Controllers    │     │
│  │ Reports             │  │       │ Services       │     │
│  │ Insights            │  │       └───────┬────────┘     │
│  └─────────────────────┘  │               │              │
└───────────────────────────┴───────────────┼──────────────┘
                                            │
                                  ┌─────────▼─────────┐
                                  │     MongoDB       │
                                  │                   │
                                  │ Users             │
                                  │ Reports           │
                                  │ Urgency Votes     │
                                  │ Duplicate Groups  │
                                  └───────────────────┘
                                            │
                                  ┌─────────▼─────────┐
                                  │     ImageKit      │
                                  │  Optional Photos  │
                                  └───────────────────┘
```

---

# 🛠️ Tech Stack

### Frontend

- **React**
- **Vite**
- **React Router**
- **Tailwind CSS**
- **Axios**

### Backend

- **Node.js**
- **Express**
- **MongoDB**
- **Mongoose**
- **bcryptjs**
- **JWT**
- **HTTP-only cookies**

### Services

- **MongoDB Atlas / MongoDB**
- **ImageKit** for optional report images
- **Render** for backend deployment
- **Vercel** for frontend deployment

---

# 📁 Project Structure

```text
IssueHub/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # Authentication state
│   │   ├── hooks/            # Reusable React hooks
│   │   ├── layouts/          # Student/Admin layouts
│   │   ├── pages/
│   │   │   ├── public/       # Login, signup, etc.
│   │   │   ├── student/
│   │   │   │   └── CampusProblems.jsx
│   │   │   └── admin/
│   │   ├── routes/           # Frontend route guards
│   │   ├── services/         # Axios, auth & report APIs
│   │   └── utils/            # Utility functions
│   │
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── config/           # Database/configuration
│   │   ├── controllers/      # Request controllers
│   │   ├── middleware/       # Auth & role middleware
│   │   ├── models/           # Mongoose models
│   │   │   └── UrgencyVote.js
│   │   ├── routes/           # API routes
│   │   ├── services/         # ImageKit services
│   │   └── utils/            # Backend utilities
│   │
│   └── ...
│
├── package.json
├── render.yaml
├── README.md
└── ...
```

---

# ⚙️ Requirements

Before starting, install:

- **Node.js 20.19+**
- **npm**
- **MongoDB** or MongoDB Atlas

Optional:

- ImageKit account for report photos
- Render account for backend deployment
- Vercel account for frontend deployment

---

# 🚀 Local Setup

## 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd IssueHub
```

## 2. Install dependencies

```bash
npm install

cd frontend
npm install

cd ../backend
npm install

cd ..
```

## 3. Configure environment variables

Copy:

```text
frontend/.env.example → frontend/.env
backend/.env.example  → backend/.env
```

### Backend environment

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_at_least_32_characters
CLIENT_URL=http://localhost:5173

IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

ADMIN_SIGNUP_KEY=your_private_admin_signup_key
```

### Frontend environment

```env
VITE_API_URL=http://localhost:3000/api
```

> Never commit `.env` files or production secrets.

---

# ▶️ Run the Application

From the repository root:

```bash
npm run dev
```

Or run frontend and backend separately:

### Frontend

```bash
npm run frontend
```

### Backend

```bash
npm run backend
```

Default backend:

```text
http://localhost:3000
```

Default frontend:

```text
http://localhost:5173
```

---

# 🔑 Admin Setup

Student signup **never accepts an admin role from the browser**.

Admins have separate authentication routes:

```text
/admin/login
/admin/signup
```

## Option 1 — Protected Admin Signup

Set:

```env
ADMIN_SIGNUP_KEY=your_high_entropy_private_key
```

Then restart the backend.

The admin signup endpoint validates the key server-side before creating an administrator.

## Option 2 — Seed an Administrator

Set:

```env
ADMIN_NAME=Your Admin Name
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
```

Then run:

```bash
npm run seed-admin
```

The command creates or updates the administrator account in the configured database.

> Keep administrator credentials private.

---

# 🔐 Authentication Architecture

IssueHub follows a secure cookie-based authentication model.

```text
Login / Signup
      │
      ▼
Password → bcrypt verification
      │
      ▼
JWT generated
      │
      ▼
HTTP-only Cookie
      │
      ▼
Browser
      │
      ▼
Axios with credentials
      │
      ▼
Express authentication middleware
      │
      ▼
Protected API
```

### Security principles

- Passwords are hashed with `bcryptjs`
- JWT is stored in an HTTP-only cookie
- Tokens are not stored in `localStorage`
- Axios uses `withCredentials`
- Backend middleware checks authentication
- Backend middleware checks roles
- Report ownership is enforced server-side
- Frontend route guards are only navigation aids
- Production cookies use secure HTTPS configuration

For local development, use `localhost` consistently for frontend and backend URLs.

---

# 📡 API Reference

## Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Create student account |
| `POST` | `/api/auth/login` | Public | Login as student/admin |
| `POST` | `/api/auth/admin/login` | Public | Admin-only login |
| `POST` | `/api/auth/admin/signup` | Signup key | Create admin |
| `POST` | `/api/auth/logout` | Public | Clear auth cookie |
| `GET` | `/api/auth/me` | Authenticated | Restore session |

## Reports

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reports` | Student | Submit report |
| `GET` | `/api/reports/my` | Authenticated | Get current student's reports |
| `GET` | `/api/reports` | Authenticated | Campus-wide reports |
| `GET` | `/api/reports/:id` | Authenticated | Get report details |
| `POST` | `/api/reports/:id/urgency` | Student | Add urgency vote |
| `DELETE` | `/api/reports/:id/urgency` | Student | Remove urgency vote |

## Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | Dashboard statistics |
| `GET` | `/api/admin/insights` | Admin | Recurrence/backlog insights |
| `GET` | `/api/admin/reports` | Admin | Filter reports |
| `GET` | `/api/admin/reports/:id` | Admin | Report details |
| `PATCH` | `/api/admin/reports/:id/status` | Admin | Change report status |
| `DELETE` | `/api/admin/reports/:id` | Admin | Delete report |
| `PATCH` | `/api/admin/duplicate-groups/:id/confirm` | Admin | Confirm related group |
| `PATCH` | `/api/admin/duplicate-groups/:id/reject` | Admin | Reject related group |

## User

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | Authenticated | Get profile |
| `PUT` | `/api/users/profile` | Authenticated | Update profile |

## Health

```http
GET /api/health
```

Returns a basic API health response.

---

# 🔄 Student Flow

```text
┌───────────────┐
│ Student Signup│
└───────┬───────┘
        ▼
┌───────────────┐
│ Student Login │
└───────┬───────┘
        ▼
┌────────────────┐
│ Student        │
│ Dashboard      │
└───────┬────────┘
        │
        ├──────────────► Submit Issue
        │                    │
        │                    ▼
        │              Duplicate Check
        │                    │
        │             ┌──────┴──────┐
        │             ▼             ▼
        │        Similar Issue    No Match
        │             │             │
        │             └──────┬──────┘
        │                    ▼
        │               Submit Report
        │                    │
        │                    ▼
        │              Track Status
        │
        ├──────────────► Campus Problems
        │
        ├──────────────► Urgency Vote
        │
        └──────────────► Profile
```

---

# 🛡️ Admin Flow

```text
Admin Login
     │
     ▼
Admin Dashboard
     │
     ├──► View Statistics
     │
     ├──► View Recent Reports
     │
     ├──► Filter Reports
     │
     ├──► Review Related Issues
     │
     ├──► Review Urgency
     │
     ├──► Change Status
     │
     └──► Delete Report
```

---

# 📊 Issue Lifecycle

```text
┌──────────────┐
│   Reported   │
└──────┬───────┘
       ▼
┌──────────────┐
│ Under Review │
└──────┬───────┘
       ▼
┌──────────────┐
│ In Progress  │
└──────┬───────┘
       ▼
┌──────────────┐
│   Resolved   │
└──────────────┘
```

The exact status values should follow the backend's current report-status implementation.

---

# 🧠 Smart Insights

IssueHub generates insights from actual database records.

### Recurring issues

Reports are grouped using normalized:

```text
Title + Category + Location
```

### Community urgency

```text
COMMUNITY_URGENCY_THRESHOLD
```

Default:

```text
10 votes
```

### Long-pending reports

```text
LONG_PENDING_DAYS
```

Default:

```text
7 days
```

These values can be configured through backend environment variables.

---

# 🖼️ Image Uploads

Issue photos are optional.

Supported formats:

```text
JPEG
PNG
WebP
```

Maximum file size:

```text
5 MB
```

The backend:

1. Validates the uploaded file.
2. Checks the image signature.
3. Uploads the image to ImageKit.
4. Stores the returned URL.
5. Stores the ImageKit file ID.
6. Keeps the ImageKit private key exclusively on the server.

If ImageKit is not configured, photo upload requests receive a clear service-unavailable response rather than silently failing.

---

# 🌐 Production Deployment

IssueHub supports:

- **Render** for the Express API
- **Vercel** for the React frontend
- **MongoDB Atlas** for the database
- **ImageKit** for image storage

The repository includes:

```text
render.yaml
frontend/vercel.json
```

## Backend — Render

Create a Render Blueprint from the repository.

Configure:

```env
MONGO_URI
CLIENT_URL
IMAGEKIT_PRIVATE_KEY
ADMIN_SIGNUP_KEY
```

Render generates:

```env
JWT_SECRET
```

The backend uses:

```env
AUTH_COOKIE_SAME_SITE=none
```

for cross-site cookie authentication when the frontend and API are hosted on different domains.

## Frontend — Vercel

Set the project root to:

```text
frontend
```

Configure:

```env
VITE_API_URL=https://your-api-domain/api
```

Then set the backend:

```env
CLIENT_URL=https://your-frontend-domain
```

Redeploy the backend after changing the production client URL.

> Production authentication requires HTTPS and secure cookies.

---

# 🧪 Validation

Run the production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

The API cannot complete database-backed operations until MongoDB is configured and available.

---

# 🧩 Important Engineering Decisions

### No fake dashboard numbers

All dashboard statistics come from MongoDB.

A fresh database correctly shows:

```text
0 reports
0 pending
0 resolved
```

instead of invented demo metrics.

### No localStorage authentication

Authentication state is restored through:

```http
GET /api/auth/me
```

The frontend keeps the current user in React memory.

### Defense in depth

Frontend route guards improve navigation, but **security decisions are always enforced on the backend**.

### Signup role protection

Student signup cannot create an administrator by sending:

```json
{
  "role": "admin"
}
```

The backend controls the assigned role.

---

## ♿ Motion Accessibility

Animations should respect the user's system preference:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This keeps the experience polished without making motion a requirement for usability.

---

# 🔒 Security Checklist

Before production:

- [ ] Use a strong MongoDB password
- [ ] Use a JWT secret of at least 32 random characters
- [ ] Use a high-entropy admin signup key
- [ ] Never commit `.env`
- [ ] Never expose `IMAGEKIT_PRIVATE_KEY`
- [ ] Use HTTPS
- [ ] Configure the exact production `CLIENT_URL`
- [ ] Use secure production cookies
- [ ] Keep admin credentials private
- [ ] Restrict database network access appropriately
- [ ] Review server logs before public launch

---

# 🗺️ Future Roadmap

Potential improvements:

- [ ] Push/email notifications
- [ ] Department-wise issue assignment
- [ ] Issue comments and admin-student communication
- [ ] Campus map visualization
- [ ] SLA-based escalation
- [ ] Advanced analytics
- [ ] Mobile application
- [ ] AI-assisted issue categorization
- [ ] Multilingual campus support
- [ ] Anonymous reporting option with appropriate safeguards
- [ ] Department performance dashboards
- [ ] Resolution-time analytics

---

# 🤝 Contributing

Contributions are welcome.

A typical workflow:

```bash
git checkout -b feature/your-feature
```

Make your changes, then:

```bash
npm run lint
npm run build
```

Commit:

```bash
git commit -m "feat: add your feature"
```

Push:

```bash
git push origin feature/your-feature
```

Then open a pull request.

---

# 📄 License

Add your preferred project license here.

For example:

```text
MIT License
```

---

# 👨‍💻 Project

**IssueHub — Smart Campus Issue Reporting Platform**

Built to make campus problem reporting:

> **Simple. Transparent. Trackable. Actionable.**

---

#<div align="center">

### 🚨 IssueHub

**Report. Track. Resolve.**

*Make your campus better, one issue at a time.*

⭐ Star the repository if you find it useful.

</div>
