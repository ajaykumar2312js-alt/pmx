import React from 'react';
import { useAppSelector } from '../redux/hooks';
import { TaskList } from '../components/tasks';
import { Alert } from '../components/common';

const TasksPage: React.FC = () => {
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);

  if (!activeProjectId) {
    return (
      <div style={{ padding: '2rem' }}>
        <Alert severity="warning" message="Please select an active project from the sidebar to view tasks." />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <TaskList projectId={activeProjectId} />
    </div>
  );
};

export default TasksPage;
