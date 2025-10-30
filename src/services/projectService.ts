export interface Project {
  _id?: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold';
  teamMembers: number;
  deadline?: Date | null;
  progress: number;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class ProjectService {
  private apiUrl = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3001/api';

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string, limit?: number): Promise<Project[]> {
    try {
      const url = new URL(`${this.apiUrl}/projects/${userId}`);
      if (limit) {
        url.searchParams.append('limit', limit.toString());
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch projects');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      console.log('ProjectService: Making API call to:', `${this.apiUrl}/projects`);
      console.log('ProjectService: Sending data:', projectData);
      
      const res = await fetch(`${this.apiUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      console.log('ProjectService: Response status:', res.status);
      console.log('ProjectService: Response ok:', res.ok);

      const data = await res.json();
      console.log('ProjectService: Response data:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create project');
      }

      return data.data;
    } catch (error) {
      console.error('ProjectService: Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update a project
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const res = await fetch(`${this.apiUrl}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update project');
      }

      return data.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const res = await fetch(`${this.apiUrl}/projects/${projectId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Get recent projects (limited to 4 for dashboard)
   */
  async getRecentProjects(userId: string): Promise<Project[]> {
    return this.getUserProjects(userId, 4);
  }
}

export const projectService = new ProjectService();