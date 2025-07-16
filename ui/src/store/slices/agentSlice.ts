import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AgentMessage {
  id: string;
  content: string;
  type: 'user' | 'agent';
  timestamp: string;
  contextId?: string;
  agentType?: string;
}

interface AgentSuggestion {
  id: string;
  text: string;
  action?: string;
  context?: string;
}

interface AgentContext {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface AgentState {
  messages: AgentMessage[];
  suggestions: AgentSuggestion[];
  isTyping: boolean;
  currentContext: AgentContext | null;
  activeAgents: string[];
  status: 'idle' | 'thinking' | 'responding' | 'error';
  error: string | null;
}

const initialState: AgentState = {
  messages: [],
  suggestions: [],
  isTyping: false,
  currentContext: null,
  activeAgents: [],
  status: 'idle',
  error: null,
};

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<AgentMessage>) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setSuggestions: (state, action: PayloadAction<AgentSuggestion[]>) => {
      state.suggestions = action.payload;
    },
    setContext: (state, action: PayloadAction<AgentContext | null>) => {
      state.currentContext = action.payload;
    },
    addActiveAgent: (state, action: PayloadAction<string>) => {
      if (!state.activeAgents.includes(action.payload)) {
        state.activeAgents.push(action.payload);
      }
    },
    removeActiveAgent: (state, action: PayloadAction<string>) => {
      state.activeAgents = state.activeAgents.filter(
        (agent) => agent !== action.payload
      );
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAgentStatus: (state, action: PayloadAction<'idle' | 'thinking' | 'responding' | 'error'>) => {
      state.status = action.payload;
    },
  },
});

export const {
  addMessage,
  setTyping,
  setSuggestions,
  setContext,
  addActiveAgent,
  removeActiveAgent,
  clearMessages,
  setError,
  setAgentStatus,
} = agentSlice.actions;

export default agentSlice.reducer;
