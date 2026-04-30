# Team Task Manager

A full-stack project and task management app where admins can create projects, add team members, assign tasks, and track progress. Members can view their projects and update the status of tasks assigned to them.

## Live Links

- App: https://gilded-cajeta-8053f6.netlify.app
- API: https://teamtaskmanager-production-a94b.up.railway.app
- GitHub repo: https://github.com/vaibhav0604-rx/team_task_manager
- Demo video: Add your 2-5 minute demo video link here before submission

## Features

- Signup and login with JWT authentication
- Admin and member roles
- Project creation by admins
- Team member management by project admins
- Task creation, assignment, priority, due date, and status tracking
- Dashboard with total, completed, and overdue assigned tasks
- REST API connected to PostgreSQL
- Database relationships between users, projects, members, and tasks
- Backend validations for required fields, roles, task status, and priority

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, JWT, bcrypt
- Database: PostgreSQL
- Deployment: Railway for API, Netlify for frontend

## Role-Based Access

- Admin users can create projects.
- Project admins can add members, create tasks, delete tasks, and delete projects.
- Members can view projects they belong to.
- Assigned members can update their own task status.
- Backend routes enforce these permissions, not only the frontend UI.

## Local Setup

### Backend

```powershell
cd server
npm install
Copy-Item .env.example .env
npm run dev
```

Add real values in `server/.env`:

```env
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key
PORT=5000
```

Create the database tables with `server/schema.sql` before running the app for the first time.

### Frontend

```powershell
cd client/client
npm install
Copy-Item .env.example .env
npm run dev
```

For local development, use this in `client/client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Overview

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id`

### Tasks

- `GET /api/tasks/dashboard`
- `GET /api/tasks/my-tasks`
- `GET /api/tasks/project/:project_id`
- `POST /api/tasks`
- `PATCH /api/tasks/:id/status`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Demo Flow

1. Sign up as an admin.
2. Create a project.
3. Sign up another user as a member.
4. As admin, add the member to the project using their email.
5. Create a task and assign it to the member.
6. Login as the member and update the task status.
7. Check the dashboard totals, completed tasks, and overdue tasks.
