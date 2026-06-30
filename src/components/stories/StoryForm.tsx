import React, { useState, useEffect, FormEvent } from 'react';
import { Input, TextArea, Select, Button, Alert } from '../common';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { fetchEpics, selectEpics } from '../../redux/slices/epicSlice';
import { AcceptanceCriteriaEditor, ACEntry } from './AcceptanceCriteriaEditor/AcceptanceCriteriaEditor';
import { StoryPayload, Story } from '../../services/storyService';
import { Priority } from '../../common/enums';
import { KANBAN_STATUSES, DEFAULT_STATUS } from '../../common/kanbanStatuses';
import { v4 as uuidv4 } from 'uuid';

export interface StoryFormProps {
  projectId: string;
  initialData?: Partial<Story>;
  onSubmit: (payload: StoryPayload) => Promise<void>;
  onCancel: () => void;
}

export const StoryForm: React.FC<StoryFormProps> = ({ projectId, initialData, onSubmit, onCancel }) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const epics = useAppSelector(selectEpics);

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [asA, setAsA] = useState(initialData?.asA ?? '');
  const [iWant, setIWant] = useState(initialData?.iWant ?? '');
  const [soThat, setSoThat] = useState(initialData?.soThat ?? '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority ?? Priority.MEDIUM);
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId ?? '');
  const [epicId, setEpicId] = useState(initialData?.epicId ?? '');
  const [status, setStatus] = useState<string>(initialData?.status ?? DEFAULT_STATUS);
  const [ac, setAc] = useState<ACEntry[]>(
    initialData?.acceptanceCriteria ?? [{ id: uuidv4(), given: '', when: '', then: '' }]
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({ limit: 100 }));
    dispatch(fetchEpics({ projectId, params: { limit: 100 } }));
  }, [dispatch, projectId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErrorMsg('Title is required.'); return; }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit({
        title, asA, iWant, soThat,
        acceptanceCriteria: ac.filter(e => e.given || e.when || e.then),
        priority,
        assigneeId: assigneeId || null,
        epicId: epicId || null,
        status,
      });
    } catch (err: unknown) {
      setErrorMsg((err as { message?: string }).message ?? 'Failed to submit story.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {errorMsg && <Alert severity="error" message={errorMsg} />}

      <Input label="Title *" value={title} onChange={e => setTitle(e.target.value)} required />

      {/* As-a / I-want / So-that template */}
      <fieldset style={{ border: '1px solid var(--color-neutral-200)', borderRadius: 8, padding: '0.75rem', margin: 0 }}>
        <legend style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-600)', padding: '0 0.25rem' }}>
          Description Template
        </legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Input label="As a…" value={asA} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAsA(e.target.value)} placeholder="type of user" />
          <Input label="I want…" value={iWant} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIWant(e.target.value)} placeholder="goal or feature" />
          <TextArea label="So that…" value={soThat} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSoThat(e.target.value)} rows={2} placeholder="benefit or value" />
        </div>
      </fieldset>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Select
          label="Epic"
          value={epicId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEpicId(e.target.value)}
          options={[
            { label: 'No Epic', value: '' },
            ...epics.map((ep: { id: string; name: string }) => ({ label: ep.name, value: ep.id })),
          ]}
        />
        <Select
          label="Assignee"
          value={assigneeId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssigneeId(e.target.value)}
          options={[
            { label: 'Unassigned', value: '' },
            ...users.map((u: { id: string; firstName: string; lastName: string }) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id })),
          ]}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Select
          label="Priority"
          value={priority}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as Priority)}
          options={Object.values(Priority).map(p => ({ label: p, value: p }))}
        />
        {initialData?.id && (
          <Select
            label="Status"
            value={status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
            options={KANBAN_STATUSES.map(s => ({ label: s.label, value: s.id }))}
          />
        )}
      </div>


      <AcceptanceCriteriaEditor entries={ac} onChange={setAc} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
        <Button variant="ghost" type="button" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button variant="primary" type="submit" loading={submitting}>{initialData?.id ? 'Save Changes' : 'Create Story'}</Button>
      </div>
    </form>
  );
};
