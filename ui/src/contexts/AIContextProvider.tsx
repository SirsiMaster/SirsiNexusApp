'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { aiContextService, AIResponse } from '@/services/aiContextService';

interface AIContextType {
  isAIEnabled: boolean;
  toggleAI: () => void;
  getContextualHelp: (query?: string) => Promise<AIResponse>;
  setFeatureContext: (feature: string, page?: string) => void;
  currentFeature: string;
  currentPage: string;
  aiResponse: AIResponse | null;
  isLoading: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIContextProviderProps {
  children: ReactNode;
  enabledByDefault?: boolean;
}

export function AIContextProvider({ 
  children, 
  enabledByDefault = true 
}: AIContextProviderProps) {
  const [isAIEnabled, setIsAIEnabled] = useState(enabledByDefault);
  const [currentFeature, setCurrentFeature] = useState('general');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize AI context awareness
  useEffect(() => {
    const detectContext = () => {
      const path = window.location.pathname;
      const segments = path.split('/').filter(Boolean);
      
      let feature = 'general';
      let page = 'dashboard';
      
      if (segments.length > 0) {
        feature = segments[0];
        page = segments.length > 1 ? segments.slice(1).join('/') : 'overview';
      }

      setCurrentFeature(feature);
      setCurrentPage(page);

      // Update AI service context
      aiContextService.setContext({
        feature,
        page,
        userAction: 'viewing',
        systemState: {
          url: path,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      });
    };

    detectContext();

    // Listen for route changes
    const handleRouteChange = () => {
      setTimeout(detectContext, 100);
    };

    // For Next.js navigation
    window.addEventListener('popstate', handleRouteChange);
    
    // For SPA navigation detection
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const currentPath = window.location.pathname;
          if (currentPath !== `/${currentFeature}/${currentPage}`.replace('//', '/')) {
            handleRouteChange();
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      observer.disconnect();
    };
  }, [currentFeature, currentPage]);

  // Enhanced error detection and user action tracking
  useEffect(() => {
    if (!isAIEnabled) return;

    // Track user interactions for better context
    const trackUserAction = (action: string, target?: string) => {
      const context = aiContextService.getContext();
      if (context) {
        aiContextService.setContext({
          ...context,
          userAction: action,
          previousActions: [
            ...(context.previousActions || []).slice(-4), // Keep last 5 actions
            action
          ]
        });
      }
    };

    // Error detection
    const handleError = (event: ErrorEvent) => {
      const context = aiContextService.getContext();
      if (context) {
        aiContextService.setContext({
          ...context,
          errorContext: `${event.error?.name}: ${event.message}`,
          userAction: 'encountered_error'
        });
      }
    };

    // Form interaction tracking
    const handleFormInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const action = event.type;
      const fieldName = target.getAttribute('name') || target.getAttribute('id') || 'unknown';
      
      trackUserAction(`${action}_${fieldName}`, target.tagName.toLowerCase());
    };

    // Click tracking
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button');
      const link = target.closest('a');
      
      if (button) {
        trackUserAction('clicked_button', button.textContent?.trim() || button.className);
      } else if (link) {
        trackUserAction('clicked_link', link.href);
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    document.addEventListener('click', handleClick);
    document.addEventListener('focus', handleFormInteraction, true);
    document.addEventListener('blur', handleFormInteraction, true);
    document.addEventListener('change', handleFormInteraction);

    return () => {
      window.removeEventListener('error', handleError);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('focus', handleFormInteraction, true);
      document.removeEventListener('blur', handleFormInteraction, true);
      document.removeEventListener('change', handleFormInteraction);
    };
  }, [isAIEnabled]);

  const toggleAI = () => {
    setIsAIEnabled(!isAIEnabled);
    
    // Store preference in localStorage
    localStorage.setItem('aiAssistantEnabled', (!isAIEnabled).toString());
  };

  const getContextualHelp = async (query?: string): Promise<AIResponse> => {
    setIsLoading(true);
    try {
      const response = await aiContextService.getContextualHelp(query);
      setAiResponse(response);
      return response;
    } catch (error) {
      console.error('Failed to get contextual help:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setFeatureContext = (feature: string, page: string = 'overview') => {
    setCurrentFeature(feature);
    setCurrentPage(page);
    
    aiContextService.setContext({
      feature,
      page,
      userAction: 'navigated',
      systemState: {
        url: window.location.pathname,
        timestamp: new Date().toISOString()
      }
    });
  };

  // Initialize AI enabled state from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('aiAssistantEnabled');
    if (savedPreference !== null) {
      setIsAIEnabled(savedPreference === 'true');
    }
  }, []);

  const value: AIContextType = {
    isAIEnabled,
    toggleAI,
    getContextualHelp,
    setFeatureContext,
    currentFeature,
    currentPage,
    aiResponse,
    isLoading
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext(): AIContextType {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return context;
}
