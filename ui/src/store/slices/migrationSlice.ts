import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MigrationStep, MigrationStatus, Resource } from '@/types/migration';

export interface MigrationState {
  currentStep: MigrationStep;
  stepStatuses: Record<MigrationStep, MigrationStatus>;
  discoveredResources: Resource[];
  migrationProgress: number;
  isInProgress: boolean;
}

const initialState: MigrationState = {
  currentStep: 'plan',
  stepStatuses: {
    plan: 'not_started',
    specify: 'not_started',
    test: 'not_started',
    build: 'not_started',
    transfer: 'not_started',
    validate: 'not_started',
    optimize: 'not_started',
    support: 'not_started',
  },
  discoveredResources: [],
  migrationProgress: 0,
  isInProgress: false,
};

const migrationSlice = createSlice({
  name: 'migration',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<MigrationStep>) => {
      state.currentStep = action.payload;
    },
    updateStepStatus: (
      state,
      action: PayloadAction<{ step: MigrationStep; status: MigrationStatus }>
    ) => {
      state.stepStatuses[action.payload.step] = action.payload.status;
    },
    setDiscoveredResources: (state, action: PayloadAction<Resource[]>) => {
      state.discoveredResources = action.payload;
    },
    updateMigrationProgress: (state, action: PayloadAction<number>) => {
      state.migrationProgress = action.payload;
    },
    setMigrationInProgress: (state, action: PayloadAction<boolean>) => {
      state.isInProgress = action.payload;
    },
    resetMigration: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentStep,
  updateStepStatus,
  setDiscoveredResources,
  updateMigrationProgress,
  setMigrationInProgress,
  resetMigration,
} = migrationSlice.actions;

export default migrationSlice.reducer;
