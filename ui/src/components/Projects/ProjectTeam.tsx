import React, { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddTeamMemberDialog } from './AddTeamMemberDialog';
import { Icons } from '@/components/icons';

interface ProjectTeamProps {
  projectId: string;
}

export const ProjectTeam: React.FC<ProjectTeamProps> = ({ projectId }) => {
  const { projects, removeTeamMember } = useProjects();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      await removeTeamMember(projectId, memberId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <Button onClick={() => setIsAddMemberOpen(true)}>
          <Icons.plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.team?.map(member => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {member.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                  </div>
                </div>

                {member.role !== 'admin' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Icons.more className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Icons.trash className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddTeamMemberDialog
        projectId={projectId}
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
      />
    </div>
  );
};
