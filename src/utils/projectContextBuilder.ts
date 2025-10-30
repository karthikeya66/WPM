import { Project } from "@/services/projectService";

export interface ProjectContextData {
  newProjectContext: string;
  selectedProjectContext: string;
  projectContext: string;
}

export const buildProjectContext = (
  userProjects: Project[],
  sessionStorage: Storage
): ProjectContextData => {
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

  return {
    newProjectContext,
    selectedProjectContext,
    projectContext
  };
};

export const buildGeminiPrompt = (
  contextData: ProjectContextData,
  userMessageText: string
): string => {
  const { newProjectContext, selectedProjectContext, projectContext } = contextData;
  
  return `You are an expert Project Analysis and Planning Consultant for Project Catalyst - a comprehensive project management platform. Your role is to help users create detailed project workflows by gathering comprehensive information.

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

User message: ${userMessageText}`;
};