# ⚡ TaskFlow — Team Task Manager

A full-stack team task management application built with **React**, **Node.js**, **Express**, and **MongoDB**.

![TaskFlow](https://img.shields.io/badge/TaskFlow-v1.0-6366f1?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=for-the-badge&logo=mongodb)

---

## ✨ Features

- **JWT Authentication** — Secure signup/login with bcrypt password hashing
- **Role-Based Access** — Admin and Member roles with middleware protection
- **Project Management** — Create projects, assign members, color-code them
- **Kanban Task Board** — Visual 3-column board (To Do / In Progress / Done)
- **Task Assignment** — Assign tasks to team members with priority and due dates
- **Dashboard Analytics** — Task counts, priority breakdown, completion rate, overdue alerts
- **Responsive Design** — Beautiful dark theme UI that works on all devices
- **Railway Ready** — Configured for one-click Railway deployment

---

## 🏗️ Tech Stack

| Layer       | Technology                    |
| ----------- | ----------------------------- |
| Frontend    | React 18 + Vite               |
| Backend     | Node.js + Express             |
| Database    | MongoDB + Mongoose            |
| Auth        | JWT + bcryptjs                |
| Styling     | Custom CSS (Dark Theme)       |
| Deployment  | Railway                       |

---

## 📁 Folder Structure

```
Task Mngr prjct/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Route handlers
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/auth.js       # JWT auth & role middleware
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/                  # Express routes
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── server.js               # Express entry point
│   └── .env                    # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── context/            # Auth context provider
│   │   ├── pages/              # Page components
│   │   ├── services/api.js     # Axios API service
│   │   ├── App.jsx             # Root component + routing
│   │   └── index.css           # Global styles
│   └── vite.config.js          # Vite config with API proxy
├── railway.json                # Railway deployment config
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas cloud)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint          | Description      | Access  |
| ------ | ----------------- | ---------------- | ------- |
| POST   | `/api/auth/signup` | Register user    | Public  |
| POST   | `/api/auth/login`  | Login user       | Public  |
| GET    | `/api/auth/me`     | Get profile      | Private |
| GET    | `/api/auth/users`  | List all users   | Private |

### Projects

| Method | Endpoint              | Description       | Access       |
| ------ | --------------------- | ----------------- | ------------ |
| GET    | `/api/projects`       | Get all projects  | Private      |
| GET    | `/api/projects/:id`   | Get single project| Private      |
| POST   | `/api/projects`       | Create project    | Admin only   |
| PUT    | `/api/projects/:id`   | Update project    | Admin only   |
| DELETE | `/api/projects/:id`   | Delete project    | Admin only   |

### Tasks

| Method | Endpoint                    | Description       | Access       |
| ------ | --------------------------- | ----------------- | ------------ |
| GET    | `/api/tasks`                | Get all tasks     | Private      |
| GET    | `/api/tasks/:id`            | Get single task   | Private      |
| GET    | `/api/tasks/dashboard/stats`| Dashboard stats   | Private      |
| POST   | `/api/tasks`                | Create task       | Admin only   |
| PUT    | `/api/tasks/:id`            | Update task       | Private*     |
| DELETE | `/api/tasks/:id`            | Delete task       | Admin only   |

> *Members can only update the status of tasks assigned to them.

### Sample Request Bodies

**Signup:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Create Project:**
```json
{
  "title": "Website Redesign",
  "description": "Redesign the company website",
  "members": ["<user_id>"],
  "color": "#6366f1"
}
```

**Create Task:**
```json
{
  "title": "Design homepage",
  "description": "Create mockups for the new homepage",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-05-15",
  "project": "<project_id>",
  "assignedTo": "<user_id>"
}
```

---

## 🚂 Railway Deployment

1. Push code to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Add a MongoDB plugin (or use Atlas URI)
4. Set environment variables:
   - `MONGODB_URI` — your MongoDB connection string
   - `JWT_SECRET` — a strong secret key
   - `JWT_EXPIRES_IN` — e.g. `7d`
   - `NODE_ENV` — `production`
5. Deploy! Railway will auto-detect the `railway.json` config.

---

## 👥 Roles & Permissions

| Action              | Admin | Member |
| ------------------- | ----- | ------ |
| Create projects     | ✅    | ❌     |
| Delete projects     | ✅    | ❌     |
| Create tasks        | ✅    | ❌     |
| Delete tasks        | ✅    | ❌     |
| Update any task     | ✅    | ❌     |
| Update own task status | ✅ | ✅     |
| View dashboard      | ✅    | ✅     |
| View assigned tasks | ✅    | ✅     |

---

## 📄 License

MIT — free for personal and commercial use.
