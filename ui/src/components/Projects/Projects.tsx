import React, { useState } from 'react';
import { Project } from '@/store/slices/projectSlice';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CreateProject } from './CreateProject';
import { EditProject } from './EditProject';

export const Projects: React.FC = () => {
  const {
    projects,
    loading,
    error,
    filters,
    sort,
    setFilters,
    setSort,
    deleteProject,
  } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilters({ search: value });
  };

  const handleStatusFilter = (value: string) => {
    setFilters({ status: value === 'all' ? [] : [value] });
  };

  const handleSort = (value: string) => {
    const [field, order] = value.split('-');
    setSort(field as keyof Project, order as 'asc' | 'desc');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 dark:bg-green-900/200';
      case 'completed':
        return 'bg-blue-50 dark:bg-blue-900/200';
      case 'archived':
        return 'bg-gray-50 dark:bg-gray-9000';
      default:
        return 'bg-gray-50 dark:bg-gray-9000';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status.length === 0 || filters.status.includes(project.status);
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.some(tag => project.tags.includes(tag));
    
    return matchesSearch && matchesStatus && matchesTags;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <CreateProject />
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-sm"
        />
        
        <Select onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handleSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt-desc">Last Updated</SelectItem>
            <SelectItem value="createdAt-desc">Creation Date</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{project.description}</p>
              </div>
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p>Created {formatDistanceToNow(new Date(project.createdAt))} ago</p>
              <p>Last updated {formatDistanceToNow(new Date(project.updatedAt))} ago</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProject(project)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  Delete
                </Button>
              </div>
              <div className="text-sm">
                <span className="font-semibold">{project.stats.tasks}</span> tasks
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editingProject && (
        <EditProject
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
        />
      )}
    </div>
  );
};
