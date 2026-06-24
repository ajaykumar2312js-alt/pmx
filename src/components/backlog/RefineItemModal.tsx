import React, { useState } from 'react';
import { Modal, Button, Alert, Select } from '../common';
import { useAppDispatch } from '../../redux/hooks';
import { refineBacklogItem } from '../../redux/slices/backlogSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { WorkItemType } from '../../common/enums';
import { MockEpicForm, MockStoryForm, MockTaskForm, MockBugForm } from './RefinePlaceholders';

interface RefineItemModalProps {
  itemId: string;
  onClose: () => void;
}

export const RefineItemModal: React.FC<RefineItemModalProps> = ({ itemId, onClose }) => {
  const dispatch = useAppDispatch();
  const [targetType, setTargetType] = useState<WorkItemType | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRefineSubmit = async (formPayload: Record<string, unknown>) => {
    if (!targetType) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await dispatch(refineBacklogItem({
        itemId,
        payload: {
          type: targetType as WorkItemType,
          ...formPayload
        }
      })).unwrap();
      
      dispatch(enqueueToast({ message: 'Item successfully refined', severity: 'success' }));
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to refine item');
      setSubmitting(false); // Let user try again if it fails
    }
  };

  const renderForm = () => {
    switch (targetType) {
      case WorkItemType.EPIC: return <MockEpicForm onCancel={onClose} onSubmit={handleRefineSubmit} />;
      case WorkItemType.STORY: return <MockStoryForm onCancel={onClose} onSubmit={handleRefineSubmit} />;
      case WorkItemType.TASK: return <MockTaskForm onCancel={onClose} onSubmit={handleRefineSubmit} />;
      case WorkItemType.BUG: return <MockBugForm onCancel={onClose} onSubmit={handleRefineSubmit} />;
      default: return null;
    }
  };

  return (
    <Modal title="Refine Backlog Item" isOpen={true} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {errorMsg && <Alert severity="error" message={errorMsg} />}

        {!targetType ? (
          <>
            <Select
              label="Select Target Type"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as WorkItemType)}
              options={[
                { label: 'Select a type...', value: '' },
                { label: 'Epic', value: WorkItemType.EPIC },
                { label: 'Story', value: WorkItemType.STORY },
                { label: 'Task', value: WorkItemType.TASK },
                { label: 'Bug', value: WorkItemType.BUG },
              ]}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Configure {targetType} Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setTargetType('')} disabled={submitting}>
                &larr; Back
              </Button>
            </div>
            {renderForm()}
          </>
        )}
      </div>
    </Modal>
  );
};
