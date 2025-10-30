import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/project_catalyst';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default mongoose;
