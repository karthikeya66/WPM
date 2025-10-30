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

  const { id } = req.query;

  try {
    await connectDB();

    if (req.method === 'GET') {
      const project = await Project.findById(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);

    } else if (req.method === 'PUT') {
      const updates = req.body;
      
      const project = await Project.findByIdAndUpdate(
        id, 
        updates, 
        { new: true, runValidators: true }
      );

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);

    } else if (req.method === 'DELETE') {
      const project = await Project.findByIdAndDelete(id);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({ success: true, message: 'Project deleted successfully' });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Project API error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}