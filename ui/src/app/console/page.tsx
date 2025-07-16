'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Terminal,
  Play,
  Square,
  Trash2,
  Save,
  FileText,
  History,
  Settings,
  Code,
  Upload,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Database,
  Cloud,
  Server
} from 'lucide-react';

interface ConsoleOutput {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: string;
  content: string;
  command?: string;
}

interface SavedScript {
  id: string;
  name: string;
  content: string;
  lastModified: string;
  language: string;
  tags: string[];
}

const ScriptingConsole = () => {
  const [currentScript, setCurrentScript] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('bash');
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([
    {
      id: '1',
      name: 'AWS Resource Audit',
      content: `#!/bin/bash
# AWS Resource Audit Script
echo "Starting AWS Resource Audit..."

# List EC2 instances
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType]' --output table

# List S3 buckets
aws s3 ls

# Check security groups
aws ec2 describe-security-groups --query 'SecurityGroups[?length(IpPermissions[?FromPort==\`22\`]) > \`0\`]'`,
      lastModified: '2 hours ago',
      language: 'bash',
      tags: ['aws', 'audit', 'security']
    },
    {
      id: '2',
      name: 'Infrastructure Health Check',
      content: `#!/bin/bash
# Infrastructure Health Check
echo "=== Infrastructure Health Check ==="

# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU load
uptime

# Check running services
systemctl list-units --type=service --state=running`,
      lastModified: '1 day ago',
      language: 'bash',
      tags: ['monitoring', 'health', 'system']
    },
    {
      id: '3',
      name: 'Cost Analysis Query',
      content: `// Cost Analysis JavaScript
const analyzeMonthlySpend = async () => {
  const costData = await fetch('/api/costs/monthly').then(r => r.json());
  
  console.log('Monthly Cost Breakdown:');
  costData.services.forEach(service => {
    console.log(\`\${service.name}: $\${service.cost}\`);
  });
  
  const total = costData.services.reduce((sum, s) => sum + s.cost, 0);
  console.log(\`Total: $\${total}\`);
  
  return { total, breakdown: costData.services };
};

analyzeMonthlySpend();`,
      lastModified: '3 days ago',
      language: 'javascript',
      tags: ['cost', 'analysis', 'api']
    }
  ]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const languages = [
    { id: 'bash', name: 'Bash/Shell', icon: Terminal },
    { id: 'javascript', name: 'JavaScript', icon: Code },
    { id: 'python', name: 'Python', icon: Code },
    { id: 'sql', name: 'SQL', icon: Database }
  ];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputs]);

  const addOutput = (type: ConsoleOutput['type'], content: string, command?: string) => {
    const newOutput: ConsoleOutput = {
      id: Date.now().toString(),
      type,
      timestamp: new Date().toLocaleTimeString(),
      content,
      command
    };
    setOutputs(prev => [...prev, newOutput]);
  };

  const executeScript = async () => {
    if (!currentScript.trim()) {
      addOutput('error', 'No script to execute');
      return;
    }

    setIsExecuting(true);
    addOutput('info', `Executing ${selectedLanguage} script...`, currentScript.split('\n')[0]);

    // Simulate script execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock different types of outputs based on script content
    if (currentScript.includes('aws ec2')) {
      addOutput('success', `Found 5 EC2 instances
i-1234567890abcdef0    running    t3.micro
i-0987654321fedcba0    stopped    t3.small
i-abcdef1234567890    running    m5.large`);
    } else if (currentScript.includes('df -h')) {
      addOutput('success', `Filesystem      Size  Used Avail Use% Mounted on
/dev/xvda1       20G  12G  7.2G  63% /
/dev/xvdb       100G  45G   50G  48% /data`);
    } else if (currentScript.includes('costs')) {
      addOutput('success', `Monthly Cost Breakdown:
EC2: $1,247
S3: $234
RDS: $456
Total: $1,937`);
    } else {
      addOutput('success', 'Script executed successfully');
      addOutput('info', 'Process completed with exit code 0');
    }

    setIsExecuting(false);
  };

  const stopExecution = () => {
    setIsExecuting(false);
    addOutput('warning', 'Execution stopped by user');
  };

  const clearConsole = () => {
    setOutputs([]);
  };

  const saveScript = () => {
    if (!currentScript.trim()) return;
    
    const name = prompt('Enter script name:');
    if (!name) return;

    const newScript: SavedScript = {
      id: Date.now().toString(),
      name,
      content: currentScript,
      lastModified: 'now',
      language: selectedLanguage,
      tags: []
    };

    setSavedScripts(prev => [newScript, ...prev]);
    addOutput('success', `Script saved as "${name}"`);
  };

  const loadScript = (script: SavedScript) => {
    setCurrentScript(script.content);
    setSelectedLanguage(script.language);
    addOutput('info', `Loaded script: ${script.name}`);
  };

  const getOutputIcon = (type: ConsoleOutput['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getOutputColor = (type: ConsoleOutput['type']) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const exportScript = () => {
    const blob = new Blob([currentScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script.${selectedLanguage === 'bash' ? 'sh' : selectedLanguage}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(currentScript);
        addOutput('info', 'Script copied to clipboard');
      } else {
        // Fallback for browsers without clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = currentScript;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        addOutput('info', 'Script copied to clipboard');
      }
    } catch (error) {
      addOutput('error', 'Failed to copy script to clipboard');
      console.error('Copy to clipboard failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-800 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Terminal className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Scripting Console
            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-700">
              <Zap className="h-3 w-3 mr-1" />
              Interactive
            </Badge>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Execute scripts, automate tasks, and interact with your infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Language Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Language</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {languages.map((lang) => {
                    const Icon = lang.icon;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                          selectedLanguage === lang.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                            : 'hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{lang.name}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Saved Scripts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Saved Scripts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {savedScripts.map((script) => (
                    <div
                      key={script.id}
                      onClick={() => loadScript(script)}
                      className="p-3 border dark:border-gray-700 rounded-lg cursor-pointer hover:shadow-md transition-shadow hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                    >
                      <h4 className="font-medium text-sm dark:text-gray-200">{script.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{script.lastModified}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {script.language}
                        </Badge>
                        {script.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Console */}
          <div className="lg:col-span-3 space-y-6">
            {/* Script Editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Script Editor
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button onClick={copyToClipboard} size="sm" variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button onClick={exportScript} size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button onClick={saveScript} size="sm" variant="outline">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  ref={textareaRef}
                  value={currentScript}
                  onChange={(e) => setCurrentScript(e.target.value)}
                  placeholder={`Enter your ${languages.find(l => l.id === selectedLanguage)?.name} script here...`}
                  className="w-full h-64 font-mono text-sm border border-gray-200 dark:border-gray-700 dark:border-gray-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedLanguage}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Lines: {currentScript.split('\n').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExecuting ? (
                      <Button onClick={stopExecution} size="sm" variant="destructive">
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    ) : (
                      <Button onClick={executeScript} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Play className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terminal Output */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Terminal Output
                    {isExecuting && (
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 animate-pulse">
                        Running
                      </Badge>
                    )}
                  </CardTitle>
                  <Button onClick={clearConsole} size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  ref={terminalRef}
                  className="bg-gray-900 text-gray-100 font-mono text-sm rounded-lg p-4 h-80 overflow-y-auto"
                >
                  {outputs.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400 italic">
                      Output will appear here when you execute scripts...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {outputs.map((output) => (
                        <div key={output.id} className="flex items-start gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                            [{output.timestamp}]
                          </span>
                          <div className="flex items-start gap-2 flex-1">
                            {getOutputIcon(output.type)}
                            <div className="flex-1">
                              {output.command && (
                                <div className="text-gray-400 text-xs mb-1">
                                  $ {output.command}
                                </div>
                              )}
                              <pre className={`whitespace-pre-wrap ${getOutputColor(output.type)}`}>
                                {output.content}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isExecuting && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <div className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                          <span>Executing...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentScript('aws ec2 describe-instances')}
                    className="flex items-center gap-2"
                  >
                    <Cloud className="h-4 w-4" />
                    AWS EC2
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentScript('df -h && free -h')}
                    className="flex items-center gap-2"
                  >
                    <Server className="h-4 w-4" />
                    System Info
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentScript('docker ps -a')}
                    className="flex items-center gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Docker
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentScript('kubectl get pods')}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Kubernetes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptingConsole;
