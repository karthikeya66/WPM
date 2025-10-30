import connectDB from '../_lib/mongodb.js';
import { ChatHistory } from '../_lib/models.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { userId, message, response, chatType = 'project-planning', projectId = null, projectTitle = null } = req.body;

    if (!userId || !message || !response) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const chatEntry = new ChatHistory({
      userId,
      message,
      response,
      chatType,
      projectId,
      projectTitle,
      timestamp: new Date()
    });

    await chatEntry.save();

    res.status(201).json({ 
      success: true, 
      message: 'Chat saved successfully',
      id: chatEntry._id
    });

  } catch (error) {
    console.error('Save chat error:', error);
    res.status(500).json({ 
      error: 'Failed to save chat',
      message: error.message 
    });
  }
}