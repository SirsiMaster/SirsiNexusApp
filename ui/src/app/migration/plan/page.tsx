'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  Server,
  Database,
  Network,
  Shield
} from 'lucide-react';

export default function MigrationPlanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:to-gray-800 dark:from-gray-900 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            Migration Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your customized migration plan based on discovered resources and requirements
          </p>
        </div>

        {/* Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">24</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total resources to migrate</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">3-5 days</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Estimated completion</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Complexity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">Medium</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall complexity rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Migration Phases */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Migration Phases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  phase: 1,
                  title: "Infrastructure Setup",
                  status: "completed",
                  description: "Set up target environment and networking",
                  icon: Network,
                  items: ["VPC Configuration", "Security Groups", "Load Balancers"]
                },
                {
                  phase: 2,
                  title: "Database Migration",
                  status: "in-progress",
                  description: "Migrate databases with minimal downtime",
                  icon: Database,
                  items: ["Schema Migration", "Data Transfer", "Validation"]
                },
                {
                  phase: 3,
                  title: "Application Migration",
                  status: "pending",
                  description: "Migrate application servers and services",
                  icon: Server,
                  items: ["Application Servers", "Microservices", "Configuration"]
                },
                {
                  phase: 4,
                  title: "Security & Compliance",
                  status: "pending",
                  description: "Apply security policies and compliance checks",
                  icon: Shield,
                  items: ["Security Policies", "Compliance Audit", "Access Control"]
                }
              ].map((phase) => (
                <div key={phase.phase} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      phase.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900' :
                      phase.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900' :
                      'bg-gray-100 dark:bg-gray-800 dark:bg-gray-600'
                    }`}>
                      <phase.icon className={`h-5 w-5 ${
                        phase.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                        phase.status === 'in-progress' ? 'text-blue-600 dark:text-blue-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Phase {phase.phase}: {phase.title}
                      </h3>
                      <Badge 
                        variant={
                          phase.status === 'completed' ? 'default' :
                          phase.status === 'in-progress' ? 'secondary' :
                          'outline'
                        }
                        className={
                          phase.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                          phase.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }
                      >
                        {phase.status === 'completed' ? 'Completed' :
                         phase.status === 'in-progress' ? 'In Progress' :
                         'Pending'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{phase.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.items.map((item) => (
                        <span 
                          key={item}
                          className="px-2 py-1 bg-white dark:bg-gray-800 dark:bg-gray-600 border border-gray-200 dark:border-gray-700 dark:border-gray-500 rounded text-sm text-gray-700 dark:text-gray-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
            Back to Discovery
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-50 dark:bg-emerald-900/200 dark:hover:bg-emerald-600">
            Start Migration
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
