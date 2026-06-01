# Team Task Manager

This was one of my projects where i wanted to build something actually useful for teams. The idea was simple - a place where an admin can create projects, add team members, assign tasks, and everyone can see what they need to do.

I've used tools like Trello and Notion before and always wondered how the backend side of it works. So i built a basic version myself to understand it.

---

## Live Demo

- App: https://gilded-cajeta-8053f6.netlify.app
- API: https://teamtaskmanager-production-a94b.up.railway.app

You can sign up and try it out. Create a project, add another user as a member, assign them a task and see how it works from both sides.

---

## What it does

There are two types of users - admins and members.

**As an admin you can:**
- Create projects
- Add members to your project using their email
- Create tasks and assign them to members
- Set priority (low, medium, high) and due dates
- Delete tasks and projects

**As a member you can:**
- See projects you've been added to
- View tasks assigned to you
- Update the status of your own tasks (todo, in progress, done)
- See a dashboard showing your total, completed and overdue tasks

The permissions are handled on the backend too, not just the frontend. So you can't do admin things even if you try to call the API directly.

---

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, JWT for auth, bcrypt for passwords
- Database: PostgreSQL
- Deployed on Railway (backend) and Netlify (frontend)

---

## How to run locally

### Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Add your values in `server/.env`:
```
DATABASE_URL=your_postgres_url
JWT_SECRET=any_secret_string
PORT=5000
```

Run `schema.sql` in your PostgreSQL database first to create the tables.

### Frontend
```bash
cd client/client
npm install
cp .env.example .env
npm run dev
```

In `client/client/.env` set:
```
VITE_API_URL=http://localhost:5000/api
```

---

## API endpoints

**Auth**
- POST /api/auth/signup
- POST /api/auth/login

**Projects**
- GET /api/projects
- POST /api/projects
- GET /api/projects/:id
- POST /api/projects/:id/members
- DELETE /api/projects/:id

**Tasks**
- GET /api/tasks/dashboard
- GET /api/tasks/my-tasks
- GET /api/tasks/project/:project_id
- POST /api/tasks
- PATCH /api/tasks/:id/status
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

---

## Project structure

```
team_task_manager/
├── server/
│   ├── index.js          # express app setup
│   ├── db.js             # postgres connection
│   ├── schema.sql        # database tables
│   ├── middleware/
│   │   └── auth.js       # jwt verification
│   └── routes/
│       ├── auth.js       # signup, login
│       ├── projects.js   # project CRUD + members
│       └── tasks.js      # task CRUD + status updates
└── client/client/
    ├── src/
    │   ├── pages/        # Login, Signup, Dashboard, Projects, ProjectDetail
    │   ├── components/   # Navbar, PrivateRoute
    │   ├── context/      # AuthContext
    │   └── api/          # axios setup
    └── package.json
```

---

## What i learned

Building the role-based access was the most interesting part. Had to think carefully about what each type of user should be able to do and then make sure those rules were enforced on the API side, not just by hiding buttons in the UI.

Also learned how JWT auth actually works end to end - generating tokens on login, storing them in localStorage, sending them in request headers, and verifying them in middleware.

---

## Things i'd improve

- password reset functionality
- email notifications when tasks are assigned
- drag and drop for task status updates like Trello
- better mobile UI

---

Built this as part of my final year projects. B.Tech CSE - AI/ML, GD Goenka University, Faridabad.
