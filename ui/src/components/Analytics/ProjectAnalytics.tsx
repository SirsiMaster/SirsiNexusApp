'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Icons } from '@/components/icons';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const ProjectAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    projects: {
      total: number;
      active: number;
      completed: number;
      archived: number;
    };
    tasks: {
      total: number;
      completed: number;
      inProgress: number;
      blockers: number;
    };
    trends: {
      projects: Array<{ date: string; count: number }>;
      tasks: Array<{ date: string; count: number }>;
    };
  } | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const analyticsData = await response.json();
        setData(analyticsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const taskCompletionRate = data.tasks.total > 0
    ? Math.round((data.tasks.completed / data.tasks.total) * 100)
    : 0;

  // Data for project status distribution
  const projectStatusData = [
    { name: 'Active', value: data.projects.active },
    { name: 'Completed', value: data.projects.completed },
    { name: 'Archived', value: data.projects.archived },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Project Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of project and task performance</p>
        </div>
        <Button>
          <Icons.download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.projects.total}</div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">
              Active: {data.projects.active} | Completed: {data.projects.completed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{taskCompletionRate}%</div>
            <Progress value={taskCompletionRate} className="mt-2" />
            <div className="text-gray-600 dark:text-gray-400 mt-2">
              {data.tasks.completed} of {data.tasks.total} tasks completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.tasks.inProgress}</div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">
              {data.tasks.blockers} tasks blocked
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((data.projects.active / data.projects.total) * 100)}%
            </div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">
              Projects on track
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trends.projects}>
                  <defs>
                    <linearGradient id="projectGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="projects"
                    stroke="#0088FE"
                    fillOpacity={1}
                    fill="url(#projectGrowth)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trends.tasks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    stroke="#00C49F"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
