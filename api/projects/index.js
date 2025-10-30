import connectDB from '../_lib/mongodb.js';
import { Project } from '../_lib/models.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const projects = await Project.find({ userId }).sort({ createdAt: -1 });
      res.json(projects);

    } else if (req.method === 'POST') {
      const { userId, title, description, teamMembers, deadline, status = 'active', progress = 0 } = req.body;

      if (!userId || !title || !teamMembers) {
        return res.status(400).json({ error: 'Missing required fields: userId, title, teamMembers' });
      }

      const project = new Project({
        userId,
        title,
        description: description || "No description provided",
        teamMembers,
        deadline: deadline ? new Date(deadline) : null,
        status,
        progress
      });

      await project.save();
      res.status(201).json(project);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Projects API error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}