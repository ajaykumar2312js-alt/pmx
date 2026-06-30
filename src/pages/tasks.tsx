import React from 'react';
import { useAppSelector } from '../redux/hooks';
import { TaskList } from '../components/tasks';
import { Alert } from '../components/common';

const TasksPage: React.FC = () => {
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);

  if (!activeProjectId) {
    return (
      <div className="page-container">
        <Alert severity="warning" message="Please select an active project from the sidebar to view tasks." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <TaskList projectId={activeProjectId} />
    </div>
  );
};

export default TasksPage;
