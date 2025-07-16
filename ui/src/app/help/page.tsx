import { Breadcrumb } from '@/components/Breadcrumb';
import {
  Search,
  PlayCircle,
  Book,
  FileText,
  ArrowRight,
  MessageSquare,
  Code,
  Compass,
} from 'lucide-react';

const mockGuides = [
  {
    id: '1',
    title: 'Getting Started with Sirsi Nexus',
    description: 'Learn the basics of cloud migration with our platform',
    duration: '10 min',
    type: 'video',
    icon: Compass,
  },
  {
    id: '2',
    title: 'AWS to Azure Migration',
    description: 'Step-by-step guide for cross-cloud migration',
    duration: '15 min',
    type: 'article',
    icon: FileText,
  },
  {
    id: '3',
    title: 'Database Migration Best Practices',
    description: 'Learn how to migrate databases efficiently',
    duration: '20 min',
    type: 'video',
    icon: Book,
  },
  {
    id: '4',
    title: 'Infrastructure as Code Templates',
    description: 'Using Terraform and Bicep for migrations',
    duration: '25 min',
    type: 'tutorial',
    icon: Code,
  },
];

const mockPopularTopics = [
  'Getting Started',
  'Security Best Practices',
  'Cost Optimization',
  'Performance Tuning',
  'Troubleshooting',
  'API Documentation',
];

const mockQuickLinks = [
  {
    name: 'Documentation',
    description: 'Browse our comprehensive docs',
    icon: Book,
  },
  {
    name: 'Video Tutorials',
    description: 'Watch step-by-step guides',
    icon: PlayCircle,
  },
  {
    name: 'Community Forum',
    description: 'Connect with other users',
    icon: MessageSquare,
  },
  {
    name: 'API Reference',
    description: 'Integrate with our platform',
    icon: Code,
  },
];

export default function HelpPage() {
  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Help & Support
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find guides, tutorials, and documentation
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documentation..."
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 pl-12 pr-4 focus:border-sirsi-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockQuickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <div
              key={link.name}
              className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-sirsi-500 dark:hover:border-sirsi-400"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sirsi-100 text-sirsi-600 group-hover:bg-sirsi-500 group-hover:text-white dark:bg-sirsi-900 dark:text-sirsi-400 dark:group-hover:bg-sirsi-500 dark:group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                {link.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {link.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Popular Topics */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Popular Topics
        </h2>
        <div className="flex flex-wrap gap-2">
          {mockPopularTopics.map((topic) => (
            <button
              key={topic}
              className="rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Guides */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Featured Guides
          </h2>
          <button className="flex items-center text-sm text-sirsi-600 hover:text-sirsi-700 dark:text-sirsi-400 dark:hover:text-sirsi-300">
            View Library
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mockGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <div
                key={guide.id}
                className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-sirsi-500 dark:hover:border-sirsi-400"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`rounded-lg p-2 ${
                      guide.type === 'video'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                        : guide.type === 'article'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {guide.duration}
                  </span>
                </div>
                <h3 className="mb-1 font-medium text-gray-900 dark:text-gray-100 group-hover:text-sirsi-500 dark:text-gray-100 dark:group-hover:text-sirsi-400">
                  {guide.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {guide.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
