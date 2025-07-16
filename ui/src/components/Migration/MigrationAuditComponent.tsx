'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  User, 
  Shield, 
  Database, 
  Server, 
  Network,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Activity
} from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: 'authentication' | 'authorization' | 'migration' | 'agent' | 'system' | 'security';
  action: string;
  resourceType: string;
  resourceId?: string;
  userId?: string;
  userName?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details: Record<string, any>;
  errorMessage?: string;
}

interface MigrationAuditComponentProps {
  events?: AuditEvent[];
  onExportLogs: () => void;
  onEventSelect: (event: AuditEvent) => void;
}

const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'evt-001',
    timestamp: '2025-07-08T06:05:30Z',
    eventType: 'migration',
    action: 'migration_started',
    resourceType: 'migration',
    resourceId: 'mig-12345',
    userId: 'user-001',
    userName: 'john.doe@company.com',
    sessionId: 'sess-abc123',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    success: true,
    details: {
      sourceProvider: 'aws',
      targetProvider: 'azure',
      resourceCount: 45,
      estimatedDuration: '2 hours',
      securityProtocols: ['mTLS', 'HTTPS', 'SSH']
    }
  },
  {
    id: 'evt-002',
    timestamp: '2025-07-08T06:04:15Z',
    eventType: 'security',
    action: 'certificate_verified',
    resourceType: 'certificate',
    resourceId: 'cert-mtls-001',
    sessionId: 'sess-abc123',
    success: true,
    details: {
      certificateType: 'mTLS',
      issuer: 'SirsiNexus CA',
      expiryDate: '2026-01-15T00:00:00Z',
      algorithm: 'RSA-2048'
    }
  },
  {
    id: 'evt-003',
    timestamp: '2025-07-08T06:03:45Z',
    eventType: 'authentication',
    action: 'login',
    resourceType: 'user',
    resourceId: 'user-001',
    userId: 'user-001',
    userName: 'john.doe@company.com',
    sessionId: 'sess-abc123',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    success: true,
    details: {
      authMethod: '2FA',
      loginDuration: '1.2s',
      deviceFingerprint: 'fp-device-001'
    }
  },
  {
    id: 'evt-004',
    timestamp: '2025-07-08T06:02:30Z',
    eventType: 'agent',
    action: 'agent_spawned',
    resourceType: 'agent',
    resourceId: 'agent-aws-001',
    sessionId: 'sess-abc123',
    success: true,
    details: {
      agentType: 'aws-discovery',
      spiffeId: 'spiffe://sirsi-nexus.com/agent/aws-001',
      capabilities: ['discover', 'migrate', 'validate'],
      region: 'us-east-1'
    }
  },
  {
    id: 'evt-005',
    timestamp: '2025-07-08T06:01:15Z',
    eventType: 'authorization',
    action: 'access_granted',
    resourceType: 'project',
    resourceId: 'proj-migration-001',
    userId: 'user-001',
    userName: 'john.doe@company.com',
    sessionId: 'sess-abc123',
    ipAddress: '192.168.1.100',
    success: true,
    details: {
      permission: 'migration:execute',
      role: 'migration-admin',
      scope: 'project'
    }
  },
  {
    id: 'evt-006',
    timestamp: '2025-07-08T06:00:45Z',
    eventType: 'system',
    action: 'security_scan_completed',
    resourceType: 'system',
    success: true,
    details: {
      scanType: 'vulnerability',
      threatsFound: 0,
      complianceScore: 98,
      scanDuration: '45s'
    }
  }
];

export function MigrationAuditComponent({ events, onExportLogs, onEventSelect }: MigrationAuditComponentProps) {
  const eventsData = events || MOCK_AUDIT_EVENTS;
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>(eventsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [successFilter, setSuccessFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  useEffect(() => {
    let filtered = eventsData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.ipAddress?.includes(searchTerm)
      );
    }

    // Apply event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter);
    }

    // Apply success filter
    if (successFilter !== 'all') {
      filtered = filtered.filter(event => 
        successFilter === 'success' ? event.success : !event.success
      );
    }

    setFilteredEvents(filtered);
  }, [eventsData, searchTerm, eventTypeFilter, successFilter]);

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'authentication':
        return <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'authorization':
        return <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'migration':
        return <Server className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'agent':
        return <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'system':
        return <Database className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success 
      ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      : <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'authentication':
        return 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20';
      case 'authorization':
        return 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20';
      case 'migration':
        return 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20';
      case 'agent':
        return 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20';
      case 'system':
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20';
      case 'security':
        return 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const eventTypeCounts = eventsData.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const successCount = eventsData.filter(e => e.success).length;
  const failureCount = eventsData.filter(e => !e.success).length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Migration Audit Trail
          </h2>
          <button
            onClick={onExportLogs}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            <Download className="h-4 w-4" />
            Export Logs
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{eventsData.length}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Events</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{successCount}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Successful</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-xl font-bold text-red-600 dark:text-red-400">{failureCount}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Failed</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round((successCount / eventsData.length) * 100)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events by action, resource, user, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Types</option>
              <option value="authentication">Authentication</option>
              <option value="authorization">Authorization</option>
              <option value="migration">Migration</option>
              <option value="agent">Agent</option>
              <option value="system">System</option>
              <option value="security">Security</option>
            </select>
            <select
              value={successFilter}
              onChange={(e) => setSuccessFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Results</option>
              <option value="success">Success Only</option>
              <option value="failure">Failures Only</option>
            </select>
          </div>
        </div>

        {/* Event Timeline */}
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${getEventTypeColor(event.eventType)}`}
              onClick={() => {
                setSelectedEvent(event);
                onEventSelect(event);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {getEventTypeIcon(event.eventType)}
                    {getStatusIcon(event.success)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {event.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded capitalize">
                        {event.eventType}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <div>
                        <span className="font-medium">Resource:</span> {event.resourceType}
                        {event.resourceId && <span className="text-xs ml-1">({event.resourceId})</span>}
                      </div>
                      {event.userName && (
                        <div>
                          <span className="font-medium">User:</span> {event.userName}
                          {event.ipAddress && <span className="text-xs ml-1">from {event.ipAddress}</span>}
                        </div>
                      )}
                      {!event.success && event.errorMessage && (
                        <div className="text-red-600 dark:text-red-400">
                          <span className="font-medium">Error:</span> {event.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-1">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            No audit events found matching your criteria.
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {getEventTypeIcon(selectedEvent.eventType)}
                Audit Event Details
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Event ID</label>
                  <div className="font-mono text-sm">{selectedEvent.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Timestamp</label>
                  <div>{new Date(selectedEvent.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Event Type</label>
                  <div className="flex items-center gap-2 capitalize">
                    {getEventTypeIcon(selectedEvent.eventType)}
                    {selectedEvent.eventType}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedEvent.success)}
                    {selectedEvent.success ? 'Success' : 'Failed'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Action</label>
                  <div>{selectedEvent.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Resource</label>
                  <div>
                    {selectedEvent.resourceType}
                    {selectedEvent.resourceId && <span className="text-xs ml-1">({selectedEvent.resourceId})</span>}
                  </div>
                </div>
              </div>

              {/* User Information */}
              {(selectedEvent.userId || selectedEvent.userName || selectedEvent.ipAddress) && (
                <div>
                  <h4 className="text-md font-medium text-slate-900 dark:text-slate-100 mb-3">User Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEvent.userName && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">User</label>
                        <div>{selectedEvent.userName}</div>
                      </div>
                    )}
                    {selectedEvent.sessionId && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Session ID</label>
                        <div className="font-mono text-sm">{selectedEvent.sessionId}</div>
                      </div>
                    )}
                    {selectedEvent.ipAddress && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">IP Address</label>
                        <div className="font-mono">{selectedEvent.ipAddress}</div>
                      </div>
                    )}
                    {selectedEvent.userAgent && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">User Agent</label>
                        <div className="text-sm">{selectedEvent.userAgent}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Information */}
              {selectedEvent.errorMessage && (
                <div>
                  <h4 className="text-md font-medium text-slate-900 dark:text-slate-100 mb-3">Error Details</h4>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <div className="text-red-800 dark:text-red-300">{selectedEvent.errorMessage}</div>
                  </div>
                </div>
              )}

              {/* Event Details */}
              <div>
                <h4 className="text-md font-medium text-slate-900 dark:text-slate-100 mb-3">Event Details</h4>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <pre className="text-sm text-slate-700 dark:text-slate-300 overflow-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
