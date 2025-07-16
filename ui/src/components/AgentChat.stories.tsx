import type { Meta, StoryObj } from '@storybook/react';
import { AgentChat } from './AgentChat';

const meta: Meta<typeof AgentChat> = {
  title: 'Components/AgentChat',
  component: AgentChat,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AgentChat>;

export const Default: Story = {
  args: {
    contextualHints: [
      'Need help with your migration?',
      'I can assist with cloud provider selection',
      'Ask me about best practices',
    ],
  },
};

export const WithoutHints: Story = {
  args: {
    contextualHints: [],
  },
};

export const WithCustomOnSendMessage: Story = {
  args: {
    contextualHints: ['Try sending a message!'],
    onSendMessage: async (message) => {
      console.log('Message sent:', message);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};
