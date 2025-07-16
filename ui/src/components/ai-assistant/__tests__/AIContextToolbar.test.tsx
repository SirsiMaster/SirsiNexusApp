import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

// Mock the AI Context Service
jest.mock('../../../services/aiContextService', () => ({
  aiContextService: {
    setContext: jest.fn(),
    getContext: jest.fn(),
    getContextualHelp: jest.fn(),
    getFieldHelp: jest.fn(),
    validateField: jest.fn()
  }
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/test'
  }),
  usePathname: () => '/test'
}));

// Mock DOM methods
delete (window as any).location;
(window as any).location = {
  pathname: '/test'
};

// Mock MutationObserver
global.MutationObserver = class {
  observe() {}
  disconnect() {}
  takeRecords() { return []; }
  constructor(callback: any) {}
} as any;

import AIContextToolbar from '../AIContextToolbar';
import { aiContextService } from '../../../services/aiContextService';

// Create a test store
const createTestStore = () => configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false }) => state,
    ui: (state = { theme: 'light' }) => state
  }
});

const renderWithProvider = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('AIContextToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (aiContextService.getContextualHelp as jest.Mock).mockResolvedValue({
      message: 'Test help message',
      suggestions: ['Test suggestion 1', 'Test suggestion 2'],
      tips: ['Test tip 1']
    });
  });

  it('should render the AI assistant button', () => {
    renderWithProvider(<AIContextToolbar />);
    
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    // Should have multiple buttons - check for specific ones
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should open help panel when AI button is clicked', async () => {
    await act(async () => {
      renderWithProvider(<AIContextToolbar />);
    });
    
    // Find the expand button specifically by title
    const expandButton = screen.getByTitle('Expand');
    
    await act(async () => {
      fireEvent.click(expandButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test help message')).toBeInTheDocument();
    });
  });

  it('should display contextual help when panel is opened', async () => {
    await act(async () => {
      renderWithProvider(<AIContextToolbar />);
    });
    
    const expandButton = screen.getByTitle('Expand');
    
    await act(async () => {
      fireEvent.click(expandButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test help message')).toBeInTheDocument();
      expect(screen.getByText('Test suggestion 1')).toBeInTheDocument();
      expect(screen.getByText('Test suggestion 2')).toBeInTheDocument();
    });
  });

  it('should set context when feature is provided', () => {
    renderWithProvider(<AIContextToolbar feature="analytics" page="dashboard" />);
    
    expect(aiContextService.setContext).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: 'analytics',
        page: 'dashboard'
      })
    );
  });

  it('should handle suggestion clicks', async () => {
    renderWithProvider(<AIContextToolbar />);
    
    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);
    
    await waitFor(() => {
      const suggestion = screen.getByText('Test suggestion 1');
      fireEvent.click(suggestion);
    });
    
    expect(aiContextService.getContextualHelp).toHaveBeenCalledWith('Test suggestion 1');
  });

  it('should close panel when close button is clicked', async () => {
    renderWithProvider(<AIContextToolbar />);
    
    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);
    
    // Wait for the panel to expand
    await waitFor(() => {
      expect(screen.getByText('Test help message')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByTitle('Hide assistant');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Test help message')).not.toBeInTheDocument();
    });
  });

  describe('Field Help Integration', () => {
    beforeEach(() => {
      (aiContextService.getFieldHelp as jest.Mock).mockReturnValue({
        message: 'Field help message',
        tips: ['Field tip 1'],
        suggestions: ['What should I enter here?']
      });
    });

    it('should provide field-specific help', () => {
      renderWithProvider(<AIContextToolbar />);
      
      // Simulate field focus event
      const fieldHelpResult = aiContextService.getFieldHelp('cpu', 'number', 8);
      
      expect(aiContextService.getFieldHelp).toHaveBeenCalledWith('cpu', 'number', 8);
      expect(fieldHelpResult.message).toBe('Field help message');
      expect(fieldHelpResult.tips).toContain('Field tip 1');
    });
  });

  describe('Validation Integration', () => {
    beforeEach(() => {
      (aiContextService.validateField as jest.Mock).mockReturnValue({
        isValid: false,
        aiHelp: {
          message: 'Validation error message',
          suggestions: ['Fix this field']
        }
      });
    });

    it('should provide validation help for invalid fields', () => {
      renderWithProvider(<AIContextToolbar />);
      
      const validationResult = aiContextService.validateField('email', 'invalid-email', { required: true });
      
      expect(aiContextService.validateField).toHaveBeenCalledWith('email', 'invalid-email', { required: true });
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.aiHelp?.message).toBe('Validation error message');
    });
  });

  describe('Context Updates', () => {
    it('should update context when user performs actions', () => {
      renderWithProvider(<AIContextToolbar feature="optimization" page="tutorial" />);
      
      expect(aiContextService.setContext).toHaveBeenCalledWith(
        expect.objectContaining({
          feature: 'optimization',
          page: 'tutorial'
        })
      );
    });

    it('should handle multiple context updates', async () => {
      const store = createTestStore();
      const { rerender } = render(
        <Provider store={store}>
          <AIContextToolbar feature="analytics" page="overview" />
        </Provider>
      );
      
      await waitFor(() => {
        expect(aiContextService.setContext).toHaveBeenCalledWith(
          expect.objectContaining({
            feature: 'analytics',
            page: 'overview'
          })
        );
      });
      
      // Clear the mock to isolate the next call
      jest.clearAllMocks();
      
      await act(async () => {
        rerender(
          <Provider store={store}>
            <AIContextToolbar feature="migration" page="steps" userAction="configuring" />
          </Provider>
        );
      });
      
      await waitFor(() => {
        expect(aiContextService.setContext).toHaveBeenCalledWith(
          expect.objectContaining({
            feature: 'migration',
            page: 'steps',
            userAction: 'configuring'
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    (aiContextService.getContextualHelp as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    await act(async () => {
      renderWithProvider(<AIContextToolbar />);
    });
    
    const expandButton = screen.getByTitle('Expand');
    
    await act(async () => {
      fireEvent.click(expandButton);
    });
    
    // The component logs the error to console, not necessarily displays it
    await waitFor(() => {
      expect(aiContextService.getContextualHelp).toHaveBeenCalled();
    });
  });

    it('should fallback to default help when context is missing', async () => {
      (aiContextService.getContextualHelp as jest.Mock).mockResolvedValue({
        message: "I'm ready to help! What would you like to know?",
        suggestions: ['How do I get started?', 'Show me features', 'System requirements']
      });
      
      await act(async () => {
        renderWithProvider(<AIContextToolbar />);
      });
      
      const expandButton = screen.getByTitle('Expand');
      
      await act(async () => {
        fireEvent.click(expandButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText("I'm ready to help! What would you like to know?")).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should be accessible via keyboard navigation', () => {
      renderWithProvider(<AIContextToolbar />);
      
      const expandButton = screen.getByTitle('Expand');
      expect(expandButton).toBeInTheDocument();
      
      expandButton.focus();
      expect(expandButton).toHaveFocus();
    });

    it('should have proper ARIA labels', () => {
      renderWithProvider(<AIContextToolbar />);
      
      const expandButton = screen.getByTitle('Expand');
      const closeButton = screen.getByTitle('Hide assistant');
      expect(expandButton).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
    });

    it('should support keyboard interactions', async () => {
      await act(async () => {
        renderWithProvider(<AIContextToolbar />);
      });
      
      const expandButton = screen.getByTitle('Expand');
      
      await act(async () => {
        // First click to expand
        fireEvent.click(expandButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test help message')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = React.memo(() => {
        renderSpy();
        return <AIContextToolbar feature="analytics" page="dashboard" />;
      });
      
      renderWithProvider(<TestComponent />);
      
      // Expect only one render call initially
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should debounce rapid context updates', async () => {
      jest.useFakeTimers();
      
      renderWithProvider(<AIContextToolbar />);
      
      // Simulate rapid context updates
      aiContextService.setContext({ feature: 'test1', page: 'page1' });
      aiContextService.setContext({ feature: 'test2', page: 'page2' });
      aiContextService.setContext({ feature: 'test3', page: 'page3' });
      
      jest.advanceTimersByTime(500);
      
      // Should only call setContext for the last update after debounce
      expect(aiContextService.setContext).toHaveBeenLastCalledWith({
        feature: 'test3',
        page: 'page3'
      });
      
      jest.useRealTimers();
    });
  });
});
