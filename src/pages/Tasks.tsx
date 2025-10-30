import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckSquare, 
  Plus, 
  Search,
  AlertCircle,
  Clock,
  Flag
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  projectName: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  deadline: string;
  assignee: string;
}

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Design new dashboard layout",
      projectName: "AI Dashboard Redesign",
      priority: "high",
      status: "in-progress",
      deadline: "2024-10-25",
      assignee: "Sarah Chen",
    },
    {
      id: 2,
      title: "Implement user authentication",
      projectName: "Mobile App Development",
      priority: "high",
      status: "in-progress",
      deadline: "2024-10-20",
      assignee: "John Doe",
    },
    {
      id: 3,
      title: "Write API documentation",
      projectName: "Backend API Migration",
      priority: "medium",
      status: "completed",
      deadline: "2024-10-15",
      assignee: "Mike Wilson",
    },
    {
      id: 4,
      title: "Create social media content",
      projectName: "Marketing Campaign Q4",
      priority: "medium",
      status: "todo",
      deadline: "2024-11-01",
      assignee: "Emma Johnson",
    },
    {
      id: 5,
      title: "Fix responsive design issues",
      projectName: "Customer Portal",
      priority: "low",
      status: "todo",
      deadline: "2024-11-05",
      assignee: "Alex Martinez",
    },
    {
      id: 6,
      title: "Security vulnerability assessment",
      projectName: "Security Audit",
      priority: "high",
      status: "todo",
      deadline: "2024-10-30",
      assignee: "David Kim",
    },
  ]);

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-secondary";
      case "low":
        return "text-primary";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-accent/20 text-accent border-accent/30";
      case "in-progress":
        return "bg-primary/20 text-primary border-primary/30";
      case "todo":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === "completed" ? "todo" : "completed" as Task["status"] }
        : task
    ));
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold gradient-text">Tasks</h1>
              <p className="text-muted-foreground">Organize and track your tasks</p>
            </div>
          </div>
          <Button variant="neon" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Task
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="glass-intense p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-primary" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass border-primary/30 focus:border-primary"
            />
          </div>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <Card
              key={task.id}
              className="glass-intense p-6 neon-border hover-scale cursor-pointer animate-fade-in"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => toggleTaskStatus(task.id)}
                  className="mt-1"
                />

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${task.status === "completed" ? "line-through opacity-60" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.projectName}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(task.status)} border`}>
                      {task.status.replace("-", " ")}
                    </Badge>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                      <span className={getPriorityColor(task.priority)}>
                        {task.priority} priority
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-accent" />
                      <span>{task.assignee}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <Card className="glass-intense p-12 text-center">
            <CheckSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or create a new task
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tasks;
