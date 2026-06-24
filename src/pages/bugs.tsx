import React from 'react';
import { useAppSelector } from '../redux/hooks';
import { BugList } from '../components/bugs';
import { Alert } from '../components/common';

const BugsPage: React.FC = () => {
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);

  if (!activeProjectId) {
    return (
      <div style={{ padding: '2rem' }}>
        <Alert severity="warning" message="Please select an active project from the sidebar to view bugs." />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <BugList projectId={activeProjectId} />
    </div>
  );
};

export default BugsPage;
