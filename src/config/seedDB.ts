import { connectDB } from './mongodb';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';
import ChatHistory from '../models/ChatHistory';
import mongoose from 'mongoose';

export const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await ChatHistory.deleteMany({});
    
    // Create a sample user
    const sampleUser = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword123',
    });
    await sampleUser.save();
    
    // Create a sample project
    const sampleProject = new Project({
      title: 'Project Catalyst - AI Assistant',
      description: 'An intelligent project management system with AI-powered chat assistance for navigation and project planning. Features include task management, progress tracking, and collaborative tools.',
      status: 'active',
      teamMembers: 5,
      deadline: new Date('2024-12-31'),
      progress: 75,
      userId: sampleUser._id,
    });
    await sampleProject.save();
    
    // Create sample chat history
    const sampleChatHistory = new ChatHistory({
      userId: sampleUser._id,
      message: 'How can I create a new project and manage tasks effectively?',
      response: 'To create a new project, navigate to the Projects section and click "New Project". Fill in the project details including title, description, deadline, and team members. For task management, you can break down your project into smaller tasks, assign them to team members, set priorities, and track progress. The system provides visual progress indicators and deadline reminders to keep your project on track.',
      chatType: 'project-planning',
    });
    await sampleChatHistory.save();
    
    console.log('✅ Sample data created successfully!');
    console.log('📊 Database populated with:');
    console.log('  - 1 user');
    console.log('  - 1 project');
    console.log('  - 1 chat history');
    console.log('  - 0 tasks (ready for creation)');
    
    return true;
  } catch (error) {
    console.error('Database seeding error:', error);
    throw error;
  }
};

// Run seeding
seedDatabase()
  .then(() => {
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('MongoDB URL: mongodb://localhost:27017/project_catalyst');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });