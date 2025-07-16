'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/store/slices/projectSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EditProject } from './EditProject';
import { ProjectTeam } from './ProjectTeam';
import { TaskList } from './TaskList';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { formatDistanceToNow, format } from 'date-fns';

interface ProjectDetailProps {
  id: string;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ id }) => {
  const router = useRouter();
  const { projects, loading, error, deleteProject } = useProjects();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const project = projects.find(p => p.id === id);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const success = await deleteProject(id);
      if (success) {
        router.push('/projects');
      }
    }
  };

  const completionPercentage = 
    project.stats.tasks > 0
      ? (project.stats.completed / project.stats.tasks) * 100
      : 0;

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
          <div className="flex items-center gap-4 mb-4">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <div className="flex items-center gap-2">
              {project.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Project
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={completionPercentage} />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.stats.completed} of {project.stats.tasks} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Tasks</span>
                <span>{project.stats.pending}</span>
              </div>
              <div className="flex justify-between">
                <span>Blockers</span>
                <span>{project.stats.blocked}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex -space-x-2">
              {project.team?.slice(0, 5).map(member => (
                <Avatar key={member.id}>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {member.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )) || (
                <p className="text-sm text-gray-500 dark:text-gray-400">No team members yet</p>
              )}
              {(project.team?.length || 0) > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                  +{(project.team?.length || 0) - 5}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TaskList projectId={id} />
        </TabsContent>

        <TabsContent value="team">
          <ProjectTeam projectId={id} />
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Created</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(project.createdAt), 'PPP')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(project.createdAt))} ago
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Last Updated</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(project.updatedAt), 'PPP')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(project.updatedAt))} ago
                  </p>
                </div>
                <Calendar
                  mode="single"
                  selected={new Date(project.updatedAt)}
                  className="rounded-md border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditProject
        project={project}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
};
