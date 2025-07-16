'use client';

import React, { useState } from 'react';
import { Brain, Sparkles, Settings, Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AIEnhancedInput from '@/components/ai-assistant/AIEnhancedInput';
import { useAIContext } from '@/contexts/AIContextProvider';

export default function AIDemoPage() {
  const { isAIEnabled, toggleAI, setFeatureContext } = useAIContext();
  const [formData, setFormData] = useState({
    serviceName: '',
    cpu: 2,
    memory: 4,
    timeout: 30,
    description: '',
    environment: 'production',
    scalingPolicy: 'auto'
  });

  // Set AI context for this page
  React.useEffect(() => {
    setFeatureContext('ai-demo', 'form-demo');
  }, [setFeatureContext]);

  const handleInputChange = (field: string) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const cpuSuggestions = ['1', '2', '4', '8', '16'];
  const memorySuggestions = ['2GB', '4GB', '8GB', '16GB', '32GB'];
  const environmentSuggestions = ['development', 'staging', 'production'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-900 dark:to-gray-800 to-slate-100 dark:from-gray-900 dark:to-gray-800 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-50 dark:from-gray-900 dark:to-gray-8000 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI-Enhanced Interface Demo
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience Warp-like AI assistance integrated throughout every form field and interface element
            </p>
            
            {/* AI Status Toggle */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">AI Assistant:</span>
                <button
                  onClick={toggleAI}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all ${
                    isAIEnabled 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isAIEnabled ? 'bg-green-50 dark:bg-green-900/200' : 'bg-gray-400'}`} />
                  {isAIEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              {isAIEnabled && (
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Context-aware assistance active
                </Badge>
              )}
            </div>
          </div>

          {/* Demo Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Service Configuration
              </CardTitle>
              <CardDescription>
                Configure a new service with AI-powered assistance on every field
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Service Name */}
                <AIEnhancedInput
                  name="serviceName"
                  label="Service Name"
                  value={formData.serviceName}
                  onChange={handleInputChange('serviceName')}
                  placeholder="my-awesome-service"
                  description="A unique identifier for your service"
                  required
                  validation={{
                    pattern: /^[a-z0-9-]+$/,
                    min: 3,
                    max: 50
                  }}
                  aiEnabled={isAIEnabled}
                />

                {/* Environment */}
                <AIEnhancedInput
                  name="environment"
                  label="Environment"
                  value={formData.environment}
                  onChange={handleInputChange('environment')}
                  placeholder="Select environment"
                  description="Target deployment environment"
                  required
                  suggestions={environmentSuggestions}
                  aiEnabled={isAIEnabled}
                />

                {/* CPU Allocation */}
                <AIEnhancedInput
                  name="cpu"
                  type="number"
                  label="CPU Cores"
                  value={formData.cpu}
                  onChange={handleInputChange('cpu')}
                  placeholder="2"
                  description="Number of CPU cores to allocate"
                  required
                  validation={{
                    min: 1,
                    max: 32
                  }}
                  suggestions={cpuSuggestions}
                  aiEnabled={isAIEnabled}
                />

                {/* Memory Allocation */}
                <AIEnhancedInput
                  name="memory"
                  type="number"
                  label="Memory (GB)"
                  value={formData.memory}
                  onChange={handleInputChange('memory')}
                  placeholder="4"
                  description="Memory allocation in gigabytes"
                  required
                  validation={{
                    min: 1,
                    max: 128
                  }}
                  suggestions={memorySuggestions.map(s => s.replace('GB', ''))}
                  aiEnabled={isAIEnabled}
                />

                {/* Timeout */}
                <AIEnhancedInput
                  name="timeout"
                  type="number"
                  label="Timeout (seconds)"
                  value={formData.timeout}
                  onChange={handleInputChange('timeout')}
                  placeholder="30"
                  description="Request timeout in seconds"
                  validation={{
                    min: 1,
                    max: 600
                  }}
                  aiEnabled={isAIEnabled}
                />

                {/* Scaling Policy */}
                <AIEnhancedInput
                  name="scalingPolicy"
                  label="Scaling Policy"
                  value={formData.scalingPolicy}
                  onChange={handleInputChange('scalingPolicy')}
                  placeholder="auto"
                  description="How the service should scale"
                  suggestions={['auto', 'manual', 'scheduled']}
                  aiEnabled={isAIEnabled}
                />
              </div>

              {/* Description - Full Width */}
              <AIEnhancedInput
                name="description"
                type="textarea"
                label="Service Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Describe what this service does..."
                description="Detailed description of the service purpose and functionality"
                aiEnabled={isAIEnabled}
              />

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  {isAIEnabled ? (
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      AI assistance active - Focus any field for help
                    </span>
                  ) : (
                    'AI assistance is disabled'
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Save Configuration
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Features Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI-Enhanced Features</CardTitle>
              <CardDescription>
                Experience intelligent assistance throughout the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Context Awareness
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    AI knows what page you're on, what you're trying to do, and provides relevant help automatically
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    Field-Level Help
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Every input field has intelligent assistance with validation, suggestions, and best practices
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-green-500" />
                    Smart Suggestions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    AI provides contextual suggestions, auto-completion, and intelligent defaults
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Try It Yourself</CardTitle>
              <CardDescription>
                Interact with the form above to see AI assistance in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• <strong>Focus any field</strong> to see contextual AI help and suggestions</p>
                <p>• <strong>Enter invalid values</strong> to see intelligent validation feedback</p>
                <p>• <strong>Check the toolbar at the bottom</strong> for page-specific AI assistance</p>
                <p>• <strong>Try different pages</strong> to see how context changes automatically</p>
                <p>• <strong>Toggle AI assistance</strong> on/off to compare the experience</p>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> This demonstrates the AI-enhanced interface experience. 
                  In production, the AI would be connected to real-time system data and provide 
                  even more intelligent assistance based on your infrastructure and usage patterns.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
