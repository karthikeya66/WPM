# 🚀 Quick Start Guide

## Prerequisites

✅ MongoDB installed and running on `mongodb://localhost:27017`  
✅ Node.js installed  

## Start Everything (Easy Way)

### Windows:
```bash
start.bat
```

### Manual:
```bash
# 1. Start MongoDB (if not running)
mongod

# 2. Install dependencies
npm install

# 3. Initialize database
npm run db:init

# 4. Start frontend + backend
npm run dev:all
```

## Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Dashboard**: http://localhost:8080/Dashboard

## Test the Chat Feature

1. Go to http://localhost:8080/Dashboard
2. Click **"Create Project"** in Quick Actions
3. Experience the ChatGPT-like project creation interface at http://localhost:8080/ProjectsManagement/ProjectAnalysis
4. Chat with the AI to create your project
5. Your chat history is automatically saved to MongoDB!

## Verify Database

Open MongoDB Compass and connect to `mongodb://localhost:27017`

You should see:
- Database: `project_catalyst`
- Collection: `chathistories` (with your chat messages)

## Features

✅ **Auto-save**: Every chat message is saved to MongoDB  
✅ **Auto-load**: Previous chats load when you return  
✅ **Clear History**: Button to delete all your chats  
✅ **User Isolation**: Each user has separate chat history  

## Troubleshooting

**MongoDB not running?**
```bash
mongod --dbpath="C:\data\db"
```

**Port already in use?**
- Frontend (8080): Change in `vite.config.ts`
- Backend (3001): Change in `server.js`

**Need help?**
See `MONGODB_SETUP.md` for detailed documentation.

---

**That's it! You're ready to go! 🎉**
