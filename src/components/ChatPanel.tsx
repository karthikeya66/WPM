import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export const ChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you with your projects today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    const userMessageText = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      const GEMINI_API_KEY = "AIzaSyAwjY_idMdxfoWwL8QicKxEd1srbsHXxzM";
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a Navigation Assistant for Project Catalyst, an intelligent project management platform. Your role is to help users navigate through the application and answer questions about the platform.

**Available Pages and URLs:**
- About Page (Start): http://localhost:8080/AboutPage
- Authentication: http://localhost:8080/auth
- Dashboard: http://localhost:8080/Dashboard
- Projects List: http://localhost:8080/Dashboard/ProjectsManagement
- Create New Project: http://localhost:8080/ProjectDetails
- Project Analysis (AI Chat): http://localhost:8080/ProjectsManagement/ProjectAnalysis
- Project Chat (AI Project Planner): http://localhost:8080/projects/chat
- Tasks: http://localhost:8080/tasks

**System Information:**
- Frontend: Running on http://localhost:8080 (React + TypeScript)
- Backend API: Running on http://localhost:3001 (Express.js)
- Database: MongoDB on localhost:27017
- AI Model: Google Gemini 2.0 Flash Experimental
- Current API Key: AIzaSyAwjY_idMdxfoWwL8QicKxEd1srbsHXxzM

**Your Capabilities:**
1. Help users navigate to specific pages by providing the exact URL
2. Answer questions about what each page does
3. Guide users on how to perform specific actions
4. Explain the features and structure of Project Catalyst
5. Provide information about the platform

**About Project Catalyst:**
Project Catalyst is an AI-powered project management platform built with React + TypeScript, Express.js, and MongoDB. Current features include:
- Real-time dashboard with project statistics from MongoDB
- Project creation with form validation (Title required, Team Size required, Description optional, Deadline optional)
- AI-powered project planning chat with conversation history persistence
- Project CRUD operations via REST API
- Modern glass-morphism UI with shadcn/ui components
- Mock authentication system (single user: Demo User)

**Current Limitations:**
- Single-user mock authentication (no real user management)
- No file upload or attachment system
- No real-time collaboration features
- No email notifications or external integrations
- Local deployment only (no cloud hosting)

**How to respond:**
- When users ask to do something (like "create a project"), provide the specific URL they need
- Be conversational and helpful
- Use the exact localhost URLs provided above
- If users ask general questions, explain the platform features
- Guide them step-by-step if needed

User message: ${userMessageText}`
              }]
            }]
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse: Message = {
        id: messages.length + 2,
        text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.',
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || 'Failed to get response');
      
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          variant="neon"
          size="icon"
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl animate-glow-pulse z-50"
          data-chat-button
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] glass-intense flex flex-col z-50 animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg glow-primary">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-destructive/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "glass border border-primary/20"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass border border-primary/20 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="glass border-primary/30 focus:border-primary"
              />
              <Button
                onClick={handleSend}
                variant="neon"
                size="icon"
                disabled={!inputMessage.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
