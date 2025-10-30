import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, ArrowLeft, History, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chatService";
import { projectService, Project } from "@/services/projectService";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const ProjectChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you with your new project today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history and user projects on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setIsLoadingHistory(true);

        // Check for newly created project data
        const newProjectData = sessionStorage.getItem('newProjectData');
        let newProjectInfo = null;
        if (newProjectData) {
          newProjectInfo = JSON.parse(newProjectData);
          sessionStorage.removeItem('newProjectData'); // Clear after reading
        }

        // Check for selected project data from dashboard
        const selectedProjectData = sessionStorage.getItem('selectedProjectData');
        let selectedProjectInfo = null;
        if (selectedProjectData) {
          selectedProjectInfo = JSON.parse(selectedProjectData);
          sessionStorage.removeItem('selectedProjectData'); // Clear after reading
        }

        // Load chat history - project-specific if we have selected project
        let history;
        if (selectedProjectInfo) {
          // Load chat history for this specific project
          history = await chatService.getUserChatHistory(user._id, 'project-planning', selectedProjectInfo._id, selectedProjectInfo.title);
        } else {
          // Load general chat history (backward compatibility)
          history = await chatService.getUserChatHistory(user._id, 'project-planning');
        }

        // Load user projects
        const projects = await projectService.getUserProjects(user._id);
        setUserProjects(projects);

        if (history.length > 0) {
          const loadedMessages: Message[] = [];
          history.forEach((chat, index) => {
            loadedMessages.push({
              id: index * 2 + 1,
              text: chat.message,
              sender: "user",
              timestamp: new Date(chat.createdAt!),
            });
            loadedMessages.push({
              id: index * 2 + 2,
              text: chat.response,
              sender: "ai",
              timestamp: new Date(chat.createdAt!),
            });
          });

          // Create personalized greeting based on projects and new project
          let greetingText = "Hello! I'm your AI assistant. How can I help you with your new project today?";
          if (selectedProjectInfo) {
            greetingText = `📋 Welcome back to "${selectedProjectInfo.title}"! This project has ${selectedProjectInfo.teamMembers} team member${selectedProjectInfo.teamMembers !== 1 ? 's' : ''} and is currently ${selectedProjectInfo.status} with ${selectedProjectInfo.progress}% progress. How can I help you continue planning and improving this project?`;
          } else if (newProjectInfo) {
            greetingText = `🎉 Congratulations! I see you just created "${newProjectInfo.title}" with a team of ${newProjectInfo.teamMembers}. Let me help you plan the implementation details, create a roadmap, and break down the tasks. What specific aspects would you like to focus on first?`;
          } else if (projects.length > 0) {
            greetingText = `Hello! I can see you have ${projects.length} project${projects.length > 1 ? 's' : ''} in your workspace. I'm here to help you plan your next project or improve existing ones. What would you like to work on?`;
          }

          setMessages([
            {
              id: 0,
              text: greetingText,
              sender: "ai",
              timestamp: new Date(),
            },
            ...loadedMessages
          ]);
        } else {
          // No chat history - create appropriate greeting
          let greetingText = "Hello! I'm your AI assistant. How can I help you with your new project today?";
          if (selectedProjectInfo) {
            greetingText = `📋 Welcome back to "${selectedProjectInfo.title}"! This project has ${selectedProjectInfo.teamMembers} team member${selectedProjectInfo.teamMembers !== 1 ? 's' : ''} and is currently ${selectedProjectInfo.status} with ${selectedProjectInfo.progress}% progress. How can I help you continue planning and improving this project?`;
          } else if (newProjectInfo) {
            greetingText = `🎉 Congratulations! I see you just created "${newProjectInfo.title}" with a team of ${newProjectInfo.teamMembers}. Let me help you plan the implementation details, create a roadmap, and break down the tasks. What specific aspects would you like to focus on first?`;
          } else if (projects.length > 0) {
            greetingText = `Hello! I can see you have ${projects.length} project${projects.length > 1 ? 's' : ''} in your workspace. I'm here to help you plan your next project or improve existing ones. What would you like to work on?`;
          }

          setMessages([{
            id: 1,
            text: greetingText,
            sender: "ai",
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load previous conversations and projects');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadData();
  }, [user]);

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
      const GEMINI_API_KEY = "AIzaSyDhntT70uByTK-K0ql-7dUzsIJXLRuUYPs";

      // Check for newly created project context
      const newProjectData = sessionStorage.getItem('newProjectData');
      const newProjectContext = newProjectData ? `

## NEWLY CREATED PROJECT:
The user just created a new project with the following details:
${JSON.stringify(JSON.parse(newProjectData), null, 2)}

**IMPORTANT**: The user just came from creating this project and likely wants immediate help with planning and implementation. Focus on:
- Helping them break down the project into actionable tasks
- Creating a detailed implementation roadmap
- Suggesting best practices for their specific project type
- Providing technical guidance within our React/Node.js/MongoDB stack
- Helping them organize their team and workflow
` : '';

      // Check for selected project context from dashboard
      const selectedProjectData = sessionStorage.getItem('selectedProjectData');
      const selectedProjectContext = selectedProjectData ? `

## SELECTED PROJECT FOCUS:
The user clicked on a specific project from their dashboard and wants to continue working on:
${JSON.stringify(JSON.parse(selectedProjectData), null, 2)}

**IMPORTANT**: The user is returning to work on this existing project. Focus on:
- Continuing previous conversations and planning for this project
- Helping them advance the project from its current state
- Providing updates and improvements based on current progress
- Addressing any challenges they might be facing with this project
- Suggesting next steps based on the project's current status and progress
` : '';

      // Prepare user project context
      const projectContext = userProjects.length > 0 ? `

## USER'S CURRENT PROJECTS:
The user currently has ${userProjects.length} project${userProjects.length > 1 ? 's' : ''} in their workspace:

${userProjects.map((project, index) => `
**Project ${index + 1}: ${project.title}**
- Description: ${project.description || 'No description provided'}
- Team Size: ${project.teamMembers} member${project.teamMembers > 1 ? 's' : ''}
- Status: ${project.status}
- Progress: ${project.progress}%
- Deadline: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline set'}
- Created: ${project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
`).join('\n')}

**IMPORTANT**: Use this project data to provide more personalized and contextual advice. You can:
- Reference their existing projects when making recommendations
- Suggest improvements to current projects
- Help them avoid repeating similar project structures
- Provide insights based on their project history and patterns
- Recommend complementary projects or features
- Help them manage workload across multiple projects
` : `

## USER'S CURRENT PROJECTS:
The user has no existing projects in their workspace. This appears to be their first project in Project Catalyst.

**IMPORTANT**: Since this is likely their first project, provide extra guidance on:
- How to structure their first project effectively
- Best practices for project planning in Project Catalyst
- Setting realistic expectations for team size and timelines
- Making the most of the platform's features
`;

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
                text: `You are an expert Project Analysis and Planning Consultant for Project Catalyst - a comprehensive project management platform. Your role is to help users create detailed project workflows by gathering comprehensive information.

${newProjectContext}${selectedProjectContext}${projectContext}

## SYSTEM CONTEXT & LIMITATIONS:
Project Catalyst is a full-stack application with the following technical stack and constraints:

**Current Technology Stack:**
- Frontend: React 18 + TypeScript, Vite, shadcn/ui, TailwindCSS
- Backend: Express.js + Node.js
- Database: MongoDB with Mongoose ODM
- AI Integration: Google Gemini AI (gemini-2.0-flash-exp)
- Authentication: Mock authentication system (ready for real auth)
- Deployment: Local development (ports 8080 frontend, 3001 backend, 27017 MongoDB)

**Project Data Structure:**
- Title: Required field (string)
- Description: Optional field (defaults to "No description provided")
- Team Size: Required field (minimum 1 member)
- Deadline: Optional field (can be null)
- Status: active | completed | on-hold
- Progress: 0-100%
- User Association: Each project belongs to a specific user

**Current Features:**
- Dashboard with real-time project statistics
- Project creation with form validation
- AI-powered project planning chat (this conversation)
- Chat history persistence in MongoDB
- Project CRUD operations via REST API
- Responsive UI with modern glass-morphism design

**System Limitations:**
- Single-user mock authentication (no real user management yet)
- No file upload/attachment system
- No real-time collaboration features
- No email notifications or external integrations
- No advanced project templates or workflows
- No time tracking or resource management
- No project sharing or team collaboration features
- Local deployment only (no cloud hosting configured)

## YOUR ROLE:
When a user describes their project, you should:

1. **Understand the Context**: Remember that this project will be created within Project Catalyst system with the above limitations.

2. **Ask Targeted Questions** about:
   - Project goals, objectives, and expected outcomes
   - Technical requirements (considering our React/Node.js/MongoDB stack)
   - Design preferences (leveraging our shadcn/ui + TailwindCSS setup)
   - Team size (required field in our system)
   - Timeline preferences (deadline is optional in our system)
   - Key features and functionalities
   - Integration needs (within our current tech stack)
   - Target audience or users

3. **Create Realistic Recommendations** that:
   - Work within our current technology stack
   - Consider our system limitations
   - Suggest features that can be built with React/Node.js/MongoDB
   - Provide actionable steps for implementation
   - Include realistic timeline estimates
   - Account for our current authentication and user management constraints

4. **Provide Structured Output** including:
   - Project phases and milestones
   - Task breakdown with priorities
   - Technology recommendations (within our stack)
   - Implementation approach
   - Potential challenges and solutions
   - Best practices for our platform

Be conversational, thorough, and ask follow-up questions. Guide the user step-by-step to build a comprehensive project plan that can realistically be implemented within Project Catalyst's current capabilities.

**API Key Used**: AIzaSyDhntT70uByTK-K0ql-7dUzsIJXLRuUYPs (Gemini 2.0 Flash Experimental)

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
      const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      const aiResponse: Message = {
        id: messages.length + 2,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Save to database with project context
      if (user) {
        try {
          // Get current project context for saving
          const currentSelectedProject = sessionStorage.getItem('selectedProjectData');
          let projectId, projectTitle;

          if (currentSelectedProject) {
            const projectData = JSON.parse(currentSelectedProject);
            projectId = projectData._id;
            projectTitle = projectData.title;
          }

          await chatService.saveChatMessage(
            user._id,
            userMessageText,
            aiResponseText,
            'project-planning',
            projectId,
            projectTitle
          );
          toast.success('Chat saved successfully');
        } catch (dbError) {
          console.error('Failed to save chat to database:', dbError);
          toast.error('Failed to save chat history');
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to get response");

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

  const refreshProjectData = async () => {
    if (!user) return;

    try {
      const projects = await projectService.getUserProjects(user._id);
      setUserProjects(projects);

      // Update greeting message with current project count
      const greetingText = projects.length > 0
        ? `Hello! I can see you have ${projects.length} project${projects.length > 1 ? 's' : ''} in your workspace. I'm here to help you plan your next project or improve existing ones. What would you like to work on?`
        : "Hello! I'm your AI assistant. How can I help you today?";

      setMessages(prev => [
        {
          id: 0,
          text: greetingText,
          sender: "ai",
          timestamp: new Date(),
        },
        ...prev.slice(1) // Keep all messages except the first greeting
      ]);

      toast.success('Project data refreshed');
    } catch (error) {
      console.error('Failed to refresh project data:', error);
      toast.error('Failed to refresh project data');
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;

    try {
      // Get current project context for clearing specific project history
      const currentSelectedProject = sessionStorage.getItem('selectedProjectData');
      let projectId, projectTitle;

      if (currentSelectedProject) {
        const projectData = JSON.parse(currentSelectedProject);
        projectId = projectData._id;
        projectTitle = projectData.title;

        // Clear only this project's history
        await chatService.deleteUserChatHistory(user._id, 'project-planning', projectId, projectTitle);
        toast.success(`Chat history cleared for "${projectTitle}"`);
      } else {
        // Clear all project planning history (backward compatibility)
        await chatService.deleteUserChatHistory(user._id, 'project-planning');
        toast.success('Chat history cleared');
      }

      // Refresh project data and set appropriate greeting
      await refreshProjectData();

    } catch (error) {
      console.error('Failed to clear chat history:', error);
      toast.error('Failed to clear chat history');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/Dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg glow-primary">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <div>
                <h1 className="text-xl font-semibold gradient-text">AI Project Planner</h1>
                <p className="text-sm text-muted-foreground">
                  {userProjects.length > 0
                    ? `Analyzing ${userProjects.length} project${userProjects.length > 1 ? 's' : ''} • Let's build something amazing`
                    : "Let's build something amazing"
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshProjectData}
              className="text-muted-foreground hover:text-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Projects
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <Card
                className={`max-w-[80%] p-4 ${message.sender === "user"
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "glass-intense border border-primary/20"
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Card>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <Card className="glass-intense border border-primary/20 p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto p-4">
          <div className="flex gap-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="glass border-primary/30 focus:border-primary text-base py-6"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              variant="neon"
              size="lg"
              className="px-6"
              disabled={!inputMessage.trim() || isTyping}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectChat;
