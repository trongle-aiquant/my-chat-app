import React from 'react';
import { Layout } from '../components/Layout';
import { TodoList } from '../components/TodoList';

export const TodoPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <TodoList />
      </div>
    </Layout>
  );
};

