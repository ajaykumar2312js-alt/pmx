import React, { useState } from 'react';
import { Modal, Button, Alert } from '../common/ui';
import { useAppDispatch } from '../../redux/hooks';
import { archiveProject } from '../../redux/slices/projectSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';

interface ArchiveProjectModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export const ArchiveProjectModal: React.FC<ArchiveProjectModalProps> = ({ projectId, projectName, onClose }) => {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleArchive = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await dispatch(archiveProject(projectId)).unwrap();
      dispatch(enqueueToast({ message: 'Project archived successfully', severity: 'success' }));
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to archive project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Archive Project"
      isOpen={true}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && <Alert severity="error" message={errorMsg} />}
        
        <p style={{ margin: 0 }}>
          Are you sure you want to archive <strong>{projectName}</strong>?
        </p>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
          Archived projects are hidden from active lists but their data is preserved. 
          You can restore it later if needed.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="danger" onClick={handleArchive} loading={submitting}>
            Archive Project
          </Button>
        </div>
      </div>
    </Modal>
  );
};
