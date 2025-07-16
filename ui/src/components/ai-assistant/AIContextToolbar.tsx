'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, HelpCircle, Lightbulb, AlertTriangle, ArrowRight, Command, X } from 'lucide-react';
import { aiContextService, AIResponse, AIAction } from '@/services/aiContextService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AIContextToolbarProps {
  position?: 'top' | 'bottom' | 'floating';
  showWhenIdle?: boolean;
  autoHide?: boolean;
  compact?: boolean;
  feature?: string;
  page?: string;
  userAction?: string;
}

export default function AIContextToolbar({
  position = 'bottom',
  showWhenIdle = true,
  autoHide = false,
  compact = false,
  feature,
  page,
  userAction
}: AIContextToolbarProps) {
  const [isVisible, setIsVisible] = useState(showWhenIdle);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextHelp, setContextHelp] = useState<AIResponse | null>(null);
  const [currentContext, setCurrentContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);

  // Auto-detect page context and update AI awareness
  useEffect(() => {
    const detectPageContext = () => {
      // Use props if provided, otherwise detect from URL
      let contextFeature = feature;
      let contextPage = page;
      let contextUserAction = userAction;
      
      if (!contextFeature || !contextPage) {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        
        if (!contextFeature) {
          contextFeature = segments.length > 0 ? segments[0] : 'general';
        }
        if (!contextPage) {
          contextPage = segments.length > 1 ? segments.slice(1).join('/') : 'overview';
        }
      }
      
      if (!contextUserAction) {
        contextUserAction = 'browsing';
      }

      // Update AI context
      aiContextService.setContext({
        feature: contextFeature,
        page: contextPage,
        userAction: contextUserAction,
        systemState: {
          url: window.location.pathname,
          timestamp: new Date().toISOString()
        }
      });

      setCurrentContext(`${contextFeature}/${contextPage}`);
      updateContextHelp();
    };

    detectPageContext();
    
    // Listen for navigation changes
    const handleNavigation = () => {
      setTimeout(detectPageContext, 100);
    };

    window.addEventListener('popstate', handleNavigation);
    
    // Detect page changes for SPAs
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentContext.split('/')[0]) {
        handleNavigation();
      }
    });

    observer.observe(document, { subtree: true, childList: true });

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      observer.disconnect();
    };
  }, [feature, page, userAction, currentContext]);

  // Generate smart suggestions based on current context
  useEffect(() => {
    const generateSmartSuggestions = () => {
      try {
        const path = window?.location?.pathname || '';
        const suggestions: string[] = [];

        if (path.includes('/docs')) {
          suggestions.push('Explain this concept', 'Show me examples', 'Related tutorials');
        } else if (path.includes('/tutorial')) {
          suggestions.push('Next step', 'Explain current step', 'Skip to section');
        } else if (path.includes('/analytics')) {
          suggestions.push('Interpret these metrics', 'Setup alerts', 'Forecast trends');
        } else if (path.includes('/optimization')) {
          suggestions.push('Optimize settings', 'Cost recommendations', 'Performance tips');
        } else if (path.includes('/migration')) {
          suggestions.push('Start migration', 'Check readiness', 'Best practices');
        } else {
          suggestions.push('Get started', 'Show features', 'Help me navigate');
        }

        setSmartSuggestions(suggestions);
      } catch (error) {
        console.warn('Failed to generate smart suggestions:', error);
        setSmartSuggestions(['Get started', 'Show features', 'Help me navigate']);
      }
    };

    generateSmartSuggestions();
  }, [currentContext]);

  // Update context help
  const updateContextHelp = async () => {
    setIsLoading(true);
    try {
      const help = await aiContextService.getContextualHelp();
      setContextHelp(help);
    } catch (error) {
      console.error('Failed to get context help:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle smart suggestion click
  const handleSuggestionClick = async (suggestion: string) => {
    setIsLoading(true);
    try {
      const response = await aiContextService.getContextualHelp(suggestion);
      setContextHelp(response);
      setIsExpanded(true);
    } catch (error) {
      console.error('Failed to process suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle action execution
  const executeAction = async (action: AIAction) => {
    try {
      await action.action();
      // Optionally update context after action
      updateContextHelp();
    } catch (error) {
      console.error('Failed to execute action:', error);
    }
  };

  // Auto-hide logic
  useEffect(() => {
    if (autoHide && !isExpanded) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(hideTimer);
    }
  }, [autoHide, isExpanded]);

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'fixed top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2';
      case 'floating':
        return 'fixed bottom-20 right-4';
      default:
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
        title="Show AI Assistant"
      >
        <Brain className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className={`${getPositionClasses()} z-50 max-w-md transition-all duration-300`}>
      <Card className="border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-3">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                AI Assistant
                {!compact && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    - {currentContext.split('/')[0]}
                  </span>
                )}
              </span>
              {isLoading && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-purple-50 dark:bg-purple-900/200 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-purple-50 dark:bg-purple-900/200 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-purple-50 dark:bg-purple-900/200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-full hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                <HelpCircle className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                title="Hide assistant"
              >
                <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Smart Suggestions - Always Visible */}
          <div className="flex flex-wrap gap-1 mb-2">
            {smartSuggestions && smartSuggestions.slice(0, compact ? 2 : 3).map((suggestion, index) => (
              <Badge
                key={`smart-suggestion-${index}-${suggestion.replace(/\s+/g, '-').toLowerCase()}`}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-purple-50 dark:bg-purple-900/20 hover:border-purple-300 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Sparkles className="h-2 w-2 mr-1" />
                {suggestion}
              </Badge>
            ))}
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSuggestionClick('Show me help')}
                className="flex items-center space-x-1 hover:text-purple-600 transition-colors"
              >
                <HelpCircle className="h-3 w-3" />
                <span>Help</span>
              </button>
              <button
                onClick={() => handleSuggestionClick('Give me tips')}
                className="flex items-center space-x-1 hover:text-yellow-600 transition-colors"
              >
                <Lightbulb className="h-3 w-3" />
                <span>Tips</span>
              </button>
            </div>
            <button
              onClick={() => handleSuggestionClick('How do I navigate this page?')}
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
            >
              <Command className="h-3 w-3" />
              <span>Guide</span>
            </button>
          </div>

          {/* Expanded Content */}
          {isExpanded && contextHelp && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              {/* AI Message */}
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-start space-x-2">
                  <Sparkles className="h-3 w-3 text-purple-500 mt-0.5 flex-shrink-0" />
                  <p>{contextHelp.message}</p>
                </div>
              </div>

              {/* Suggestions */}
              {contextHelp.suggestions && contextHelp.suggestions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Try asking:</div>
                  <div className="flex flex-wrap gap-1">
                    {contextHelp.suggestions.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={`help-suggestion-${index}-${suggestion.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-300 hover:underline transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {contextHelp.actions && contextHelp.actions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick actions:</div>
                  <div className="space-y-1">
                    {contextHelp.actions.slice(0, 3).map((action, index) => (
                      <button
                        key={`action-${action.id || index}-${action.label.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => executeAction(action)}
                        className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-800 dark:text-green-300 transition-colors"
                      >
                        <ArrowRight className="h-2 w-2" />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {contextHelp.tips && contextHelp.tips.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Lightbulb className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tips:</span>
                  </div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 ml-4">
                    {contextHelp.tips.slice(0, 3).map((tip, index) => (
                      <li key={`tip-${index}-${tip.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {contextHelp.warnings && contextHelp.warnings.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    <span className="text-xs font-medium text-orange-600">Warnings:</span>
                  </div>
                  <ul className="text-xs text-orange-600 space-y-0.5 ml-4">
                    {contextHelp.warnings.slice(0, 2).map((warning, index) => (
                      <li key={`warning-${index}-${warning.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documentation Links */}
              {contextHelp.documentation && contextHelp.documentation.length > 0 && (
                <div className="text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Related docs: </span>
                  {contextHelp.documentation.slice(0, 2).map((doc, index) => (
                    <span key={`doc-${index}-${doc.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}>
                      <button
                        onClick={() => window.open(`/${doc}`, '_blank')}
                        className="text-blue-600 hover:underline"
                      >
                        {doc.split('/').pop()}
                      </button>
                      {index < contextHelp.documentation!.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
