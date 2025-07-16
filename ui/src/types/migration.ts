export type MigrationStep =
  | 'plan'
  | 'specify'
  | 'test'
  | 'build'
  | 'transfer'
  | 'validate'
  | 'optimize'
  | 'support';

export type MigrationStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'warning';

export interface Resource {
  id: string;
  name: string;
  type: string;
  status: MigrationStatus;
  metadata: Record<string, any>;
}

export interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  findings: Array<{
    category: string;
    description: string;
    impact: string;
    recommendation: string;
  }>;
}

export interface MigrationPlan {
  id: string;
  projectId: string;
  resources: Resource[];
  riskAssessment: RiskAssessment;
  estimatedDuration: string;
  estimatedCost: {
    oneTime: number;
    monthly: number;
    currency: string;
  };
}
