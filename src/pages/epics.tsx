import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { Button, Alert, Modal } from '../components/common';
import { EpicList, EpicForm } from '../components/epics';
import { createEpic } from '../redux/slices/epicSlice';
import { enqueueToast } from '../redux/slices/uiSlice';
import { EpicPayload } from '../services/epicService';
import { useNavigate } from 'react-router-dom';

const EpicsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!activeProjectId) {
    return (
      <div className="page-container">
        <Alert severity="warning" message="Please select an active project from the Projects page to view epics." />
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={() => window.location.href = '/projects'}>Go to Projects</Button>
        </div>
      </div>
    );
  }

  const handleCreateSubmit = async (payload: EpicPayload) => {
    await dispatch(createEpic({ projectId: activeProjectId, payload })).unwrap();
    dispatch(enqueueToast({ message: 'Epic created successfully', severity: 'success' }));
    setShowCreateModal(false);
  };

  return (
    <div className="page-container" style={{ position: 'relative', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Epics</h1>
        <Button onClick={() => setShowCreateModal(true)}>Create Epic</Button>
      </div>

      <EpicList 
        projectId={activeProjectId} 
        onEditEpic={(epic) => navigate(`/epics/${epic.id}`)} 
      />

      {showCreateModal && (
        <Modal title="Create New Epic" isOpen={true} onClose={() => setShowCreateModal(false)}>
          <EpicForm 
            onSubmit={handleCreateSubmit} 
            onCancel={() => setShowCreateModal(false)} 
          />
        </Modal>
      )}
    </div>
  );
};

export default EpicsPage;
