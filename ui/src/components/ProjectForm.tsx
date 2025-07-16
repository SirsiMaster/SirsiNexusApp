import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cloud, Server, Database, AlertCircle } from 'lucide-react';

// Zod schema for form validation
const projectSchema = z.object({
  name: z.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(50, 'Project name must be less than 50 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  sourceType: z.enum(['aws', 'azure', 'gcp', 'vsphere'], {
    required_error: 'Please select a source platform',
  }),
  targetType: z.enum(['aws', 'azure', 'gcp'], {
    required_error: 'Please select a target platform',
  }),
  environmentType: z.enum(['development', 'staging', 'production'], {
    required_error: 'Please select an environment type',
  }),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
}

const platformOptions = [
  { value: 'aws', label: 'Amazon Web Services', icon: Cloud },
  { value: 'azure', label: 'Microsoft Azure', icon: Cloud },
  { value: 'gcp', label: 'Google Cloud Platform', icon: Cloud },
  { value: 'vsphere', label: 'VMware vSphere', icon: Server },
];

const environmentOptions = [
  { value: 'development', label: 'Development', icon: Database },
  { value: 'staging', label: 'Staging', icon: Database },
  { value: 'production', label: 'Production', icon: Database },
];

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const selectedSourceType = watch('sourceType');

  // Real-time AI tips based on form state
  const getAITip = () => {
    const tips: string[] = [];
    if (selectedSourceType === 'aws') {
      tips.push('Ensure you have appropriate IAM roles configured for cross-account access.');
    } else if (selectedSourceType === 'azure') {
      tips.push('Configure an App Registration with appropriate RBAC permissions.');
    } else if (selectedSourceType === 'gcp') {
      tips.push('Create a service account with necessary IAM roles.');
    } else if (selectedSourceType === 'vsphere') {
      tips.push('Ensure the vCenter account has required privileges for VM migration.');
    }
    return tips;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none focus:ring-1 focus:ring-sirsi-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none focus:ring-1 focus:ring-sirsi-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Source Platform */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source Platform</label>
        <select
          {...register('sourceType')}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-3 pr-10 shadow-sm focus:border-sirsi-500 focus:outline-none focus:ring-1 focus:ring-sirsi-500"
        >
          <option value="">Select source platform</option>
          {platformOptions.map((platform) => (
            <option key={platform.value} value={platform.value}>
              {platform.label}
            </option>
          ))}
        </select>
        {errors.sourceType && (
          <p className="mt-1 text-sm text-red-600">{errors.sourceType.message}</p>
        )}
      </div>

      {/* Target Platform */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Platform</label>
        <select
          {...register('targetType')}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-3 pr-10 shadow-sm focus:border-sirsi-500 focus:outline-none focus:ring-1 focus:ring-sirsi-500"
        >
          <option value="">Select target platform</option>
          {platformOptions
            .filter((p) => p.value !== 'vsphere') // vSphere can't be a target
            .map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
        </select>
        {errors.targetType && (
          <p className="mt-1 text-sm text-red-600">{errors.targetType.message}</p>
        )}
      </div>

      {/* Environment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Environment</label>
        <select
          {...register('environmentType')}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-3 pr-10 shadow-sm focus:border-sirsi-500 focus:outline-none focus:ring-1 focus:ring-sirsi-500"
        >
          <option value="">Select environment type</option>
          {environmentOptions.map((env) => (
            <option key={env.value} value={env.value}>
              {env.label}
            </option>
          ))}
        </select>
        {errors.environmentType && (
          <p className="mt-1 text-sm text-red-600">{errors.environmentType.message}</p>
        )}
      </div>

      {/* AI Tips */}
      {selectedSourceType && (
        <div className="rounded-lg bg-sirsi-50 p-4">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-sirsi-500" />
            <h4 className="font-medium text-sirsi-900">AI Assistant Tips</h4>
          </div>
          <ul className="mt-2 list-inside list-disc text-sm text-sirsi-700">
            {getAITip().map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 focus:outline-none focus:ring-2 focus:ring-sirsi-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Project...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};
