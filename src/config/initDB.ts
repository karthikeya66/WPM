import { connectDB } from './mongodb';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';
import ChatHistory from '../models/ChatHistory';

export const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('✓ MongoDB connected');
    console.log('✓ Database: project_catalyst');
    console.log('✓ Collections initialized:');
    console.log('  - users');
    console.log('  - projects');
    console.log('  - tasks');
    console.log('  - chathistories');
    
    // Create indexes for better performance
    await User.createIndexes();
    await Project.createIndexes();
    await Task.createIndexes();
    await ChatHistory.createIndexes();
    
    console.log('✓ Indexes created successfully');
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('\n✅ Database setup completed successfully!');
    console.log('MongoDB URL: mongodb://localhost:27017/project_catalyst');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  });
