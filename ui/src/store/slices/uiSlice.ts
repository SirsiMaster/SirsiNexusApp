import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  autoClose?: boolean;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
  agentChatVisible: boolean;
  currentContextualHints: string[];
  loadingStates: Record<string, boolean>;
  modals: {
    welcome: boolean;
    auth: boolean;
    settings: boolean;
    journeySelection: boolean;
    optimizationWelcome: boolean;
    scalingWelcome: boolean;
    [key: string]: boolean;
  };
  userJourney: {
    isFirstTime: boolean;
    selectedJourney: 'migration' | 'optimization' | 'scaling' | null;
    completedTutorials: string[];
  };
}

const initialState: UIState = {
  theme: 'light',
  sidebarCollapsed: false,
  notifications: [],
  agentChatVisible: false,
  currentContextualHints: [],
  loadingStates: {},
  modals: {
    welcome: false,
    auth: false,
    settings: false,
    journeySelection: false,
    optimizationWelcome: false,
    scalingWelcome: false,
  },
  userJourney: {
    isFirstTime: true,
    selectedJourney: null,
    completedTutorials: [],
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    toggleAgentChat: (state) => {
      state.agentChatVisible = !state.agentChatVisible;
    },
    setContextualHints: (state, action: PayloadAction<string[]>) => {
      state.currentContextualHints = action.payload;
    },
    setLoadingState: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) => {
      state.loadingStates[action.payload.key] = action.payload.loading;
    },
    setModalState: (
      state,
      action: PayloadAction<{ modal: string; visible: boolean }>
    ) => {
      state.modals[action.payload.modal] = action.payload.visible;
    },
    selectJourney: (
      state,
      action: PayloadAction<'migration' | 'optimization' | 'scaling'>
    ) => {
      state.userJourney.selectedJourney = action.payload;
      state.userJourney.isFirstTime = false;
      state.modals.journeySelection = false;
      
      // Only open the appropriate welcome modal if this is the first time selecting this journey
      // and the user specifically selected migration
      if (action.payload === 'migration') {
        state.modals.welcome = true;
      } else if (action.payload === 'optimization') {
        state.modals.optimizationWelcome = true;
      } else if (action.payload === 'scaling') {
        state.modals.scalingWelcome = true;
      }
    },
    markTutorialComplete: (
      state,
      action: PayloadAction<string>
    ) => {
      if (!state.userJourney.completedTutorials.includes(action.payload)) {
        state.userJourney.completedTutorials.push(action.payload);
      }
    },
    resetFirstTimeExperience: (state) => {
      state.userJourney.isFirstTime = true;
      state.userJourney.selectedJourney = null;
      state.userJourney.completedTutorials = [];
      state.modals.journeySelection = true;
    },
    markAsNotFirstTime: (state) => {
      state.userJourney.isFirstTime = false;
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  addNotification,
  removeNotification,
  toggleAgentChat,
  setContextualHints,
  setLoadingState,
  setModalState,
  selectJourney,
  markTutorialComplete,
  resetFirstTimeExperience,
  markAsNotFirstTime,
} = uiSlice.actions;

export default uiSlice.reducer;
