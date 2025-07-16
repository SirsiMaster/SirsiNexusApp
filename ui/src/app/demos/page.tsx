'use client';

import React, { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'framer-motion';
import {
  Play,
  Building2,
  Heart,
  GraduationCap,
  ArrowRight,
  DollarSign,
  Users,
  Database,
  Clock,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface BusinessEntity {
  id: string;
  name: string;
  industry: string;
  description: string;
  icon: React.ElementType;
  metrics: {
    monthlySpend: string;
    users: string;
    dataVolume: string;
    complexity: 'Low' | 'Medium' | 'High';
  };
  demoTypes: {
    migration: { available: boolean; duration: string; highlights: string[] };
    optimization: { available: boolean; duration: string; highlights: string[] };
    scaleUp: { available: boolean; duration: string; highlights: string[] };
  };
  color: string;
}

const businessEntities: BusinessEntity[] = [
  {
    id: 'tvfone',
    name: 'TVfone',
    industry: 'Media & Entertainment',
    description: 'Streaming platform seeking to modernize architecture for 10x scale with AI-powered recommendations and global content delivery.',
    icon: Play,
    metrics: {
      monthlySpend: '$47.6K',
      users: '450K',
      dataVolume: '45.7TB',
      complexity: 'Medium',
    },
    demoTypes: {
      migration: {
        available: true,
        duration: '15 min',
        highlights: ['Hybrid to multi-cloud migration', 'Global content delivery', 'Cost optimization'],
      },
      optimization: {
        available: true,
        duration: '12 min',
        highlights: ['CDN cost reduction', 'Auto-scaling efficiency', 'Database performance'],
      },
      scaleUp: {
        available: true,
        duration: '18 min',
        highlights: ['300% user growth', 'AI recommendations deployment', 'Voice integration'],
      },
    },
    color: 'sirsi',
  },
  {
    id: 'kulturio',
    name: 'Kulturio Skin Care',
    industry: 'Healthcare Technology',
    description: 'Healthcare provider transforming from brick-and-mortar to global clinic-as-network with AI-powered skin analysis.',
    icon: Heart,
    metrics: {
      monthlySpend: '$32.4K',
      users: '150K patients',
      dataVolume: '12.3TB',
      complexity: 'High',
    },
    demoTypes: {
      migration: {
        available: true,
        duration: '20 min',
        highlights: ['150K patient records migration', 'HIPAA compliance', 'Zero-downtime transition'],
      },
      optimization: {
        available: true,
        duration: '15 min',
        highlights: ['Image processing optimization', 'Compliance automation', 'Cost efficiency'],
      },
      scaleUp: {
        available: true,
        duration: '20 min',
        highlights: ['500% patient growth', 'Global telemedicine', 'AI diagnostics rollout'],
      },
    },
    color: 'green',
  },
  {
    id: 'uniedu',
    name: 'UniEdu Analytics',
    industry: 'Education Technology',
    description: 'University consultancy migrating student data to cloud while maintaining sovereignty and analytics capabilities.',
    icon: GraduationCap,
    metrics: {
      monthlySpend: '$24.6K',
      users: '385K records',
      dataVolume: '28.5TB',
      complexity: 'Medium',
    },
    demoTypes: {
      migration: {
        available: true,
        duration: '15 min',
        highlights: ['385K student records', 'Data sovereignty', 'Multi-system integration'],
      },
      optimization: {
        available: true,
        duration: '12 min',
        highlights: ['Query performance', 'Storage tiering', 'Analytics pipeline efficiency'],
      },
      scaleUp: {
        available: true,
        duration: '13 min',
        highlights: ['10% annual growth', 'Elastic infrastructure', 'ML-powered insights'],
      },
    },
    color: 'blue',
  },
];

type DemoType = 'migration' | 'optimization' | 'scaleUp';

const demoTypeConfig = {
  migration: {
    title: 'Migration Demo',
    description: 'Showcase complete migration from current to target infrastructure',
    icon: ArrowRight,
    color: 'blue',
  },
  optimization: {
    title: 'Optimization Demo',
    description: 'Demonstrate cost and performance optimization opportunities',
    icon: BarChart3,
    color: 'green',
  },
  scaleUp: {
    title: 'Scale-Up Demo',
    description: 'Show elastic growth accommodation and scaling strategies',
    icon: TrendingUp,
    color: 'purple',
  },
};

export default function DemosPage() {
  const [selectedEntity, setSelectedEntity] = useState<BusinessEntity | null>(null);
  const [selectedDemoType, setSelectedDemoType] = useState<DemoType | null>(null);

  const handleStartDemo = () => {
    if (selectedEntity && selectedDemoType) {
      // Store demo context for resource generation
      localStorage.setItem('selectedEntity', selectedEntity.id);
      localStorage.setItem('selectedJourney', selectedDemoType);
      console.log('Starting demo:', { entity: selectedEntity.id, type: selectedDemoType });
      
      // Route to the appropriate wizard based on demo type
      let wizardPath = '/migration'; // Default to migration wizard
      
      switch (selectedDemoType) {
        case 'migration':
          wizardPath = '/migration';
          break;
        case 'optimization':
          wizardPath = '/optimization';
          break;
        case 'scaleUp':
          wizardPath = '/scaling';
          break;
      }
      
      window.location.href = `${wizardPath}?entity=${selectedEntity.id}&demo=${selectedDemoType}`;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'High': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Demo Scenarios
        </h1>
        <p className="text-slate-700 dark:text-slate-300 font-medium">
          Choose a business entity and demo type to experience Sirsi Nexus capabilities
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Business Entity Selection */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Select Business Entity
          </h2>
          <div className="space-y-4">
            {businessEntities.map((entity) => {
              const Icon = entity.icon;
              const isSelected = selectedEntity?.id === entity.id;
              
              return (
                <motion.div
                  key={entity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`cursor-pointer rounded-lg border p-6 transition-all ${
                    isSelected
                      ? 'border-sirsi-500 bg-sirsi-50 dark:bg-sirsi-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-sirsi-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedEntity(entity)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg p-3 ${
                      isSelected ? 'bg-sirsi-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {entity.name}
                        </h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getComplexityColor(entity.metrics.complexity)}`}>
                          {entity.metrics.complexity}
                        </span>
                      </div>
                      
                      <p className="mb-3 text-sm font-medium text-sirsi-600 dark:text-sirsi-400">
                        {entity.industry}
                      </p>
                      
                      <p className="mb-4 text-sm text-slate-800 dark:text-slate-200 font-medium">
                        {entity.description}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{entity.metrics.monthlySpend}/mo</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{entity.metrics.users}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Database className="h-4 w-4 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{entity.metrics.dataVolume}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Demo Type Selection */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Select Demo Type
          </h2>
          
          {!selectedEntity ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              <p className="mt-2 text-sm text-slate-800 dark:text-slate-200 font-medium">
                Select a business entity first to see available demo types
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(selectedEntity.demoTypes).map(([type, config]) => {
                if (!config.available) return null;
                
                const demoConfig = demoTypeConfig[type as DemoType];
                const DemoIcon = demoConfig.icon;
                const isSelected = selectedDemoType === type;
                
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`cursor-pointer rounded-lg border p-6 transition-all ${
                      isSelected
                        ? 'border-sirsi-500 bg-sirsi-50 dark:bg-sirsi-900/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-sirsi-200 dark:border-gray-700'
                    }`}
                    onClick={() => setSelectedDemoType(type as DemoType)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-3 ${
                        isSelected ? 'bg-sirsi-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        <DemoIcon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {demoConfig.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
                            <Clock className="h-4 w-4" />
                            {config.duration}
                          </div>
                        </div>
                        
                        <p className="mb-3 text-sm text-slate-800 dark:text-slate-200 font-medium">
                          {demoConfig.description}
                        </p>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Key Highlights:
                          </p>
                          <ul className="space-y-1">
                            {config.highlights.map((highlight, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 font-medium">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Start Demo Button */}
      {selectedEntity && selectedDemoType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-lg border border-sirsi-200 bg-sirsi-50 p-6 dark:border-sirsi-800 dark:bg-sirsi-900/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Ready to Start Demo
              </h3>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                {demoTypeConfig[selectedDemoType].title} for {selectedEntity.name}
              </p>
            </div>
            <button
              onClick={handleStartDemo}
              className="flex items-center gap-2 rounded-lg bg-sirsi-500 px-6 py-3 text-white transition-colors hover:bg-sirsi-600"
            >
              <Zap className="h-5 w-5" />
              Start Demo
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
