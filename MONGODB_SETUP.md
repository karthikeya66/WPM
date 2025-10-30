# MongoDB Integration Setup Guide

## 🎯 Overview

Your Project Catalyst application is now fully integrated with MongoDB to store chat history per user. Here's how the database integration works:

### **Database Architecture**

```
MongoDB (localhost:27017)
└── project_catalyst (database)
    ├── users (collection)
    ├── projects (collection)
    ├── tasks (collection)
    └── chathistories (collection) ✅ ACTIVE
```

### **How Chat History Works**

1. **User Authentication**: Each user gets a unique ID stored in `AuthContext`
2. **Chat Storage**: Every chat message & AI response is saved to MongoDB
3. **Chat Retrieval**: Previous conversations load automatically when you open the chat
4. **User Isolation**: Each user only sees their own chat history

---

## 🚀 Setup Instructions

### **Step 1: Install MongoDB**

If you don't have MongoDB installed:

**Windows:**
```bash
# Download MongoDB Community Server from:
https://www.mongodb.com/try/download/community

# Or use Chocolatey:
choco install mongodb
```

**Verify Installation:**
```bash
mongod --version
```

### **Step 2: Start MongoDB**

```bash
# Start MongoDB service
mongod --dbpath="C:\data\db"

# Or if installed as service:
net start MongoDB
```

**Verify MongoDB is running:**
- Open MongoDB Compass and connect to `mongodb://localhost:27017`
- Or check in browser: `http://localhost:27017` (should show "It looks like you are trying to access MongoDB over HTTP")

### **Step 3: Install Dependencies**

```bash
npm install
```

This will install:
- `express` - Backend server
- `cors` - Cross-origin requests
- `mongoose` - MongoDB ODM
- `concurrently` - Run multiple processes

### **Step 4: Initialize Database**

```bash
npm run db:init
```

This creates the database and collections.

### **Step 5: Start the Application**

**Option A: Run Everything Together (Recommended)**
```bash
npm run dev:all
```

This starts:
- Frontend (Vite): `http://localhost:8080`
- Backend API: `http://localhost:3001`

**Option B: Run Separately**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

---

## 📁 Project Structure

```
catalyst-neo-core-main/
├── server.js                          # Backend API server
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx           # User authentication context
│   ├── services/
│   │   └── chatService.ts            # Chat API service
│   ├── models/
│   │   ├── ChatHistory.ts            # Chat schema
│   │   ├── User.ts                   # User schema
│   │   ├── Project.ts                # Project schema
│   │   └── Task.ts                   # Task schema
│   ├── config/
│   │   ├── mongodb.ts                # MongoDB connection
│   │   └── initDB.ts                 # Database initialization
│   └── pages/
│       └── ProjectChat.tsx           # Chat UI with DB integration
```

---

## 🔌 API Endpoints

The backend server (`http://localhost:3001`) provides:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Check server & DB status |
| `GET` | `/api/chat/history/:userId` | Get user's chat history |
| `POST` | `/api/chat/save` | Save new chat message |
| `DELETE` | `/api/chat/history/:userId` | Clear user's chat history |

---

## 💡 Features Implemented

### ✅ **Chat History Persistence**
- All conversations saved to MongoDB
- Automatic loading on page refresh
- User-specific chat isolation

### ✅ **User Management**
- Mock user authentication (ready for real auth)
- User ID stored in localStorage
- Each user has separate chat history

### ✅ **Chat Operations**
- **Save**: Every message automatically saved
- **Load**: Previous chats load on mount
- **Clear**: "Clear History" button to delete all chats
- **Toast Notifications**: Success/error feedback

---

## 🧪 Testing the Integration

### **1. Test Database Connection**
```bash
# Check server health
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "mongodb": "connected"
}
```

### **2. Test Chat Saving**

1. Open `http://localhost:8080/Dashboard`
2. Click "Create Project" in Quick Actions
3. Click "Create Project" button on the form
4. Send a message in the chat
5. Check MongoDB Compass - you should see the message in `chathistories` collection

### **3. Test Chat Loading**

1. Send a few messages in the chat
2. Refresh the page
3. Previous messages should load automatically

### **4. Test Clear History**

1. Click "Clear History" button in chat header
2. All messages should be deleted
3. Check MongoDB - `chathistories` collection should be empty for your user

---

## 🔧 Configuration

### **Environment Variables** (`.env`)

```env
VITE_MONGODB_URI=mongodb://localhost:27017/project_catalyst
```

### **Change MongoDB URL**

Edit `server.js`:
```javascript
const MONGODB_URI = 'mongodb://localhost:27017/project_catalyst';
```

### **Change API Port**

Edit `server.js`:
```javascript
const PORT = 3001; // Change this
```

Then update `src/services/chatService.ts`:
```typescript
private apiUrl = 'http://localhost:3001/api'; // Match server port
```

---

## 🐛 Troubleshooting

### **Issue: "Failed to connect to MongoDB"**

**Solution:**
1. Ensure MongoDB is running: `mongod`
2. Check connection string in `.env`
3. Verify port 27017 is not blocked

### **Issue: "Failed to save chat history"**

**Solution:**
1. Check backend server is running on port 3001
2. Check browser console for CORS errors
3. Verify `server.js` is running

### **Issue: "Chat history not loading"**

**Solution:**
1. Check MongoDB Compass - verify data exists
2. Check Network tab - API calls to `/api/chat/history/:userId`
3. Check user ID in localStorage: `localStorage.getItem('user')`

### **Issue: CORS errors**

**Solution:**
Backend already has CORS enabled. If issues persist:
```javascript
// In server.js
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
```

---

## 📊 Database Schema

### **ChatHistory Collection**

```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  message: String,            // User's message
  response: String,           // AI's response
  chatType: String,           // 'project-planning' | 'navigation'
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

---

## 🎯 Next Steps

### **Implement Real Authentication**

Replace mock user in `AuthContext.tsx` with:
- Firebase Auth
- Supabase Auth
- Custom JWT authentication

### **Add More Features**

- Chat sessions/conversations
- Search chat history
- Export chat history
- Share conversations
- Chat analytics

### **Production Deployment**

1. Use MongoDB Atlas (cloud database)
2. Deploy backend to Heroku/Railway/Render
3. Update API URL in `chatService.ts`
4. Add environment variables

---

## 📝 Summary

✅ MongoDB connected at `mongodb://localhost:27017`  
✅ Backend API running on `http://localhost:3001`  
✅ Frontend running on `http://localhost:8080`  
✅ Chat history saved per user  
✅ Automatic chat loading  
✅ Clear history functionality  

**Your chat system is now fully integrated with MongoDB!** 🎉
