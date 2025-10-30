import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, Sparkles, Zap, Target } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-2xl glow-primary animate-glow-pulse">
              <Rocket className="w-16 h-16 text-background" />
            </div>
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold gradient-text">
              Project Catalyst
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
              AI-Powered Project Management
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Transform your workflow with intelligent task automation, real-time collaboration, 
              and AI-driven insights that accelerate your projects.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button 
              variant="neon" 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 h-auto"
            >
              Get Started
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="glass" 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
            >
              View Demo
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Card className="glass-intense p-6 neon-border hover-scale">
              <div className="p-3 bg-primary/20 rounded-lg w-fit mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                Leverage AI to automate task breakdown, suggest optimizations, and predict project timelines.
              </p>
            </Card>

            <Card className="glass-intense p-6 neon-border hover-scale">
              <div className="p-3 bg-accent/20 rounded-lg w-fit mb-4">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Planning</h3>
              <p className="text-muted-foreground">
                Intelligent project planning with automated task dependencies and resource allocation.
              </p>
            </Card>

            <Card className="glass-intense p-6 neon-border hover-scale">
              <div className="p-3 bg-secondary/20 rounded-lg w-fit mb-4">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Insights</h3>
              <p className="text-muted-foreground">
                Get instant analytics and actionable insights to keep your projects on track.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
