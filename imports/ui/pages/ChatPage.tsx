import React from 'react';
import { Layout } from '../components/Layout';
import { Chat } from '../components/Chat';

export const ChatPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <Chat />
      </div>
    </Layout>
  );
};
