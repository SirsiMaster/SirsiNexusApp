'use client';

import React, { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { backendTestService } from '@/services/backend-test';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  RefreshCw,
  Terminal,
  Database,
  Wifi,
  Key
} from 'lucide-react';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'pending';
  message: string;
  timestamp: Date;
  duration?: number;
}

export default function BackendTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testReport, setTestReport] = useState<string>('');

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setTestReport('');

    try {
      const results = await backendTestService.runFullIntegrationTest();
      setTestResults(results);
      
      const report = backendTestService.generateTestReport(results);
      setTestReport(report);
    } catch (error) {
      console.error('Test execution failed:', error);
      setTestResults([{
        testName: 'Test Execution',
        status: 'failed',
        message: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownloadReport = () => {
    const blob = new Blob([testReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backend-test-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTestIcon = (testName: string) => {
    if (testName.includes('HTTP') || testName.includes('Health')) {
      return <Terminal className="h-5 w-5" />;
    } else if (testName.includes('WebSocket') || testName.includes('Connection')) {
      return <Wifi className="h-5 w-5" />;
    } else if (testName.includes('Credential')) {
      return <Key className="h-5 w-5" />;
    } else if (testName.includes('Resource') || testName.includes('Discovery')) {
      return <Database className="h-5 w-5" />;
    } else {
      return <Terminal className="h-5 w-5" />;
    }
  };

  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const pendingTests = testResults.filter(r => r.status === 'pending').length;

  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Backend Integration Tests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the connection and functionality of the Rust core engine backend
        </p>
      </div>

      {/* Test Controls */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="flex items-center space-x-2 rounded-lg bg-sirsi-500 px-4 py-2 text-white disabled:opacity-50 hover:bg-sirsi-600"
        >
          {isRunning ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          <span>{isRunning ? 'Running Tests...' : 'Run Integration Tests'}</span>
        </button>

        {testReport && (
          <button
            onClick={handleDownloadReport}
            className="flex items-center space-x-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
          >
            <Download className="h-5 w-5" />
            <span>Download Report</span>
          </button>
        )}
      </div>

      {/* Test Summary */}
      {testResults.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Passed</p>
                <p className="text-lg font-semibold text-green-900">{passedTests}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-center">
              <XCircle className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Failed</p>
                <p className="text-lg font-semibold text-red-900">{failedTests}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Pending</p>
                <p className="text-lg font-semibold text-yellow-900">{pendingTests}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 ${
              result.status === 'passed'
                ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                : result.status === 'failed'
                ? 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                : 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="rounded-lg bg-white dark:bg-gray-800 p-2">
                  {getTestIcon(result.testName)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{result.testName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{result.message}</p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Completed: {result.timestamp.toLocaleTimeString()}
                    </span>
                    {result.duration && (
                      <span>Duration: {result.duration}ms</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(result.status)}
                <span
                  className={`text-sm font-medium capitalize ${
                    result.status === 'passed'
                      ? 'text-green-800 dark:text-green-300'
                      : result.status === 'failed'
                      ? 'text-red-800 dark:text-red-300'
                      : 'text-yellow-800 dark:text-yellow-300'
                  }`}
                >
                  {result.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Running State */}
      {isRunning && testResults.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-sirsi-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Running Integration Tests
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Testing backend connectivity and functionality...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isRunning && testResults.length === 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-12 text-center">
          <Terminal className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No Tests Run Yet
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Click &ldquo;Run Integration Tests&rdquo; to validate backend connectivity and functionality.
          </p>
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Test Coverage:</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>• HTTP Health Check</div>
              <div>• WebSocket Connection</div>
              <div>• Agent Message Flow</div>
              <div>• Credential Validation</div>
              <div>• Resource Discovery</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
