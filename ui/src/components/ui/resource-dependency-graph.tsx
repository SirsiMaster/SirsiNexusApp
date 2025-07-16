'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Server, Network, Cloud, Shield, Zap,
  ArrowRight, Info, AlertTriangle, CheckCircle
} from 'lucide-react';
import { logAnalyticsEvent } from '@/lib/analytics';

interface ResourceNode {
  id: string;
  name: string;
  type: 'compute' | 'database' | 'network' | 'storage' | 'security';
  status: 'healthy' | 'warning' | 'error' | 'migrating';
  dependencies: string[];
  metadata: Record<string, any>;
  position?: { x: number; y: number };
}

interface ResourceDependencyGraphProps {
  resources: ResourceNode[];
  showMigrationPath?: boolean;
  onNodeClick?: (node: ResourceNode) => void;
  className?: string;
}

const ResourceDependencyGraph: React.FC<ResourceDependencyGraphProps> = ({
  resources,
  showMigrationPath = false,
  onNodeClick,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<ResourceNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ResourceNode | null>(null);

  const getNodeIcon = (type: ResourceNode['type']) => {
    const iconMap = {
      compute: Server,
      database: Database,
      network: Network,
      storage: Cloud,
      security: Shield
    };
    return iconMap[type] || Server;
  };

  const getStatusColor = (status: ResourceNode['status']) => {
    const colorMap = {
      healthy: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      migrating: '#3B82F6'
    };
    return colorMap[status] || '#6B7280';
  };

  const calculateLayout = (nodes: ResourceNode[]) => {
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Simple force-directed layout simulation
    const positioned = nodes.map((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      
      return {
        ...node,
        position: {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        }
      };
    });

    return positioned;
  };

  const positionedResources = calculateLayout(resources);

  const renderNode = (node: ResourceNode, index: number) => {
    const Icon = getNodeIcon(node.type);
    const statusColor = getStatusColor(node.status);
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;

    if (!node.position) return null;

    return (
      <g
        key={node.id}
        transform={`translate(${node.position.x}, ${node.position.y})`}
        style={{ cursor: 'pointer' }}
onClick={() => {
          setSelectedNode(node);
          onNodeClick?.(node);
          logAnalyticsEvent('node_click', { nodeId: node.id, nodeType: node.type });
        }}
        onMouseEnter={() => setHoveredNode(node)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        {/* Node background */}
        <circle
          r={isSelected ? 35 : isHovered ? 32 : 28}
          fill="white"
          stroke={statusColor}
          strokeWidth={isSelected ? 3 : 2}
          filter={isSelected || isHovered ? 'url(#glow)' : undefined}
          className="transition-all duration-200"
        />
        
        {/* Status indicator */}
        <circle
          r={6}
          cx={20}
          cy={-20}
          fill={statusColor}
          stroke="white"
          strokeWidth={2}
        />
        
        {/* Icon */}
        <foreignObject x={-12} y={-12} width={24} height={24}>
          <Icon className="w-6 h-6 text-gray-700" />
        </foreignObject>
        
        {/* Label */}
        <text
          y={45}
          textAnchor="middle"
          className="text-sm font-medium fill-gray-700"
          fontSize="12"
        >
          {node.name.length > 12 ? `${node.name.substring(0, 12)}...` : node.name}
        </text>
        
        {/* Type label */}
        <text
          y={58}
          textAnchor="middle"
          className="text-xs fill-gray-500"
          fontSize="10"
        >
          {node.type}
        </text>
      </g>
    );
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    positionedResources.forEach(node => {
      if (!node.position) return;
      
      node.dependencies.forEach(depId => {
        const dependentNode = positionedResources.find(n => n.id === depId);
        if (!dependentNode?.position) return;

        const isHighlighted = selectedNode?.id === node.id || selectedNode?.id === depId;

        connections.push(
          <line
            key={`${node.id}-${depId}`}
            x1={node.position.x}
            y1={node.position.y}
            x2={dependentNode.position.x}
            y2={dependentNode.position.y}
            stroke={isHighlighted ? '#3B82F6' : '#D1D5DB'}
            strokeWidth={isHighlighted ? 2 : 1}
            strokeDasharray={showMigrationPath && isHighlighted ? "5,5" : undefined}
            className="transition-all duration-200"
          />
        );

        // Arrow marker
        const angle = Math.atan2(
          dependentNode.position.y - node.position.y,
          dependentNode.position.x - node.position.x
        );
        const arrowX = dependentNode.position.x - Math.cos(angle) * 35;
        const arrowY = dependentNode.position.y - Math.sin(angle) * 35;

        connections.push(
          <polygon
            key={`arrow-${node.id}-${depId}`}
            points="0,-3 10,0 0,3"
            fill={isHighlighted ? '#3B82F6' : '#9CA3AF'}
            transform={`translate(${arrowX}, ${arrowY}) rotate(${angle * 180 / Math.PI})`}
            className="transition-all duration-200"
          />
        );
      });
    });

    return connections;
  };

  return (
    <div className={`relative w-full h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="w-full h-full"
      >
        {/* Definitions for effects */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Render connections first (behind nodes) */}
        <g className="connections">
          {renderConnections()}
        </g>

        {/* Render nodes */}
        <g className="nodes">
          {positionedResources.map(renderNode)}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Resource Status</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Healthy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Error</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Migrating</span>
          </div>
        </div>
      </div>

      {/* Node details panel */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700 w-64"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{selectedNode.name}</h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{selectedNode.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`font-medium capitalize ${
                selectedNode.status === 'healthy' ? 'text-green-600' :
                selectedNode.status === 'warning' ? 'text-yellow-600' :
                selectedNode.status === 'error' ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {selectedNode.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Dependencies:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{selectedNode.dependencies.length}</span>
            </div>
          </div>

          {Object.keys(selectedNode.metadata).length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Metadata</h5>
              <div className="space-y-1 text-xs">
                {Object.entries(selectedNode.metadata).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Migration path overlay */}
      {showMigrationPath && (
        <div className="absolute bottom-4 left-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm font-medium">Migration Path Active</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Click nodes to see migration order and dependencies
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceDependencyGraph;
