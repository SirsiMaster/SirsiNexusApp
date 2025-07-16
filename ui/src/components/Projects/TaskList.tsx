import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CreateTaskDialog } from './CreateTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { Icons } from '@/components/icons';
import { Task } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface TaskListProps {
  projectId: string;
}

export const TaskList: React.FC<TaskListProps> = ({ projectId }) => {
  const { tasks, loading, error, deleteTask } = useTasks(projectId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-50 dark:bg-gray-9000';
      case 'in_progress':
        return 'bg-blue-50 dark:bg-blue-900/200';
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/200';
      case 'blocked':
        return 'bg-red-50 dark:bg-red-900/200';
      default:
        return 'bg-gray-50 dark:bg-gray-9000';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-50 dark:bg-gray-9000';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/200';
      case 'high':
        return 'bg-orange-500';
      case 'urgent':
        return 'bg-red-50 dark:bg-red-900/200';
      default:
        return 'bg-gray-50 dark:bg-gray-9000';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Icons.plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    {task.dueDate && (
                      <Badge variant="outline">
                        Due {formatDistanceToNow(new Date(task.dueDate))}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTask(task)}
                  >
                    <Icons.edit className="h-4 w-4" />
                    <span className="sr-only">Edit task</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Icons.trash className="h-4 w-4" />
                    <span className="sr-only">Delete task</span>
                  </Button>
                </div>
              </div>
              {task.assignee && (
                <div className="mt-4 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.image} />
                    <AvatarFallback>
                      {task.assignee.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {task.assignee.name}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateTaskDialog
        projectId={projectId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </div>
  );
};
