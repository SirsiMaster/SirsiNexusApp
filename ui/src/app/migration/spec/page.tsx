'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package,
  Truck,
  Key,
  Info
} from 'lucide-react';

export default function MigrationSpecPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50 dark:to-gray-800 dark:from-gray-900 dark:via-gray-800 dark:to-cyan-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Package className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            Migration Specification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Define the specifications and requirements for your migration project
          </p>
        </div>

        {/* Specification Overview */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Specification Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Resources",
                  description: "Lists all resources involved in migration",
                  icon: Info,
                  items: ["Servers", "Databases", "Network Shares"]
                },
                {
                  title: "Access",
                  description: "Access credentials for source and destination",
                  icon: Key,
                  items: ["API Keys", "SSH Keys", "Passwords"]
                },
                {
                  title: "Transport",
                  description: "Data transport methods and security",
                  icon: Truck,
                  items: ["VPN", "Direct Connect", "Encrypted Storage"]
                }
              ].map((spec, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-cyan-100 dark:bg-cyan-900">
                      <spec.icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {spec.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {spec.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {spec.items.map((item, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-white dark:bg-gray-800 dark:bg-gray-600 border border-gray-200 dark:border-gray-700 dark:border-gray-500 rounded text-sm text-gray-700 dark:text-gray-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end items-center">
          <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600">
            Validate Specification
          </Button>
        </div>
      </div>
    </div>
  );
}
