import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { Button, Alert, Modal } from '../components/common';
import { StoryList, StoryForm } from '../components/stories';
import { createStory } from '../redux/slices/storySlice';
import { enqueueToast } from '../redux/slices/uiSlice';
import { StoryPayload } from '../services/storyService';

const StoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!activeProjectId) {
    return (
      <div className="page-container">
        <Alert severity="warning" message="Please select an active project to view stories." />
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={() => window.location.href = '/projects'}>Go to Projects</Button>
        </div>
      </div>
    );
  }

  const handleCreateSubmit = async (payload: StoryPayload) => {
    await dispatch(createStory({ projectId: activeProjectId, payload })).unwrap();
    dispatch(enqueueToast({ message: 'Story created successfully', severity: 'success' }));
    setShowCreateModal(false);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Stories</h1>
      </div>

      <StoryList
        projectId={activeProjectId}
        onCreateStory={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <Modal title="Create New Story" isOpen onClose={() => setShowCreateModal(false)}>
          <StoryForm
            projectId={activeProjectId}
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default StoriesPage;
