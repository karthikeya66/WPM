import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, ArrowLeft, Bot, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/projectService";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ProjectData {
  title?: string;
  description?: string;
  teamMembers?: number;
  deadline?: string;
}

const NewProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({});
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for project data from the form and initialize conversation
  useEffect(() => {
    const newProjectData = sessionStorage.getItem('newProjectData');
    if (newProjectData) {
      const projectInfo = JSON.parse(newProjectData);
      
      // Set initial message with project analysis
      const initialMessage: Message = {
        id: 1,
        text: `🎉 Excellent! I've received your project details:

**Project**: ${projectInfo.title}
**Team Size**: ${projectInfo.teamMembers} member${projectInfo.teamMembers > 1 ? 's' : ''}
**Description**: ${projectInfo.description || 'No description provided'}
**Deadline**: ${projectInfo.deadline ? new Date(projectInfo.deadline).toLocaleDateString() : 'No deadline set'}

Now let's dive deep into planning your project! I'll help you create a comprehensive roadmap, break down tasks, and provide technical guidance. 

What specific aspect would you like to focus on first? For example:
- Technical architecture and technology stack
- Project phases and milestones  
- Task breakdown and timeline
- Team roles and responsibilities
- Risk assessment and mitigation`,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages([initialMessage]);
      sessionStorage.removeItem('newProjectData'); // Clear after using
    } else {
      // No project data, show default message
      const defaultMessage: Message = {
        id: 1,
        text: "Hello! I'm here to help you analyze and plan your project. It looks like you haven't created a project yet. Please go back to the Projects Management page to create a project first, then return here for detailed analysis and planning.",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages([defaultMessage]);
    }
  }, []);

  const createProjectFromData = async (data: ProjectData) => {
    if (!user) {
      toast.error("You must be logged in to create a project");
      return;
    }

    if (!data.title || !data.teamMembers) {
      toast.error("Missing required project information");
      return;
    }

    try {
      setIsCreatingProject(true);
      
      const projectPayload = {
        userId: user._id,
        title: data.title.trim(),
        description: data.description?.trim() || "No description provided",
        teamMembers: data.teamMembers,
        deadline: data.deadline || null
      };

      const newProject = await projectService.createProject(projectPayload);
      
      toast.success("Project created successfully!");
      
      // Store the new project data for the planning chat
      sessionStorage.setItem('newProjectData', JSON.stringify({
        title: newProject.title,
        description: newProject.description,
        teamMembers: newProject.teamMembers,
        deadline: newProject.deadline,
        createdAt: new Date().toISOString()
      }));
      
      // Navigate to project planning chat
      navigate('/projects/chat');
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsCreatingProject(false);
    }
  };
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
                text: `You are a Project Creation Assistant for Project Catalyst. Your role is to help users create new projects through conversational interaction.

## YOUR MISSION:
Guide the user through creating a project by gathering the following REQUIRED information:
1. **Project Title** (required) - A clear, descriptive name
2. **Team Size** (required) - Number of team members (minimum 1)

And these OPTIONAL details:
3. **Description** (optional) - What the project is about
4. **Deadline** (optional) - When they want to complete it

## CURRENT PROJECT DATA COLLECTED:
${JSON.stringify(projectData, null, 2)}

## CONVERSATION RULES:
1. **Be conversational and friendly** - Ask questions naturally, like a helpful colleague
2. **Ask ONE question at a time** - Don't overwhelm the user
3. **Validate information** - If they provide unclear info, ask for clarification
4. **Show progress** - Let them know what info you still need
5. **Be encouraging** - Make the process feel easy and exciting

## WHEN YOU HAVE REQUIRED INFO:
Once you have both Title and Team Size, offer to create the project:
"Great! I have everything I need:
- Title: [title]
- Team Size: [number] members
- Description: [description or 'Not specified']
- Deadline: [deadline or 'Not set']

Would you like me to create this project now? Just say 'yes' or 'create project' and I'll set it up for you!"

## SPECIAL COMMANDS:
If the user says "yes", "create project", "create it", or similar confirmation after you've offered to create the project, respond with:
"EXECUTE_PROJECT_CREATION"

## CONTEXT:
- This is Project Catalyst, a React/Node.js/MongoDB project management platform
- Projects will be stored in MongoDB and appear on their dashboard
- After creation, they'll be taken to an AI planning assistant

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
      
      // Check if AI wants to execute project creation
      if (aiResponseText.includes("EXECUTE_PROJECT_CREATION")) {
        await createProjectFromData(projectData);
        return;
      }
      
      // Extract project data from AI response if it contains structured info
      const titleMatch = aiResponseText.match(/Title:\s*([^\n]+)/i);
      const teamMatch = aiResponseText.match(/Team Size:\s*(\d+)/i);
      const descMatch = aiResponseText.match(/Description:\s*([^\n]+)/i);
      const deadlineMatch = aiResponseText.match(/Deadline:\s*([^\n]+)/i);
      
      const updatedProjectData = { ...projectData };
      if (titleMatch && titleMatch[1] && !titleMatch[1].includes('Not specified')) {
        updatedProjectData.title = titleMatch[1].trim();
      }
      if (teamMatch) {
        updatedProjectData.teamMembers = parseInt(teamMatch[1]);
      }
      if (descMatch && descMatch[1] && !descMatch[1].includes('Not specified')) {
        updatedProjectData.description = descMatch[1].trim();
      }
      if (deadlineMatch && deadlineMatch[1] && !deadlineMatch[1].includes('Not set')) {
        updatedProjectData.deadline = deadlineMatch[1].trim();
      }
      
      setProjectData(updatedProjectData);
      
      const aiResponse: Message = {
        id: messages.length + 2,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

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
                <h1 className="text-xl font-semibold gradient-text">Project Analysis & Creation</h1>
                <p className="text-sm text-muted-foreground">AI-powered project planning and creation</p>
              </div>
            </div>
          </div>
          {(projectData.title || projectData.teamMembers) && (
            <div className="text-sm text-muted-foreground">
              Progress: {[projectData.title, projectData.teamMembers].filter(Boolean).length}/2 required fields
            </div>
          )}
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
              <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-accent text-accent-foreground"
                }`}>
                  {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <Card
                  className={`p-4 ${
                    message.sender === "user"
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
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
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
            </div>
          )}

          {isCreatingProject && (
            <div className="flex justify-center animate-fade-in">
              <Card className="glass-intense border border-accent/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-accent">Creating your project...</p>
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
              placeholder="Tell me about your project idea..."
              className="glass border-primary/30 focus:border-primary text-base py-6"
              disabled={isTyping || isCreatingProject}
            />
            <Button
              onClick={handleSend}
              variant="neon"
              size="lg"
              className="px-6"
              disabled={!inputMessage.trim() || isTyping || isCreatingProject}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            I'll help you create a project by asking a few questions. Just describe your idea!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewProject;
