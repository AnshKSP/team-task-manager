# Team Task Manager (Sahara)

A full-stack project management application featuring robust role-based access control, task tracking, real-time updates, and a modern, premium UI.

## Key Features
*   **Authentication**: Secure JWT-based Signup and Login.
*   **Project & Team Management**: Create projects, add team members by email, and view all workspace users in a dedicated Team Directory.
*   **Kanban Task Board**: Create, assign, and track tasks across different states (To Do, In Progress, In Review, Done).
*   **Role-Based Access Control**: `ADMIN` and `MEMBER` roles. Admins manage the workspace, approve tasks, and invite members.
*   **Rich Task Details**: Tasks support priority labels (Low, Medium, High), subtask/progress message updates, and due dates.
*   **Global Activity Timeline**: A chronological audit log tracking all actions across the workspace.
*   **Dashboard**: A premium interface featuring interactive charts (Recharts) summarizing task distribution and overdue notices.

## Tech Stack
*   **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Socket.io-client.
*   **Backend**: Node.js, Express.js, Socket.io.
*   **Database**: MongoDB (Mongoose).

## Local Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd project
   ```

2. **Install Backend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Run the Application**:
   You can run both servers concurrently from the root directory:
   ```bash
   npm run dev
   ```

## Deployment instructions for Railway

### 1. Database (MongoDB)
*   Deploy a MongoDB instance on Railway by clicking "New" -> "Database" -> "Add MongoDB".

### 2. Backend (Node/Express)
*   Deploy from your GitHub repo.
*   Set Root Directory to `/` (default).
*   Add Environment Variables in Railway:
    *   `MONGO_URI` (Use the internal connection string from your Railway MongoDB).
    *   `JWT_SECRET` (A strong random string).
    *   `PORT` (Usually Railway provides this, or use `5000`).

### 3. Frontend (React/Vite)
*   Deploy the same GitHub repo as a separate Railway service.
*   Set Root Directory to `/frontend`.
*   Override the build command to: `npm run build`
*   Add Environment Variable:
    *   `VITE_API_URL` = `https://<YOUR-RAILWAY-BACKEND-URL>/api`
