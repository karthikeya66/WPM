import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Define ChatHistory schema directly in server.js since we can't import TS files
const { Schema } = mongoose;

const ChatHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: false, // Optional for backward compatibility
    },
    projectTitle: {
      type: String,
      required: false, // Optional for backward compatibility
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    chatType: {
      type: String,
      enum: ['navigation', 'project-planning'],
      default: 'navigation',
    },
  },
  {
    timestamps: true,
  }
);

const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);

// Define Project schema
const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      default: 'No description provided',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'on-hold'],
      default: 'active',
    },
    teamMembers: {
      type: Number,
      required: true,
      min: 1,
    },
    deadline: {
      type: Date,
      required: false,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', ProjectSchema);

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/project_catalyst';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// API Routes

// Get user chat history
app.get('/api/chat/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { chatType, projectId, projectTitle } = req.query;

    const query = { userId };
    if (chatType) {
      query.chatType = chatType;
    }
    
    // Filter by project if specified
    if (projectId) {
      query.projectId = projectId;
    } else if (projectTitle) {
      query.projectTitle = projectTitle;
    }

    const chats = await ChatHistory.find(query).sort({ createdAt: 1 });
    res.json({ success: true, data: chats });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save chat message
app.post('/api/chat/save', async (req, res) => {
  try {
    const { userId, message, response, chatType, projectId, projectTitle } = req.body;

    const chatHistory = new ChatHistory({
      userId,
      projectId: projectId || null,
      projectTitle: projectTitle || null,
      message,
      response,
      chatType: chatType || 'project-planning',
    });

    const savedChat = await chatHistory.save();
    res.json({ success: true, data: savedChat });
  } catch (error) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user chat history
app.delete('/api/chat/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { chatType, projectId, projectTitle } = req.query;

    const query = { userId };
    if (chatType) {
      query.chatType = chatType;
    }
    
    // Filter by project if specified
    if (projectId) {
      query.projectId = projectId;
    } else if (projectTitle) {
      query.projectTitle = projectTitle;
    }

    await ChatHistory.deleteMany(query);
    res.json({ success: true, message: 'Chat history deleted' });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Project Routes

// Get user projects
app.get('/api/projects/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    let query = Project.find({ userId }).sort({ updatedAt: -1 });
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const projects = await query;
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const { userId, title, description, teamMembers, deadline } = req.body;

    // Validate required fields
    if (!userId || !title || !teamMembers || teamMembers < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: userId, title, and teamMembers (minimum 1) are required' 
      });
    }

    const project = new Project({
      userId,
      title: title.trim(),
      description: description?.trim() || 'No description provided',
      teamMembers,
      deadline: deadline ? new Date(deadline) : null,
      progress: 0,
      status: 'active'
    });

    const savedProject = await project.save();
    res.json({ success: true, data: savedProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update project
app.put('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;

    const project = await Project.findByIdAndUpdate(
      projectId,
      updates,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete project
app.delete('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
