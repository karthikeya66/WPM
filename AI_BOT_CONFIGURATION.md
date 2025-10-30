# 🤖 AI Bot Configuration for Project Catalyst

## Overview
Project Catalyst uses Google Gemini AI (gemini-2.0-flash-exp) for intelligent project planning and navigation assistance.

## AI Bot Details

### **Primary AI Bot (Project Planning)**
- **Location**: `src/pages/ProjectChat.tsx`
- **Model**: `gemini-2.0-flash-exp`
- **API Key**: `AIzaSyDhntT70uByTK-K0ql-7dUzsIJXLRuUYPs`
- **Purpose**: Detailed project analysis and planning consultation with access to user's project data
- **Chat Type**: `project-planning`
- **Persistence**: Saves conversations to MongoDB
- **Data Access**: Fetches and analyzes user's existing projects from database
- **Context Awareness**: Detects newly created projects and provides immediate assistance

### **Project Creation AI Bot (NEW)**
- **Location**: `src/pages/NewProject.tsx`
- **URL**: `http://localhost:8080/ProjectsManagement/ProjectAnalysis`
- **Model**: `gemini-2.0-flash-exp`
- **API Key**: `AIzaSyDhntT70uByTK-K0ql-7dUzsIJXLRuUYPs` (same as planning bot)
- **Purpose**: Conversational project creation through ChatGPT-like interface
- **Chat Type**: `project-creation`
- **Persistence**: No database storage (session only, but creates actual projects)
- **Special Feature**: Automatically creates projects in MongoDB when user confirms

### **Navigation AI Bot**
- **Location**: `src/components/ChatPanel.tsx`
- **Model**: `gemini-2.0-flash-exp`
- **API Key**: `AIzaSyAwjY_idMdxfoWwL8QicKxEd1srbsHXxzM`
- **Purpose**: Navigation assistance and general platform help
- **Chat Type**: `navigation`
- **Persistence**: No database storage (session only)

## System Context Provided to AI

### **Technology Stack Information**
- **Frontend**: React 18 + TypeScript, Vite, shadcn/ui, TailwindCSS
- **Backend**: Express.js + Node.js
- **Database**: MongoDB with Mongoose ODM
- **Ports**: Frontend (8080), Backend (3001), MongoDB (27017)

### **Project Data Structure**
```javascript
{
  title: String (required),
  description: String (optional, defaults to "No description provided"),
  teamMembers: Number (required, minimum 1),
  deadline: Date (optional, can be null),
  status: 'active' | 'completed' | 'on-hold',
  progress: Number (0-100%),
  userId: ObjectId (required)
}
```

### **Current Features**
- ✅ Dashboard with real-time project statistics
- ✅ **NEW**: Conversational AI project creation (ChatGPT-like interface)
- ✅ AI-powered project planning chat
- ✅ Chat history persistence in MongoDB
- ✅ Project CRUD operations via REST API
- ✅ Responsive UI with modern glass-morphism design

### **System Limitations**
- ❌ Single-user mock authentication (no real user management)
- ❌ No file upload/attachment system
- ❌ No real-time collaboration features
- ❌ No email notifications or external integrations
- ❌ No advanced project templates or workflows
- ❌ No time tracking or resource management
- ❌ No project sharing or team collaboration features
- ❌ Local deployment only (no cloud hosting configured)

## AI Bot Capabilities

### **Project Planning Bot**
1. **Context-Aware Consultation**: Understands Project Catalyst's technical stack and limitations
2. **Project Data Integration**: Automatically fetches and analyzes user's existing projects from MongoDB
3. **New Project Detection**: Recognizes when user just created a project and provides immediate planning assistance
4. **Personalized Recommendations**: Provides advice based on user's project history and patterns
5. **Targeted Questioning**: Asks specific questions about project requirements within system constraints
6. **Realistic Recommendations**: Provides actionable advice that works with React/Node.js/MongoDB stack
7. **Structured Output**: Creates detailed project workflows, task breakdowns, and implementation plans
8. **Database Integration**: Saves all conversations for future reference
9. **Real-time Project Refresh**: Can update project data during conversation

### **Project Creation Bot (NEW)**
1. **Conversational Interface**: ChatGPT-like experience for project creation
2. **Guided Data Collection**: Asks questions to gather required project information
3. **Smart Validation**: Ensures all required fields (title, team size) are collected
4. **Progress Tracking**: Shows user how many required fields are completed
5. **Automatic Project Creation**: Creates actual projects in MongoDB when confirmed
6. **Seamless Transition**: Redirects to project planning chat after creation

### **Navigation Bot**
1. **Platform Navigation**: Helps users navigate between different pages
2. **Feature Explanation**: Explains what each page and feature does
3. **URL Guidance**: Provides exact localhost URLs for different sections
4. **General Support**: Answers questions about platform capabilities
5. **Quick Access**: Available as floating chat button on all pages

## API Endpoints Used

### **Gemini AI API**
- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`
- **Method**: POST
- **Authentication**: API Key in URL parameter
- **Request Format**: JSON with contents array
- **Response Format**: JSON with candidates array

### **Chat Persistence API**
- **Save Chat**: `POST /api/chat/save`
- **Get History**: `GET /api/chat/history/:userId`
- **Delete History**: `DELETE /api/chat/history/:userId`

## Configuration Files

### **Environment Variables**
```bash
# No environment variables currently used for AI
# API keys are hardcoded (should be moved to .env in production)
```

### **Recommended Production Setup**
```bash
# .env file
GEMINI_API_KEY_PLANNING=AIzaSyDhntT70uByTK-K0ql-7dUzsIJXLRuUYPs
GEMINI_API_KEY_NAVIGATION=AIzaSyAwjY_idMdxfoWwL8QicKxEd1srbsHXxzM
VITE_FRONTEND_URL=http://localhost:8080
VITE_BACKEND_URL=http://localhost:3001
```

## Fine-Tuning Considerations

### **Current Prompt Engineering**
- Both bots receive detailed system context about Project Catalyst
- Project planning bot gets comprehensive technical stack information
- **NEW**: Project planning bot receives user's complete project portfolio data
- **NEW**: Project planning bot detects and responds to newly created projects
- Navigation bot gets specific URL mappings and feature descriptions
- Both understand current limitations and capabilities

### **Implemented Improvements**
1. ✅ **Dynamic Context**: AI now loads user's complete project data into prompts
2. ✅ **New Project Detection**: AI recognizes and responds to newly created projects
3. ✅ **Progress Tracking**: AI includes current project status in planning recommendations
4. ✅ **Resource Optimization**: AI adjusts recommendations based on team size constraints
5. ✅ **Timeline Intelligence**: AI factors in optional deadline field for better planning
6. ✅ **Project Portfolio Analysis**: AI can compare and reference multiple user projects

### **Future Improvements**
1. **Template Integration**: Provide pre-built project templates in responses
2. **Real-time Collaboration**: Include team member activity in recommendations
3. **Predictive Analytics**: Suggest project completion timelines based on historical data
4. **Integration Suggestions**: Recommend connections between related projects

### **Monitoring & Analytics**
- All project planning conversations are stored in MongoDB
- Navigation conversations are session-only (not persisted)
- Error handling with user-friendly fallback messages
- Toast notifications for database operations

## Security Notes
- API keys are currently hardcoded (not recommended for production)
- No rate limiting implemented
- No user authentication validation for AI access
- Consider implementing API key rotation and environment-based configuration

---

**Last Updated**: October 21, 2025
**AI Model Version**: gemini-2.0-flash-exp
**System Version**: Project Catalyst v1.0