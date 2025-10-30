import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/utils/authCleanup";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectsManagement from "./pages/ProjectsManagement";
import NewProject from "./pages/NewProject";
import ProjectChat from "./pages/ProjectChat";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import { ChatPanel } from "./components/ChatPanel";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/AboutPage" />} />
          <Route path="/AboutPage" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/Dashboard/ProjectsManagement" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/ProjectDetails" element={<ProtectedRoute><ProjectsManagement /></ProtectedRoute>} />
          <Route path="/ProjectsManagement/ProjectAnalysis" element={<ProtectedRoute><NewProject /></ProtectedRoute>} />
          <Route path="/projects/chat" element={<ProtectedRoute><ProjectChat /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatPanel />
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
