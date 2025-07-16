import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  team?: Array<{
    id: string;
    name: string;
    role: 'admin' | 'member';
    avatar?: string;
  }>;
  settings?: {
    visibility: 'public' | 'private';
    allowComments: boolean;
    notifications: boolean;
  };
  tags: string[];
  stats: {
    tasks: number;
    completed: number;
    pending: number;
    blocked: number;
  };
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string[];
    tags: string[];
    search: string;
  };
  sort: {
    field: keyof Project;
    order: 'asc' | 'desc';
  };
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  filters: {
    status: [],
    tags: [],
    search: '',
  },
  sort: {
    field: 'updatedAt',
    order: 'desc',
  },
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<ProjectState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateSort: (state, action: PayloadAction<ProjectState['sort']>) => {
      state.sort = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<Partial<Project> & { id: string }>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...action.payload };
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = { ...state.currentProject, ...action.payload };
        }
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    },
    addTeamMember: (state, action: PayloadAction<{ projectId: string; member: NonNullable<Project['team']>[0] }>) => {
      const project = state.projects.find((p) => p.id === action.payload.projectId);
      if (project) {
        project.team = project.team || [];
        project.team.push(action.payload.member);
        if (state.currentProject?.id === action.payload.projectId) {
          state.currentProject.team = state.currentProject.team || [];
          state.currentProject.team.push(action.payload.member);
        }
      }
    },
    removeTeamMember: (state, action: PayloadAction<{ projectId: string; memberId: string }>) => {
      const project = state.projects.find((p) => p.id === action.payload.projectId);
      if (project && project.team) {
        project.team = project.team.filter((m) => m.id !== action.payload.memberId);
        if (state.currentProject?.id === action.payload.projectId && state.currentProject.team) {
          state.currentProject.team = state.currentProject.team.filter(
            (m) => m.id !== action.payload.memberId
          );
        }
      }
    },
    updateProjectStats: (state, action: PayloadAction<{ projectId: string; stats: Project['stats'] }>) => {
      const project = state.projects.find((p) => p.id === action.payload.projectId);
      if (project) {
        project.stats = action.payload.stats;
        if (state.currentProject?.id === action.payload.projectId) {
          state.currentProject.stats = action.payload.stats;
        }
      }
    },
  },
});

export const {
  setProjects,
  setCurrentProject,
  clearCurrentProject,
  setLoading,
  setError,
  updateFilters,
  resetFilters,
  updateSort,
  addProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  updateProjectStats,
} = projectSlice.actions;

export default projectSlice.reducer;
