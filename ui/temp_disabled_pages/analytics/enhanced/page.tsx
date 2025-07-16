import { Metadata } from 'next';
import EnhancedAnalyticsDashboard from '@/components/EnhancedAnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Enhanced Analytics Dashboard | SirsiNexus',
  description: 'Real-time analytics and performance monitoring for your cloud operations',
};

export default function EnhancedAnalyticsPage() {
  return <EnhancedAnalyticsDashboard />;
}
