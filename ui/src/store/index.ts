import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import migrationReducer from './slices/migrationSlice';
import uiReducer from './slices/uiSlice';
import agentReducer from './slices/agentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    migrations: migrationReducer,
    ui: uiReducer,
    agent: agentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['socket/connected', 'socket/disconnected'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
