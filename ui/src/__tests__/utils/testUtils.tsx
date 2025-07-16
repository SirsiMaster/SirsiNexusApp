import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, Store } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

// Create a test store with all necessary reducers
const createTestStore = (preloadedState?: any): Store => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false, token: null }) => state,
      ui: (state = { 
        theme: 'light', 
        sidebar: { isCollapsed: false },
        notifications: [],
        loading: false 
      }) => state,
      projects: (state = { 
        projects: [], 
        currentProject: null, 
        loading: false, 
        error: null 
      }) => state,
      agents: (state = { 
        agents: [], 
        selectedAgent: null, 
        agentMetrics: {}, 
        loading: false 
      }) => state,
      analytics: (state = { 
        dashboardData: {}, 
        metrics: {}, 
        loading: false 
      }) => state,
      credentials: (state = { 
        credentials: [], 
        loading: false, 
        error: null 
      }) => state
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST']
        }
      })
  });
};

// All providers wrapper for testing
interface AllProvidersProps {
  children: React.ReactNode;
  initialState?: any;
}

const AllProviders: React.FC<AllProvidersProps> = ({ children, initialState }) => {
  const store = createTestStore(initialState);
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
  store?: Store;
}

const customRender = (
  ui: ReactElement,
  {
    initialState,
    store = createTestStore(initialState),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllProviders initialState={initialState}>
      {children}
    </AllProviders>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
};

// Mock implementations for common APIs
export const mockApiResponses = {
  health: { status: 'OK' },
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user']
  },
  projects: [
    {
      id: '1',
      name: 'Test Project',
      description: 'A test project',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ],
  agents: [
    {
      id: '1',
      name: 'Test Agent',
      type: 'aws',
      status: 'active',
      metrics: { cpu: 50, memory: 60 }
    }
  ],
  credentials: [
    {
      id: '1',
      name: 'Test Credential',
      provider: 'aws',
      type: 'access_key',
      isActive: true
    }
  ]
};

// Mock functions for services
export const mockServices = {
  aiContextService: {
    setContext: jest.fn(),
    getContext: jest.fn(() => ({})),
    getContextualHelp: jest.fn(() => Promise.resolve({
      message: 'Test help message',
      suggestions: ['Test suggestion 1', 'Test suggestion 2'],
      tips: ['Test tip 1'],
      actions: []
    })),
    getFieldHelp: jest.fn(() => ({
      message: 'Field help message',
      tips: ['Field tip 1'],
      suggestions: ['What should I enter here?']
    })),
    validateField: jest.fn(() => ({
      isValid: true,
      aiHelp: null
    }))
  },
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    healthCheck: jest.fn(() => Promise.resolve(true))
  },
  websocketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn()
  }
};

// Common test setup utilities
export const setupMocks = () => {
  // Mock window.location
  delete (window as any).location;
  (window as any).location = {
    pathname: '/test',
    search: '',
    hash: '',
    href: 'http://localhost:3000/test'
  };

  // Mock MutationObserver
  global.MutationObserver = class {
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
    constructor(callback: any) {}
  } as any;

  // Mock IntersectionObserver
  global.IntersectionObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
    constructor(callback: any) {}
  } as any;

  // Mock ResizeObserver
  global.ResizeObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
    constructor(callback: any) {}
  } as any;

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  });

  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiResponses.health),
      text: () => Promise.resolve('OK'),
      status: 200,
      statusText: 'OK'
    } as Response)
  );

  return {
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock,
    fetch: global.fetch
  };
};

// Async testing utilities
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
