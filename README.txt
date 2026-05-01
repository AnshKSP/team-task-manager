Team Task Manager (Sahara)

A full-stack project management application featuring robust role-based access control, task tracking, real-time updates, and a modern, premium UI.

=====================================
KEY FEATURES
=====================================
* Authentication: Secure JWT-based Signup and Login.
* Project & Team Management: Create projects, add team members by email, and view all workspace users in a dedicated Team Directory.
* Kanban Task Board: Create, assign, and track tasks across different states (To Do, In Progress, In Review, Done).
* Role-Based Access Control: ADMIN and MEMBER roles. Admins manage the workspace, approve tasks, and invite members.
* Rich Task Details: Tasks support priority labels (Low, Medium, High), subtask/progress message updates, and due dates.
* Global Activity Timeline: A chronological audit log tracking all actions across the workspace.
* Dashboard: A premium interface featuring interactive charts summarizing task distribution and overdue notices.

=====================================
TECH STACK
=====================================
* Frontend: React, Vite, Tailwind CSS, Framer Motion, Socket.io-client.
* Backend: Node.js, Express.js, Socket.io.
* Database: MongoDB (Mongoose).

=====================================
DEPLOYMENT INSTRUCTIONS (RAILWAY)
=====================================
1. Deploy a MongoDB database on Railway.
2. Deploy the backend service from GitHub. Add the required environment variables: MONGO_URI, JWT_SECRET, PORT.
3. Deploy the frontend service from GitHub (Set root directory to '/frontend' and build command to 'npm run build'). Add the VITE_API_URL environment variable pointing to the backend's live URL.
