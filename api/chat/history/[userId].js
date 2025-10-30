import connectDB from '../../_lib/mongodb.js';
import { ChatHistory } from '../../_lib/models.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
      await connectDB();

      const { chatType = 'project-planning', projectId = null } = req.query;

      let query = { userId, chatType };
      
      // If projectId is provided, filter by it
      if (projectId && projectId !== 'null') {
        query.projectId = projectId;
      }

      const chatHistory = await ChatHistory.find(query)
        .sort({ timestamp: 1 })
        .limit(100); // Limit to last 100 messages for performance

      res.json(chatHistory);

    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ 
        error: 'Failed to get chat history',
        message: error.message 
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      await connectDB();

      const { chatType = 'project-planning', projectId = null } = req.query;

      let query = { userId, chatType };
      
      // If projectId is provided, delete only that project's history
      if (projectId && projectId !== 'null') {
        query.projectId = projectId;
      }

      await ChatHistory.deleteMany(query);

      res.json({ 
        success: true, 
        message: 'Chat history cleared successfully' 
      });

    } catch (error) {
      console.error('Delete chat history error:', error);
      res.status(500).json({ 
        error: 'Failed to clear chat history',
        message: error.message 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}