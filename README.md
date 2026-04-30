\# Team Task Manager



A web-based project and task management tool built as part of a full-stack development assessment. The app allows teams to create projects, assign tasks, and track progress with role-based access for Admins and Members.



\## Live Links

\- App: https://gilded-cajeta-8053f6.netlify.app

\- API: https://teamtaskmanager-production-a94b.up.railway.app



\## What I Built



I wanted to build something practical that solves a real problem — managing tasks across a team. The idea was to keep it simple but functional, with proper auth and role separation.



\## Features



\- Signup and Login with JWT authentication

\- Create projects and manage team members

\- Create tasks with priority levels, due dates and assignees

\- Update task status (To Do / In Progress / Done)

\- Dashboard showing your assigned tasks and stats

\- Admin vs Member role separation



\## Tech Stack



\- Frontend — React with Vite, styled using Tailwind CSS

\- Backend — Node.js with Express REST APIs

\- Database — PostgreSQL hosted on Railway

\- Auth — JWT tokens with bcrypt password hashing

\- Deployment — Railway for backend, Netlify for frontend



\## Running Locally



Backend:

cd server

npm install

npm run dev



Frontend:

cd client

npm install

npm run dev



Environment variables needed in server/.env:

DATABASE\_URL=your\_postgres\_url

JWT\_SECRET=your\_secret\_key

PORT=5000



\## What I Learned



This project helped me get hands-on with building a complete full-stack app from scratch — setting up REST APIs, connecting a real database, handling auth with JWT, and deploying everything to the cloud.

