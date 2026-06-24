import React, { useEffect, useState } from 'react';
import { Modal, Input, Select, Button, Alert } from '../common';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { createSubtask } from '../../redux/slices/subtaskSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { SubtaskParentType } from '../../services/subtaskService';
import { ChildItemType } from '../../common/enums';

interface SubtaskFormProps {
  parentType: SubtaskParentType;
  parentId: string;
  onClose: () => void;
  onCreated?: () => void;
}

const TYPE_OPTIONS = [
  { label: '📋 Subtask',      value: ChildItemType.SUBTASK },
  { label: '📖 Story',        value: ChildItemType.STORY   },
  { label: '✅ Task',          value: ChildItemType.TASK    },
  { label: '🐛 Bug',          value: ChildItemType.BUG     },
  { label: '✏️  Custom type…', value: ChildItemType.CUSTOM  },
];

const SEVERITY_OPTIONS = [
  { label: 'Low',      value: 'LOW'      },
  { label: 'Medium',   value: 'MEDIUM'   },
  { label: 'High',     value: 'HIGH'     },
  { label: 'Critical', value: 'CRITICAL' },
];

export const SubtaskForm: React.FC<SubtaskFormProps> = ({ parentType, parentId, onClose, onCreated }) => {
  const dispatch    = useAppDispatch();
  const users       = useAppSelector(selectUsers);

  const [childItemType,  setChildItemType]  = useState<string>(ChildItemType.SUBTASK);
  const [customTypeName, setCustomTypeName] = useState('');
  const [title,          setTitle]          = useState('');
  const [assigneeId,     setAssigneeId]     = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [dueDate,        setDueDate]        = useState('');
  const [severity,       setSeverity]       = useState('');
  const [asA,            setAsA]            = useState('');
  const [iWant,          setIWant]          = useState('');
  const [soThat,         setSoThat]         = useState('');
  const [error,          setError]          = useState<string | null>(null);
  const [submitting,     setSubmitting]     = useState(false);

  useEffect(() => { dispatch(fetchUsers({ limit: 100 })); }, [dispatch]);

  const isStory   = childItemType === ChildItemType.STORY;
  const isTask    = childItemType === ChildItemType.TASK;
  const isSubtask = childItemType === ChildItemType.SUBTASK;
  const isBug     = childItemType === ChildItemType.BUG;
  const isCustom  = childItemType === ChildItemType.CUSTOM;

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (isCustom && !customTypeName.trim()) { setError('Custom type name is required.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      await dispatch(createSubtask({
        parentType,
        parentId,
        title:          title.trim(),
        assigneeId:     assigneeId || null,
        estimatedHours: (isSubtask || isTask) && estimatedHours ? Number(estimatedHours) : null,
        dueDate:        isTask && dueDate ? dueDate : null,
        severity:       isBug && severity ? severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' : null,
        asA:            isStory ? asA || null : null,
        iWant:          isStory ? iWant || null : null,
        soThat:         isStory ? soThat || null : null,
        status:         'TODO',
        childItemType,
        customTypeName: isCustom ? customTypeName.trim() : null,
      })).unwrap();
      dispatch(enqueueToast({ message: 'Child item created', severity: 'success' }));
      onCreated?.();
      onClose();
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Failed to create child item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New Child Item" isOpen onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <Alert severity="error" message={error} />}

        {/* ── Type selector ─────────────────────────────────────────── */}
        <Select
          label="Type *"
          value={childItemType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setChildItemType(e.target.value);
            setError(null);
          }}
          options={TYPE_OPTIONS}
        />

        {/* Custom type name input (shown only for CUSTOM) */}
        {isCustom && (
          <Input
            label="Custom type name *"
            value={customTypeName}
            onChange={e => setCustomTypeName(e.target.value)}
            placeholder="e.g. Design Review, Research Spike…"
          />
        )}

        {/* ── Common fields ──────────────────────────────────────────── */}
        <Input label="Title *" value={title} onChange={e => setTitle(e.target.value)} required />

        {/* ── Story-specific fields ──────────────────────────────────── */}
        {isStory && (
          <div
            style={{
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
              padding: '1rem', borderRadius: 8,
              background: 'var(--color-primary-50, #eff6ff)',
              border: '1px solid var(--color-primary-200, #bfdbfe)',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary-700, #1d4ed8)' }}>
              Story template
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ width: 56, paddingTop: 6, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-500)', flexShrink: 0 }}>As a</span>
              <Input
                value={asA}
                onChange={e => setAsA(e.target.value)}
                placeholder="user role…"
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ width: 56, paddingTop: 6, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-500)', flexShrink: 0 }}>I want</span>
              <Input
                value={iWant}
                onChange={e => setIWant(e.target.value)}
                placeholder="to do something…"
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ width: 56, paddingTop: 6, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-500)', flexShrink: 0 }}>So that</span>
              <Input
                value={soThat}
                onChange={e => setSoThat(e.target.value)}
                placeholder="I achieve a goal…"
                style={{ flex: 1 }}
              />
            </div>
          </div>
        )}

        {/* ── Task / Subtask extra fields ────────────────────────────── */}
        {(isTask || isSubtask) && (
          <div style={{ display: 'grid', gridTemplateColumns: isTask ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <Input
              label="Estimated Hours"
              type="number"
              min={0}
              value={estimatedHours}
              onChange={e => setEstimatedHours(e.target.value)}
            />
            {isTask && (
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            )}
          </div>
        )}

        {/* ── Bug extra fields ───────────────────────────────────────── */}
        {isBug && (
          <Select
            label="Severity"
            value={severity}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSeverity(e.target.value)}
            options={[{ label: 'Select severity…', value: '' }, ...SEVERITY_OPTIONS]}
          />
        )}

        {/* ── Assignee (all types) ───────────────────────────────────── */}
        <Select
          label="Assignee"
          value={assigneeId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssigneeId(e.target.value)}
          options={[
            { label: 'Unassigned', value: '' },
            ...users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id })),
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <Button variant="ghost"   onClick={onClose}       disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}  loading={submitting}>Create</Button>
        </div>
      </div>
    </Modal>
  );
};
