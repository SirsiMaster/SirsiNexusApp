import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AgentChat } from './AgentChat';
import { MigrationWelcomeModal } from './MigrationWelcomeModal';
import { AuthModal } from './AuthModal';

interface RootLayoutProps {
  children: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // Mock contextual hints for AgentChat
  const contextualHints = [
    'Try asking about cloud migration best practices',
    'I can help you assess your current infrastructure',
    'Need help with specific cloud services? Just ask!',
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="ml-64 p-6">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      <AgentChat
        contextualHints={contextualHints}
        onSendMessage={async (message) => {
          console.log('Message sent:', message);
          // In production, this would connect to the real agent service
        }}
      />

      <MigrationWelcomeModal
        isOpen={showWelcome}
        onClose={() => {
          setShowWelcome(false);
          setShowAuth(true);
        }}
      />

      <AuthModal />
    </div>
  );
};
