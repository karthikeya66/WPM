import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { projectService, Project } from "@/services/projectService";
import { toast } from "sonner";
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Plus,
  LayoutDashboard
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Total Projects", value: 0, icon: FolderKanban, color: "primary" },
    { label: "Completed Tasks", value: 0, icon: CheckCircle2, color: "accent" },
    { label: "In Progress", value: 0, icon: Clock, color: "secondary" },
    { label: "This Week", value: 0, icon: TrendingUp, color: "primary" },
  ]);

  useEffect(() => {
    if (user) {
      loadRecentProjects();
    }
  }, [user]);

  const loadRecentProjects = async () => {
    try {
      setLoading(true);
      
      // Get all projects for accurate statistics
      const allProjects = await projectService.getUserProjects(user!._id);
      
      // Get recent projects for display (limit to 4)
      const recentProjects = await projectService.getRecentProjects(user!._id);
      setRecentProjects(recentProjects);
      
      // Update stats based on ALL projects data
      const totalProjects = allProjects.length;
      const completedProjects = allProjects.filter(p => p.status === 'completed').length;
      const inProgressProjects = allProjects.filter(p => p.status === 'active').length;
      
      setStats([
        { label: "Total Projects", value: totalProjects, icon: FolderKanban, color: "primary" },
        { label: "Completed", value: completedProjects, icon: CheckCircle2, color: "accent" },
        { label: "In Progress", value: inProgressProjects, icon: Clock, color: "secondary" },
        { label: "This Week", value: allProjects.filter(p => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(p.createdAt!) > weekAgo;
        }).length, icon: TrendingUp, color: "primary" },
      ]);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load recent projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Welcome back! Here's your project overview.</p>
          </div>
          <Button variant="neon" size="lg" onClick={() => navigate('/ProjectDetails')}>
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {stats.map((stat, index) => (
            <Card 
              key={stat.label} 
              className="glass-intense p-6 hover-scale neon-border cursor-pointer"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">Last 30 days</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Recent Projects</h2>
            <Button variant="ghost" className="text-primary" onClick={() => navigate('/Dashboard/ProjectsManagement')}>View All →</Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="glass-intense p-6 neon-border">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentProjects.map((project, index) => (
                <Card 
                  key={project._id}
                  className="glass-intense p-6 neon-border hover-scale cursor-pointer"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  onClick={() => {
                    // Store project data for the chat context
                    sessionStorage.setItem('selectedProjectData', JSON.stringify(project));
                    // Navigate to project chat
                    navigate('/projects/chat');
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.teamMembers} team member{project.teamMembers !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {new Date(project.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        project.status === 'completed' 
                          ? 'bg-accent/20 text-accent' 
                          : project.status === 'on-hold'
                          ? 'bg-secondary/20 text-secondary'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
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
                    
                    <div className="text-xs text-muted-foreground">
                      <p className="truncate">{project.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-intense p-8 text-center">
              <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to get started with project management.
              </p>
              <Button onClick={() => navigate('/ProjectDetails')} variant="neon">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="glass-intense p-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <h2 className="text-2xl font-bold mb-6 gradient-text">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="glass" size="lg" className="h-auto py-6 flex-col gap-2" onClick={() => navigate('/ProjectDetails')}>
              <FolderKanban className="w-8 h-8 text-primary" />
              <span>Create Project</span>
            </Button>
            <Button variant="glass" size="lg" className="h-auto py-6 flex-col gap-2">
              <CheckCircle2 className="w-8 h-8 text-accent" />
              <span>Add Task</span>
            </Button>
            <Button variant="glass" size="lg" className="h-auto py-6 flex-col gap-2">
              <Clock className="w-8 h-8 text-secondary" />
              <span>View Timeline</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
