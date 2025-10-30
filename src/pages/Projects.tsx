import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { projectService, Project } from "@/services/projectService";
import { toast } from "sonner";
import { 
  FolderKanban, 
  Plus, 
  Search,
  Users,
  Calendar,
  MoreVertical
} from "lucide-react";

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user._id) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const userProjects = await projectService.getUserProjects(user!._id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-primary/20 text-primary border-primary/30";
      case "completed":
        return "bg-accent/20 text-accent border-accent/30";
      case "on-hold":
        return "bg-secondary/20 text-secondary border-secondary/30";
      default:
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold gradient-text">Projects</h1>
              <p className="text-muted-foreground">Manage and track all your projects</p>
            </div>
          </div>
          <Button variant="neon" size="lg" onClick={() => navigate('/ProjectDetails')}>
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="glass-intense p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-primary" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass border-primary/30 focus:border-primary"
            />
          </div>
        </Card>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="glass-intense p-6 neon-border">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="h-2 bg-muted rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <Card
                key={project._id}
                className="glass-intense p-6 neon-border hover-scale cursor-pointer animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                onClick={() => {
                  // Store project data for the chat context
                  sessionStorage.setItem('selectedProjectData', JSON.stringify(project));
                  // Navigate to project chat
                  navigate('/projects/chat');
                }}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description || 'No description provided'}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        // Add menu functionality here if needed
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Status Badge */}
                  <Badge className={`${getStatusColor(project.status)} border`}>
                    {project.status.replace("-", " ")}
                  </Badge>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{project.teamMembers}</span>
                    </div>
                    {project.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-muted-foreground">
                    Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-intense p-12 text-center">
            <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search or create a new project' : 'Create your first project to get started'}
            </p>
            <Button onClick={() => navigate('/ProjectDetails')} variant="neon">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Card>
        )}


      </div>
    </div>
  );
};

export default Projects;
