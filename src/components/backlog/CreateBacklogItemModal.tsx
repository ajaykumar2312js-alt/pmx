import React, { useState, FormEvent } from 'react';
import { Modal, Input, TextArea, Select, Button, Alert } from '../common';
import { useAppDispatch } from '../../redux/hooks';
import { createBacklogItem } from '../../redux/slices/backlogSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { Priority, WorkItemType } from '../../common/enums';
import { BacklogItemStatus } from '../../services/backlogService';

interface CreateBacklogItemModalProps {
  projectId: string;
  onClose: () => void;
}

export const CreateBacklogItemModal: React.FC<CreateBacklogItemModalProps> = ({ projectId, onClose }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [businessValue, setBusinessValue] = useState<string>('');
  const [type, setType] = useState<WorkItemType | ''>('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required';
    
    if (businessValue) {
      const bv = parseInt(businessValue, 10);
      if (isNaN(bv) || bv < 1 || bv > 100) {
        errors.businessValue = 'Business value must be between 1 and 100';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await dispatch(createBacklogItem({
        projectId,
        payload: {
          title,
          description,
          priority,
          businessValue: businessValue ? parseInt(businessValue, 10) : undefined,
          status: 'New' as BacklogItemStatus,
          type: type || undefined,
        }
      })).unwrap();
      
      dispatch(enqueueToast({ message: 'Backlog item created', severity: 'success' }));
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to create backlog item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Create Backlog Item" isOpen={true} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                { label: 'Critical', value: Priority.CRITICAL },
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
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input 
              label="Business Value (1-100)" 
              type="number"
              min={1}
              max={100}
              value={businessValue} 
              onChange={(e) => setBusinessValue(e.target.value)} 
              error={fieldErrors.businessValue} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting}>Create Item</Button>
        </div>
      </form>
    </Modal>
  );
};
