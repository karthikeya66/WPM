export interface ChatMessage {
  _id?: any;
  userId: any;
  projectId?: string;
  projectTitle?: string;
  message: string;
  response: string;
  chatType: 'navigation' | 'project-planning';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  lastUpdated: Date;
}

class ChatService {
  private apiUrl = 'http://localhost:3001/api';

  /**
   * Save a chat message and response to the database
   */
  async saveChatMessage(
    userId: string,
    message: string,
    response: string,
    chatType: 'navigation' | 'project-planning' = 'project-planning',
    projectId?: string,
    projectTitle?: string
  ): Promise<ChatMessage> {
    try {
      const res = await fetch(`${this.apiUrl}/chat/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, message, response, chatType, projectId, projectTitle }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save chat message');
      }

      return data.data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  /**
   * Get all chat history for a specific user
   */
  async getUserChatHistory(
    userId: string,
    chatType?: 'navigation' | 'project-planning',
    projectId?: string,
    projectTitle?: string
  ): Promise<ChatMessage[]> {
    try {
      const url = new URL(`${this.apiUrl}/chat/history/${userId}`);
      if (chatType) {
        url.searchParams.append('chatType', chatType);
      }
      if (projectId) {
        url.searchParams.append('projectId', projectId);
      }
      if (projectTitle) {
        url.searchParams.append('projectTitle', projectTitle);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch chat history');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  /**
   * Get recent chat sessions grouped by date
   */
  async getRecentChatSessions(
    userId: string,
    chatType: 'navigation' | 'project-planning' = 'project-planning',
    limit: number = 10
  ): Promise<ChatSession[]> {
    try {
      const chats = await this.getUserChatHistory(userId, chatType);
      
      // Sort by date descending and limit
      const sortedChats = chats
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, limit);

      // Group chats by session (simplified - group by day)
      const sessions: { [key: string]: ChatMessage[] } = {};
      
      sortedChats.forEach((chat) => {
        const date = new Date(chat.createdAt!);
        const sessionKey = date.toISOString().split('T')[0];
        
        if (!sessions[sessionKey]) {
          sessions[sessionKey] = [];
        }
        sessions[sessionKey].push(chat);
      });

      return Object.entries(sessions).map(([sessionId, messages]) => ({
        sessionId,
        messages: messages.reverse(), // Chronological order within session
        lastUpdated: new Date(messages[messages.length - 1].createdAt!),
      }));
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
  }

  /**
   * Delete a specific chat message
   */
  async deleteChatMessage(chatId: string): Promise<void> {
    try {
      const res = await fetch(`${this.apiUrl}/chat/message/${chatId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete chat message');
      }
    } catch (error) {
      console.error('Error deleting chat message:', error);
      throw error;
    }
  }

  /**
   * Delete all chat history for a user
   */
  async deleteUserChatHistory(userId: string, chatType?: string, projectId?: string, projectTitle?: string): Promise<void> {
    try {
      const url = new URL(`${this.apiUrl}/chat/history/${userId}`);
      if (chatType) {
        url.searchParams.append('chatType', chatType);
      }
      if (projectId) {
        url.searchParams.append('projectId', projectId);
      }
      if (projectTitle) {
        url.searchParams.append('projectTitle', projectTitle);
      }

      const res = await fetch(url.toString(), {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete chat history');
      }
    } catch (error) {
      console.error('Error deleting user chat history:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
