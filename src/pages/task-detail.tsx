import React from 'react';
import { useParams } from 'react-router-dom';
import { TaskDetail } from '../components/tasks';
import { Alert } from '../components/common';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Alert severity="error" message="No task ID provided." />;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <TaskDetail taskId={id} />
    </div>
  );
};

export default TaskDetailPage;
