import React from 'react';
import { useAppSelector } from '../redux/hooks';
import { BugList } from '../components/bugs';
import { Alert } from '../components/common';

const BugsPage: React.FC = () => {
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);

  if (!activeProjectId) {
    return (
      <div className="page-container">
        <Alert severity="warning" message="Please select an active project from the sidebar to view bugs." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <BugList projectId={activeProjectId} />
    </div>
  );
};

export default BugsPage;
