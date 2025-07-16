import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  Project,
  setProjects,
  addProject,
  updateProject,
  deleteProject as deleteProjectAction,
  setLoading,
  setError,
  updateFilters,
  updateSort,
  addTeamMember as addTeamMemberAction,
  removeTeamMember as removeTeamMemberAction,
  updateProjectStats,
} from '@/store/slices/projectSlice';
import { projectsApi } from '@/lib/api/projects';
import { useToast } from '@/hooks/useToast';

export const useProjects = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const {
    projects,
    currentProject,
    loading,
    error,
    filters,
    sort,
  } = useSelector((state: RootState) => state.projects);

  const fetchProjects = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await projectsApi.list();
      
      if (response.success) {
        dispatch(setProjects(response.data));
        dispatch(setError(null));
      } else {
        const errorMsg = 'Failed to fetch projects';
        dispatch(setError(errorMsg));
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch projects';
      dispatch(setError(error));
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, toast]); // Include toast in dependencies

  const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch(setLoading(true));
      const response = await projectsApi.create(project);
      
      if (response.success) {
        dispatch(addProject(response.data));
        dispatch(setError(null));
        toast({
          title: 'Success',
          description: 'Project created successfully',
        });
        return response.data;
      } else {
        const errorMsg = 'Failed to create project';
        dispatch(setError(errorMsg));
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        return null;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create project';
      dispatch(setError(error));
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateProjectDetails = async (id: string, updates: Partial<Project>) => {
    try {
      dispatch(setLoading(true));
      const response = await projectsApi.update(id, updates);
      
      if (response.success) {
        dispatch(updateProject(response.data));
        dispatch(setError(null));
        toast({
          title: 'Success',
          description: 'Project updated successfully',
        });
        return response.data;
      } else {
        const errorMsg = 'Failed to update project';
        dispatch(setError(errorMsg));
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        return null;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update project';
      dispatch(setError(error));
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteProject = async (id: string) => {
    try {
      dispatch(setLoading(true));
      const response = await projectsApi.delete(id);
      
      if (response.success) {
        dispatch(deleteProjectAction(id));
        dispatch(setError(null));
        toast({
          title: 'Success',
          description: 'Project deleted successfully',
        });
        return true;
      } else {
        const errorMsg = 'Failed to delete project';
        dispatch(setError(errorMsg));
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete project';
      dispatch(setError(error));
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const addTeamMember = async (projectId: string, memberId: string, role: 'admin' | 'member') => {
    try {
      dispatch(setLoading(true));
      const response = await projectsApi.addTeamMember(projectId, memberId, role);
      
      if (response.success) {
        const member = { id: memberId, name: 'New Member', role };
        dispatch(addTeamMemberAction({ projectId, member }));
        dispatch(setError(null));
        toast({
          title: 'Success',
          description: 'Team member added successfully',
        });
        return true;
      } else {
        const errorMsg = 'Failed to add team member';
        dispatch(setError(errorMsg));
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to add team member';
      dispatch(setError(error));
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const removeTeamMember = async (projectId: string, memberId: string) => {
    try {
      dispatch(setLoading(true));
      const response = await projectsApi.removeTeamMember(projectId, memberId);
      
      if (response.success) {
        dispatch(removeTeamMemberAction({ projectId, memberId }));
        dispatch(setError(null));
        toast({
          title: 'Success',
          description: 'Team member removed successfully',
        });
        return true;
      } else {
        const errorMsg = 'Failed to remove team member';
        dispatch(setError(errorMsg));
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to remove team member';
      dispatch(setError(error));
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateStats = async (projectId: string, stats: Project['stats']) => {
    try {
      dispatch(setLoading(true));
      const response = await projectsApi.update(projectId, { stats });
      
      if (response.success) {
        dispatch(updateProjectStats({ projectId, stats }));
        dispatch(setError(null));
        return true;
      } else {
        const errorMsg = 'Failed to update project stats';
        dispatch(setError(errorMsg));
        return false;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update project stats';
      dispatch(setError(error));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const setFilters = (newFilters: Partial<typeof filters>) => {
    dispatch(updateFilters(newFilters));
  };

  const setSort = (field: keyof Project, order: 'asc' | 'desc') => {
    dispatch(updateSort({ field, order }));
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // Include fetchProjects in dependencies

  return {
    projects,
    currentProject,
    loading,
    error,
    filters,
    sort,
    createProject,
    updateProjectDetails,
    deleteProject,
    addTeamMember,
    removeTeamMember,
    updateStats,
    setFilters,
    setSort,
    refetch: fetchProjects,
  };
};
