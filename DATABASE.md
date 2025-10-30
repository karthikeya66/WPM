# MongoDB Database Setup

## Connection Details
- **URL**: `mongodb://localhost:27017/`
- **Database Name**: `project_catalyst`

## Collections

### 1. **users**
Stores user account information
- email (unique)
- password
- name
- timestamps

### 2. **projects**
Stores project information
- title
- description
- status (active, completed, on-hold)
- teamMembers (number)
- deadline
- progress (0-100%)
- userId (reference to User)
- timestamps

### 3. **tasks**
Stores task information
- title
- projectId (reference to Project)
- projectName
- priority (low, medium, high)
- status (todo, in-progress, completed)
- deadline
- assignee
- userId (reference to User)
- timestamps

### 4. **chathistories**
Stores AI chat conversations
- userId (reference to User)
- message (user's message)
- response (AI's response)
- chatType (navigation, project-planning)
- timestamps

## Setup Instructions

### 1. Start MongoDB
Make sure MongoDB is running on your local machine at `mongodb://localhost:27017/`

### 2. Initialize Database
Run the following command to create the database and collections:

```bash
npm run db:init
```

This will:
- Connect to MongoDB
- Create the `project_catalyst` database
- Initialize all collections
- Create necessary indexes

### 3. Verify Setup
Open MongoDB Compass and connect to `mongodb://localhost:27017/`

You should see:
- Database: `project_catalyst`
- Collections: users, projects, tasks, chathistories

## Models Location
- User: `src/models/User.ts`
- Project: `src/models/Project.ts`
- Task: `src/models/Task.ts`
- ChatHistory: `src/models/ChatHistory.ts`

## Configuration
- MongoDB connection: `src/config/mongodb.ts`
- Database initialization: `src/config/initDB.ts`
