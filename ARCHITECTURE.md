# 🏗️ System Architecture

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                     http://localhost:8080                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │  Dashboard   │─────▶│ NewProject   │─────▶│ ProjectChat  │ │
│  │              │      │              │      │              │ │
│  │ Quick Actions│      │ Create Form  │      │  AI Chat UI  │ │
│  └──────────────┘      └──────────────┘      └──────┬───────┘ │
│                                                      │          │
│                                                      │          │
│  ┌───────────────────────────────────────────────────┼─────┐   │
│  │              AuthContext (User Session)           │     │   │
│  │  - user: { _id, email, name }                    │     │   │
│  │  - login(), logout()                              │     │   │
│  └───────────────────────────────────────────────────┼─────┘   │
│                                                      │          │
│                                                      ▼          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │         chatService (API Client)                      │     │
│  │  - saveChatMessage()                                  │     │
│  │  - getUserChatHistory()                               │     │
│  │  - deleteUserChatHistory()                            │     │
│  └───────────────────────────┬───────────────────────────┘     │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTP Requests
                               │ (fetch API)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                        │
│                     http://localhost:3001                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    API Routes                           │    │
│  │                                                         │    │
│  │  GET  /api/health                                       │    │
│  │  GET  /api/chat/history/:userId?chatType=...           │    │
│  │  POST /api/chat/save                                    │    │
│  │  DELETE /api/chat/history/:userId?chatType=...         │    │
│  │                                                         │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                     │
│                           ▼                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Mongoose Models                            │    │
│  │  - ChatHistory.find()                                   │    │
│  │  - ChatHistory.save()                                   │    │
│  │  - ChatHistory.deleteMany()                             │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │ Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Database                            │
│                  mongodb://localhost:27017                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Database: project_catalyst                                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Collection: chathistories                              │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ {                                                 │  │    │
│  │  │   _id: ObjectId("..."),                          │  │    │
│  │  │   userId: ObjectId("507f1f77bcf86cd799439011"),  │  │    │
│  │  │   message: "User's question",                    │  │    │
│  │  │   response: "AI's response",                     │  │    │
│  │  │   chatType: "project-planning",                  │  │    │
│  │  │   createdAt: ISODate("..."),                     │  │    │
│  │  │   updatedAt: ISODate("...")                      │  │    │
│  │  │ }                                                 │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Collection: users                                      │    │
│  │  Collection: projects                                   │    │
│  │  Collection: tasks                                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow: Sending a Chat Message

```
1. User types message in ProjectChat
   └─▶ handleSend() triggered

2. Message sent to Gemini AI API
   └─▶ AI generates response

3. chatService.saveChatMessage() called
   └─▶ POST http://localhost:3001/api/chat/save
       Body: { userId, message, response, chatType }

4. Backend receives request
   └─▶ server.js: app.post('/api/chat/save')

5. Mongoose creates document
   └─▶ new ChatHistory({ userId, message, response, chatType })

6. Save to MongoDB
   └─▶ chatHistory.save()

7. Response sent back
   └─▶ { success: true, data: savedChat }

8. Frontend updates UI
   └─▶ Toast: "Chat saved successfully"
```

---

## Request Flow: Loading Chat History

```
1. ProjectChat component mounts
   └─▶ useEffect(() => loadChatHistory(), [user])

2. chatService.getUserChatHistory() called
   └─▶ GET http://localhost:3001/api/chat/history/:userId?chatType=project-planning

3. Backend receives request
   └─▶ server.js: app.get('/api/chat/history/:userId')

4. Mongoose queries database
   └─▶ ChatHistory.find({ userId, chatType }).sort({ createdAt: 1 })

5. MongoDB returns documents
   └─▶ Array of chat messages

6. Response sent back
   └─▶ { success: true, data: chats }

7. Frontend processes data
   └─▶ Convert to Message[] format

8. UI updates
   └─▶ setMessages([...previousChats])
```

---

## Component Hierarchy

```
App
├─ AuthProvider ★
│  └─ (Provides user context to all children)
│
├─ BrowserRouter
│  ├─ Routes
│  │  ├─ /Dashboard
│  │  │  └─ Dashboard
│  │  │     └─ Quick Actions
│  │  │        └─ "Create Project" button ★
│  │  │
│  │  ├─ /ProjectsManagement/ProjectAnalysis
│  │  │  └─ NewProject (ChatGPT-like interface)
│  │  │     └─ Conversational project creation
│  │  │
│  │  └─ /projects/chat
│  │     └─ ProjectChat ★
│  │        ├─ useAuth() hook
│  │        ├─ chatService calls
│  │        ├─ Message list
│  │        ├─ Input field
│  │        └─ "Clear History" button ★
│  │
│  └─ ChatPanel
│
└─ Toast/Sonner providers

★ = Modified/Created for MongoDB integration
```

---

## Data Models

### **User**
```typescript
interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **ChatMessage**
```typescript
interface ChatMessage {
  _id?: any;
  userId: any;
  message: string;
  response: string;
  chatType: 'navigation' | 'project-planning';
  createdAt?: Date;
  updatedAt?: Date;
}
```

### **Message (UI)**
```typescript
interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}
```

---

## Technology Stack

### **Frontend**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast)
- **State Management**: React Context API

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Middleware**: CORS, express.json()

### **Database**
- **Type**: NoSQL (Document-based)
- **Engine**: MongoDB Community Server
- **Connection**: mongodb://localhost:27017
- **Database**: project_catalyst

### **AI Integration**
- **Provider**: Google Gemini AI
- **Model**: gemini-2.0-flash-exp
- **API**: REST API

---

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 8080 | http://localhost:8080 |
| Backend (Express) | 3001 | http://localhost:3001 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## File Structure

```
catalyst-neo-core-main/
│
├── src/                          # Frontend source
│   ├── contexts/
│   │   └── AuthContext.tsx       # User authentication ★
│   ├── services/
│   │   └── chatService.ts        # API client ★
│   ├── models/
│   │   ├── ChatHistory.ts        # Chat schema
│   │   ├── User.ts               # User schema
│   │   ├── Project.ts            # Project schema
│   │   └── Task.ts               # Task schema
│   ├── config/
│   │   ├── mongodb.ts            # DB connection
│   │   └── initDB.ts             # DB initialization
│   ├── pages/
│   │   ├── Dashboard.tsx         # Modified ★
│   │   ├── ProjectChat.tsx       # Modified ★
│   │   └── NewProject.tsx
│   ├── components/
│   │   └── ui/                   # shadcn components
│   ├── App.tsx                   # Modified ★
│   └── main.tsx
│
├── server.js                     # Backend API ★
├── package.json                  # Modified ★
├── .env                          # Environment variables
│
├── MONGODB_SETUP.md              # Setup guide ★
├── QUICK_START.md                # Quick reference ★
├── IMPLEMENTATION_SUMMARY.md     # Implementation details ★
├── ARCHITECTURE.md               # This file ★
└── start.bat                     # Windows startup script ★

★ = New or modified files
```

---

## Security Architecture

### **Current (Development)**
```
User ──▶ LocalStorage ──▶ AuthContext ──▶ API Calls
         (user object)     (mock auth)     (userId in URL/body)
```

### **Recommended (Production)**
```
User ──▶ Login Form ──▶ Backend Auth ──▶ JWT Token ──▶ Protected API
         (credentials)   (verify)         (signed)      (verify token)
                                                        
                                          ▼
                                    MongoDB (hashed passwords)
```

---

## Scalability Considerations

### **Current Setup**
- Single server architecture
- Direct MongoDB connection
- In-memory session storage
- No caching layer

### **Production Recommendations**

```
                    Load Balancer
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   Frontend 1      Frontend 2      Frontend 3
   (Static CDN)    (Static CDN)    (Static CDN)
        │                │                │
        └────────────────┼────────────────┘
                         │
                    API Gateway
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   Backend 1       Backend 2       Backend 3
   (Express)       (Express)       (Express)
        │                │                │
        └────────────────┼────────────────┘
                         │
                    Redis Cache
                         │
                    MongoDB Cluster
                    (Replica Set)
```

---

## Monitoring & Logging

### **Recommended Tools**
- **Application Monitoring**: PM2, New Relic
- **Database Monitoring**: MongoDB Atlas, MongoDB Compass
- **Logging**: Winston, Morgan
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Mixpanel

### **Key Metrics to Track**
- API response times
- Database query performance
- Error rates
- User activity
- Chat message volume
- Storage usage

---

## Backup Strategy

### **Development**
```bash
# Backup MongoDB
mongodump --db project_catalyst --out ./backups/

# Restore MongoDB
mongorestore --db project_catalyst ./backups/project_catalyst/
```

### **Production**
- Automated daily backups
- Point-in-time recovery
- Geographic redundancy
- Backup retention policy (30 days)

---

This architecture provides a solid foundation for your chat application with room for growth and enhancement! 🚀
