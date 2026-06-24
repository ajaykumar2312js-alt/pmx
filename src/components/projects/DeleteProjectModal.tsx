import React, { useState } from 'react';
import { Modal, Button, Alert, Input } from '../common/ui';
import { useAppDispatch } from '../../redux/hooks';
import { deleteProject } from '../../redux/slices/projectSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { useNavigate } from 'react-router-dom';

interface DeleteProjectModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({ projectId, projectName, onClose, onDeleted }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== projectName) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await dispatch(deleteProject(projectId)).unwrap();
      dispatch(enqueueToast({ message: 'Project permanently deleted', severity: 'success' }));
      if (onDeleted) {
        onDeleted();
      } else {
        navigate('/projects');
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to delete project');
    } finally {
      setSubmitting(false);
    }
  };

  const isConfirmed = confirmText === projectName;

  return (
    <Modal
      title="Permanently Delete Project"
      isOpen={true}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && <Alert severity="error" message={errorMsg} />}
        
        <Alert severity="error" message="Warning: This action is irreversible." />

        <p style={{ margin: 0 }}>
          This will permanently delete the project <strong>{projectName}</strong>, including all its epics, stories, tasks, bugs, and history.
        </p>
        
        <Input 
          label={`Please type "${projectName}" to confirm`}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={projectName}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={submitting} disabled={!isConfirmed}>
            Permanently Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
