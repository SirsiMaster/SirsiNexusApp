// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock fetch globally
if (!global.fetch) {
  global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
}

// Ensure fetch is available on window as well
if (typeof window !== 'undefined' && !window.fetch) {
  window.fetch = global.fetch;
}

beforeEach(() => {
  const fetchMock = fetch as jest.MockedFunction<typeof fetch>;
  fetchMock.mockClear();
  
  // Default successful responses for common API calls
  fetchMock.mockImplementation((url: string | URL | Request) => {
    const urlString = typeof url === 'string' ? url : url.toString();
    
    if (urlString.includes('/api/login')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '1', name: 'Test User', email: 'test@example.com' }),
        status: 200,
      } as Response);
    }
    
    if (urlString.includes('/api/register')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '1', name: 'Test User', email: 'test@example.com' }),
        status: 200,
      } as Response);
    }
    
    if (urlString.includes('/api/projects')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '1', name: 'Test Project', description: 'Test Description' }),
        status: 200,
      } as Response);
    }
    
    // Default successful response
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      status: 200,
    } as Response);
  });
});

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console warnings for tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: validateDOMNesting') ||
       args[0].includes('Warning: React does not recognize') ||
       args[0].includes('Warning: Invalid values for props'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: Missing `Description`') ||
       args[0].includes('aria-describedby') ||
       args[0].includes('Warning: You called act(async () => ...') ||
       args[0].includes('Warning: An update to') ||
       args[0].includes('was not wrapped in act') ||
       args[0].includes('When testing, code that causes React state updates should be wrapped into act'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
