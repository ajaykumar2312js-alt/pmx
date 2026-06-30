import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { FormField, Input, Select, Button, TextArea } from '../common/ui';
import { Task, TaskPayload } from '../../services/taskService';
import { fetchEpics, selectEpics } from '../../redux/slices/epicSlice';
import { KANBAN_STATUSES, DEFAULT_STATUS } from '../../common/kanbanStatuses';

interface TaskFormProps {
  projectId: string;
  initialData?: Partial<Task>;
  onSubmit: (payload: TaskPayload) => Promise<void>;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ projectId, initialData, onSubmit, onCancel }) => {
  const dispatch = useAppDispatch();
  const epics = useAppSelector(selectEpics);

  const [title, setTitle] = useState(initialData?.title || '');
  const [epicId, setEpicId] = useState(initialData?.epicId || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [status, setStatus] = useState<string>(initialData?.status ?? DEFAULT_STATUS);
  const [estimatedHours, setEstimatedHours] = useState<string>(initialData?.estimatedHours?.toString() || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchEpics({ projectId, params: { page: 1, limit: 100 } }));
  }, [dispatch, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (estimatedHours && isNaN(parseFloat(estimatedHours))) {
      newErrors.estimatedHours = 'Must be a valid number';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        epicId: epicId || undefined,
        description,
        dueDate: dueDate || undefined,
        status,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      });
    } catch (err: unknown) {
      const e = err as Error;
      setErrors({ form: e.message || 'Submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const epicOptions = epics.map(epic => ({ value: epic.id, label: epic.name }));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {errors.form && <div style={{ color: 'var(--color-danger-600)', fontSize: '0.875rem' }}>{errors.form}</div>}

      <FormField label="Title" required error={errors.title}>
        <Input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })); }}
          placeholder="Task title"
        />
      </FormField>

      <FormField label="Epic">
        <Select
          value={epicId}
          onChange={(e) => setEpicId(e.target.value)}
          options={[{ value: '', label: 'No Epic' }, ...epicOptions]}
        />
      </FormField>

      <FormField label="Description">
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task details and instructions..."
          rows={4}
        />
      </FormField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormField label="Status">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={KANBAN_STATUSES.map(s => ({ value: s.id, label: s.label }))}
          />
        </FormField>

        <FormField label="Due Date">
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </FormField>

        <FormField label="Estimated Hours" error={errors.estimatedHours}>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={estimatedHours}
            onChange={(e) => { setEstimatedHours(e.target.value); setErrors(prev => ({ ...prev, estimatedHours: '' })); }}
            placeholder="e.g. 4.5"
          />
        </FormField>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>{initialData?.id ? 'Save Changes' : 'Save Task'}</Button>
      </div>
    </form>
  );
};
