import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/projectService";
import { toast } from "sonner";
import { ArrowLeft, FolderKanban } from "lucide-react";

const ProjectsManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamMembers, setTeamMembers] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if form is valid (title and team size are required)
  const isFormValid = title.trim().length > 0 && teamMembers >= 1;
  
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error("Please fill in the required fields");
      return;
    }

    if (!user) {
      console.error('No user found:', user);
      toast.error("You must be logged in to create a project");
      return;
    }

    console.log('User authenticated:', user);

    try {
      setLoading(true);
      
      console.log('Creating project with user:', user);
      
      const projectData = {
        userId: user._id,
        title: title.trim(),
        description: description.trim() || "No description provided",
        teamMembers,
        deadline: deadline || null
      };

      console.log('Project data:', projectData);

      const newProject = await projectService.createProject(projectData);
      console.log('Project created successfully:', newProject);
      
      toast.success("Project created successfully!");
      
      // Store the new project data in sessionStorage for the AI to access
      sessionStorage.setItem('newProjectData', JSON.stringify({
        title: newProject.title,
        description: newProject.description,
        teamMembers: newProject.teamMembers,
        deadline: newProject.deadline,
        createdAt: new Date().toISOString()
      }));
      
      // Navigate to project analysis page
      navigate('/ProjectsManagement/ProjectAnalysis');
      
    } catch (error) {
      console.error('Detailed error creating project:', error);
      
      // More detailed error message
      let errorMessage = "Failed to create project. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Failed to create project: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/Dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg glow-primary">
              <FolderKanban className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Project Details</h1>
              <p className="text-muted-foreground">Enter your project details</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="glass-intense animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center gradient-text">
              Create New Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleCreateProject}>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg">
                  Project Title <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="title" 
                  placeholder="e.g., AI Dashboard Redesign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={`glass border-primary/30 focus:border-primary ${
                    title.trim().length === 0 ? "border-red-300 focus:border-red-500" : ""
                  }`}
                />
                {title.trim().length === 0 && (
                  <p className="text-sm text-red-500">Project title is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-lg">
                  Description <span className="text-sm text-muted-foreground">(Optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of your project (optional)"
                  className="min-h-[120px] glass border-primary/30 focus:border-primary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="teamMembers" className="text-lg">
                    Team Size <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="teamMembers" 
                    type="number"
                    min="1"
                    max="50"
                    placeholder="Enter team size"
                    value={teamMembers}
                    onChange={(e) => setTeamMembers(parseInt(e.target.value) || 1)}
                    required
                    className={`glass border-primary/30 focus:border-primary ${
                      teamMembers < 1 ? "border-red-300 focus:border-red-500" : ""
                    }`}
                  />
                  {teamMembers < 1 && (
                    <p className="text-sm text-red-500">Team size is required (minimum 1)</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-lg">
                    Deadline <span className="text-sm text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input 
                    id="deadline" 
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="glass border-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={() => navigate("/Dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="neon" 
                  size="lg"
                  disabled={!isFormValid || loading}
                  className={!isFormValid ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectsManagement;