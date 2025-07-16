import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt?: string;
  lastLogin?: string;
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
    autoSave: boolean;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  sessionExpiry: string | null;
  persistSession: boolean;
}

// Load persisted session from localStorage
const loadPersistedSession = (): Partial<AuthState> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const persistedSession = localStorage.getItem('sirsi-nexus-session');
    if (persistedSession) {
      const session = JSON.parse(persistedSession);
      if (session.sessionExpiry && new Date(session.sessionExpiry) > new Date()) {
        return {
          isAuthenticated: true,
          user: session.user,
          token: session.token,
          sessionExpiry: session.sessionExpiry,
          persistSession: true,
        };
      } else {
        localStorage.removeItem('sirsi-nexus-session');
      }
    }
  } catch (error) {
    console.error('Failed to load persisted session:', error);
    localStorage.removeItem('sirsi-nexus-session');
  }
  return {};
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
  sessionExpiry: null,
  persistSession: false,
  ...loadPersistedSession(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.sessionExpiry = null;
      state.persistSession = false;
      
      // Clear persisted session
      try {
        localStorage.removeItem('sirsi-nexus-session');
      } catch (error) {
        console.error('Failed to clear persisted session:', error);
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    login: (state, action: PayloadAction<User & { rememberMe?: boolean }>) => {
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + (action.payload.rememberMe ? 168 : 24)); // 7 days or 1 day
      
      const enhancedUser = {
        ...action.payload,
        lastLogin: new Date().toISOString(),
        preferences: action.payload.preferences || {
          theme: 'light',
          notifications: true,
          autoSave: true,
        },
      };
      
      state.isAuthenticated = true;
      state.user = enhancedUser;
      state.token = `sirsi-token-${Date.now()}`;
      state.loading = false;
      state.error = null;
      state.sessionExpiry = sessionExpiry.toISOString();
      state.persistSession = action.payload.rememberMe || false;
      
      // Persist session if remember me is checked
      if (action.payload.rememberMe) {
        try {
          localStorage.setItem('sirsi-nexus-session', JSON.stringify({
            user: enhancedUser,
            token: state.token,
            sessionExpiry: state.sessionExpiry,
          }));
        } catch (error) {
          console.error('Failed to persist session:', error);
        }
      }
    },
    register: (state, action: PayloadAction<User>) => {
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 1 day for new users
      
      const enhancedUser = {
        ...action.payload,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: 'light' as const,
          notifications: true,
          autoSave: true,
        },
      };
      
      state.isAuthenticated = true;
      state.user = enhancedUser;
      state.token = `sirsi-token-${Date.now()}`;
      state.loading = false;
      state.error = null;
      state.sessionExpiry = sessionExpiry.toISOString();
      state.persistSession = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, login, register } =
  authSlice.actions;

export default authSlice.reducer;
