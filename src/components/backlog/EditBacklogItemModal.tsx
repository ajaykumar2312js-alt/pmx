import React, { useState } from 'react';
import { Modal, Input, TextArea, Select, Button, Alert } from '../common';
import { useAppDispatch } from '../../redux/hooks';
import { updateBacklogItem, refineBacklogItem } from '../../redux/slices/backlogSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { Priority, WorkItemType } from '../../common/enums';
import { BacklogItemStatus, BacklogItem } from '../../services/backlogService';
import { MockEpicForm, MockStoryForm, MockTaskForm, MockBugForm } from './RefinePlaceholders';

interface EditBacklogItemModalProps {
  item: BacklogItem;
  onClose: () => void;
}

export const EditBacklogItemModal: React.FC<EditBacklogItemModalProps> = ({ item, onClose }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  const [priority, setPriority] = useState<Priority>(item.priority);
  const [status, setStatus] = useState<BacklogItemStatus>(item.status);
  const [type, setType] = useState<WorkItemType | ''>(item.type || '');
  
  const [targetType, setTargetType] = useState<WorkItemType | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async (typeSpecificPayload?: Record<string, unknown>) => {
    setErrorMsg(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (targetType) {
        // Refine
        await dispatch(refineBacklogItem({
          itemId: item.id,
          payload: {
            type: targetType as WorkItemType,
            title,
            description,
            priority,
            ...(typeSpecificPayload || {})
          }
        })).unwrap();
        dispatch(enqueueToast({ message: 'Item successfully refined', severity: 'success' }));
      } else {
        // Just update
        await dispatch(updateBacklogItem({
          itemId: item.id,
          payload: {
            title,
            description,
            priority,
            status,
            type: type !== '' ? type : null,
          }
        })).unwrap();
        dispatch(enqueueToast({ message: 'Backlog item updated', severity: 'success' }));
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to update backlog item');
    } finally {
      setSubmitting(false);
    }
  };

  const renderTypeForm = () => {
    if (!targetType) {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" type="button" onClick={() => handleUpdate()} loading={submitting}>Save Changes</Button>
        </div>
      );
    }
    
    switch (targetType) {
      case WorkItemType.EPIC: return <MockEpicForm onCancel={onClose} onSubmit={handleUpdate} />;
      case WorkItemType.STORY: return <MockStoryForm onCancel={onClose} onSubmit={handleUpdate} />;
      case WorkItemType.TASK: return <MockTaskForm onCancel={onClose} onSubmit={handleUpdate} />;
      case WorkItemType.BUG: return <MockBugForm onCancel={onClose} onSubmit={handleUpdate} />;
      default: return null;
    }
  };

  return (
    <Modal title="Edit Backlog Item" isOpen={true} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {errorMsg && <Alert severity="error" message={errorMsg} />}
        
        <Input 
          label="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          error={fieldErrors.title} 
        />
        
        <TextArea 
          label="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          rows={3} 
        />
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <Select 
              label="Priority" 
              value={priority} 
              onChange={(e) => setPriority(e.target.value as Priority)}
              options={[
                { label: 'Low', value: Priority.LOW },
                { label: 'Medium', value: Priority.MEDIUM },
                { label: 'High', value: Priority.HIGH },
              ]}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Select 
              label="Type (Label)" 
              value={type} 
              onChange={(e) => setType(e.target.value as WorkItemType | '')}
              options={[
                { label: 'Unassigned', value: '' },
                { label: 'Epic', value: WorkItemType.EPIC },
                { label: 'Story', value: WorkItemType.STORY },
                { label: 'Task', value: WorkItemType.TASK },
                { label: 'Bug', value: WorkItemType.BUG },
              ]}
              disabled={targetType !== ''}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BacklogItemStatus)}
              options={[
                { label: 'New', value: 'New' },
                { label: 'Ready', value: 'Ready' },
                { label: 'Closed', value: 'Closed' },
              ]}
              disabled={targetType !== ''}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Select
              label="Refine to Issue Type"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as WorkItemType)}
              options={[
                { label: 'None (Keep as Backlog Item)', value: '' },
                { label: 'Epic', value: WorkItemType.EPIC },
                { label: 'Story', value: WorkItemType.STORY },
                { label: 'Task', value: WorkItemType.TASK },
                { label: 'Bug', value: WorkItemType.BUG },
              ]}
            />
          </div>
        </div>

        {targetType && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-neutral-200)', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Configure {targetType} Details</h4>
          </div>
        )}

        {renderTypeForm()}
      </div>
    </Modal>
  );
};
