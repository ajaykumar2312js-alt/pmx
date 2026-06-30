import React, { useEffect, useState } from 'react';
import { Modal, Input, Select, Button, Alert } from '../common';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { createSubtask, updateSubtask } from '../../redux/slices/subtaskSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { SubtaskParentType, Subtask } from '../../services/subtaskService';
import { ChildItemType } from '../../common/enums';

interface SubtaskFormProps {
  parentType: SubtaskParentType;
  parentId: string;
  onClose: () => void;
  onCreated?: () => void;
  /** When provided the form operates in edit mode. */
  subtaskId?: string;
  initialData?: Subtask;
}

// Hierarchy: Story → Subtask/Task/Bug | Task → Subtask/Bug | Bug → Subtask only
const TYPE_OPTIONS_BY_PARENT: Record<SubtaskParentType, { label: string; value: ChildItemType }[]> = {
  stories: [
    { label: '📋 Subtask', value: ChildItemType.SUBTASK },
    { label: '✅ Task',     value: ChildItemType.TASK    },
    { label: '🐛 Bug',     value: ChildItemType.BUG     },
  ],
  tasks: [
    { label: '📋 Subtask', value: ChildItemType.SUBTASK },
    { label: '🐛 Bug',     value: ChildItemType.BUG     },
  ],
  bugs: [
    { label: '📋 Subtask', value: ChildItemType.SUBTASK },
  ],
};

const SEVERITY_OPTIONS = [
  { label: 'Low',      value: 'LOW'      },
  { label: 'Medium',   value: 'MEDIUM'   },
  { label: 'High',     value: 'HIGH'     },
  { label: 'Critical', value: 'CRITICAL' },
];

export const SubtaskForm: React.FC<SubtaskFormProps> = ({
  parentType,
  parentId,
  onClose,
  onCreated,
  subtaskId,
  initialData,
}) => {
  const dispatch    = useAppDispatch();
  const users       = useAppSelector(selectUsers);
  const isEdit      = Boolean(subtaskId);

  const typeOptions = TYPE_OPTIONS_BY_PARENT[parentType];
  const defaultType = typeOptions[0].value;

  const [childItemType,  setChildItemType]  = useState<ChildItemType>(() => {
    const initial = initialData?.childItemType ?? defaultType;
    return typeOptions.some(o => o.value === initial) ? initial : defaultType;
  });
  const [title,          setTitle]          = useState(initialData?.title ?? '');
  const [assigneeId,     setAssigneeId]     = useState(initialData?.assigneeId ?? '');
  const [estimatedHours, setEstimatedHours] = useState(initialData?.estimatedHours != null ? String(initialData.estimatedHours) : '');
  const [dueDate,        setDueDate]        = useState(initialData?.dueDate ?? '');
  const [severity,       setSeverity]       = useState(initialData?.severity ?? '');
  const [error,          setError]          = useState<string | null>(null);
  const [submitting,     setSubmitting]     = useState(false);

  useEffect(() => { dispatch(fetchUsers({ limit: 100 })); }, [dispatch]);

  const isTask    = childItemType === ChildItemType.TASK;
  const isSubtask = childItemType === ChildItemType.SUBTASK;
  const isBug     = childItemType === ChildItemType.BUG;

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        parentType,
        parentId,
        title:          title.trim(),
        assigneeId:     assigneeId || null,
        estimatedHours: (isSubtask || isTask) && estimatedHours ? Number(estimatedHours) : null,
        dueDate:        isTask && dueDate ? dueDate : null,
        severity:       isBug && severity ? severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' : null,
        childItemType,
      };

      if (isEdit && subtaskId) {
        await dispatch(updateSubtask({ id: subtaskId, payload, parentType, parentId })).unwrap();
        dispatch(enqueueToast({ message: 'Child item updated', severity: 'success' }));
      } else {
        await dispatch(createSubtask({ ...payload, status: 'To Do' })).unwrap();
        dispatch(enqueueToast({ message: 'Child item created', severity: 'success' }));
      }

      onCreated?.();
      onClose();
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? `Failed to ${isEdit ? 'update' : 'create'} child item.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Child Item' : 'New Child Item'} isOpen onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <Alert severity="error" message={error} />}

        {/* ── Type selector (disabled in edit mode) ────────────────── */}
        <Select
          label="Type *"
          value={childItemType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            if (isEdit) return;
            setChildItemType(e.target.value as ChildItemType);
            setError(null);
          }}
          options={typeOptions}
          disabled={isEdit}
        />

        {/* ── Common fields ──────────────────────────────────────────── */}
        <Input label="Title *" value={title} onChange={e => setTitle(e.target.value)} required />

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
          value={assigneeId ?? ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssigneeId(e.target.value)}
          options={[
            { label: 'Unassigned', value: '' },
            ...users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id })),
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <Button variant="ghost"   onClick={onClose}       disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}  loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
