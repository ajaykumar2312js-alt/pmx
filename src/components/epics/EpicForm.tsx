import React, { useState, useEffect, FormEvent } from 'react';
import { Input, TextArea, Select, Button, Alert } from '../common';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { EpicStatus, EpicPayload, Epic } from '../../services/epicService';

export interface EpicFormProps {
  initialData?: Partial<Epic>;
  onSubmit: (payload: EpicPayload) => Promise<void>;
  onCancel: () => void;
}

export const EpicForm: React.FC<EpicFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [ownerId, setOwnerId] = useState(initialData?.ownerId || '');
  
  // Convert targetRelease ISO string to YYYY-MM-DD for date input
  const defaultDate = initialData?.targetRelease ? new Date(initialData.targetRelease).toISOString().split('T')[0] : '';
  const [targetRelease, setTargetRelease] = useState(defaultDate);
  const [status, setStatus] = useState<EpicStatus>(initialData?.status || 'To Do');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({ limit: 100 }));
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit({
        name,
        description,
        ownerId: ownerId || undefined,
        targetRelease: targetRelease ? new Date(targetRelease).toISOString() : undefined,
        status
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to submit epic form.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {errorMsg && <Alert severity="error" message={errorMsg} />}

      <Input 
        label="Epic Name *" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        required 
      />

      <TextArea 
        label="Description" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        rows={4} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Select
          label="Owner"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          options={[
            { label: 'Unassigned', value: '' },
            ...users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))
          ]}
        />

        <Input 
          label="Target Release Date" 
          type="date"
          value={targetRelease} 
          onChange={(e) => setTargetRelease(e.target.value)} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as EpicStatus)}
          options={[
            { label: 'To Do', value: 'To Do' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'In Review', value: 'In Review' },
            { label: 'Done', value: 'Done' },
          ]}
        />

        {/* Read-only rollup stats (rendered only if they exist from initialData) */}
        {initialData?.id && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '1.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>Roll-up Statistics (Auto-computed)</span>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
              <div><strong>Completion:</strong> {initialData.completionPercentage || 0}%</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
        <Button variant="ghost" type="button" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button variant="primary" type="submit" loading={submitting}>
          {initialData?.id ? 'Save Changes' : 'Create Epic'}
        </Button>
      </div>
    </form>
  );
};
