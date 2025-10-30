import mongoose, { Schema, Document } from 'mongoose';

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  response: string;
  chatType: 'navigation' | 'project-planning';
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistorySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

export default mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
