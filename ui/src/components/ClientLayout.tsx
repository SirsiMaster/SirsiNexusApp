'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { AgentChat } from '@/components/AgentChat';
import { NotificationCenter } from '@/components/NotificationCenter';
import { CommandPalette } from '@/components/CommandPalette';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const pathname = usePathname();
  
  // Handle navigation to infrastructure with query
  const handleNavigateToInfrastructure = () => {
    window.location.href = '/infrastructure';
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <div className="flex">
        <Sidebar 
          aiAssistant 
          onNavigateToInfrastructure={handleNavigateToInfrastructure}
        />
        <main className="flex-1 p-6 ml-0 lg:ml-64 transition-all duration-300 bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
      <AgentChat />
      <NotificationCenter />
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
