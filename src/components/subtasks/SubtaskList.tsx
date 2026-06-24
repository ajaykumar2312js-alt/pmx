import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchSubtasks, selectSubtasks, setSubtaskStatus } from '../../redux/slices/subtaskSlice';
import { Avatar, Button, Spinner, Table, Column } from '../common';
import { ProgressBar, WorkflowStatusDropdown } from '../common/ui';
import { SubtaskForm } from './SubtaskForm';
import { SubtaskParentType, Subtask } from '../../services/subtaskService';
import { ChildItemType } from '../../common/enums';

interface SubtaskListProps {
  parentType: SubtaskParentType;
  parentId: string;
  /** Called after a child item is created/completed so the parent can refresh roll-up %. */
  onChange?: () => void;
}

// ── Type badge config ────────────────────────────────────────────────────────

interface TypeBadgeDef {
  label: string;
  bg:    string;
  color: string;
}

const TYPE_BADGE: Record<string, TypeBadgeDef> = {
  [ChildItemType.SUBTASK]: { label: 'Subtask', bg: '#e0e7ff', color: '#4338ca' },
  [ChildItemType.STORY]:   { label: 'Story',   bg: '#dcfce7', color: '#16a34a' },
  [ChildItemType.TASK]:    { label: 'Task',     bg: '#dbeafe', color: '#1d4ed8' },
  [ChildItemType.BUG]:     { label: 'Bug',      bg: '#fee2e2', color: '#dc2626' },
  [ChildItemType.CUSTOM]:  { label: 'Custom',   bg: '#fef3c7', color: '#b45309' },
};

const getTypeBadge = (item: Subtask): TypeBadgeDef => {
  if (item.childItemType === ChildItemType.CUSTOM) {
    return {
      label: item.customTypeName ?? 'Custom',
      bg:    '#fef3c7',
      color: '#b45309',
    };
  }
  return TYPE_BADGE[item.childItemType] ?? { label: String(item.childItemType), bg: '#f1f5f9', color: '#64748b' };
};



const cycleStatus = (current: string): string =>
  current === 'TODO' ? 'IN_PROGRESS' : current === 'IN_PROGRESS' ? 'DONE' : 'TODO';

/**
 * Reusable child-item list embedded in Story / Task / Bug detail panels.
 * Supports creating children of any type — Subtask, Story, Task, Bug, or Custom.
 */
export const SubtaskList: React.FC<SubtaskListProps> = ({ parentType, parentId, onChange }) => {
  const dispatch  = useAppDispatch();
  const subtasks  = useAppSelector(selectSubtasks(parentType, parentId));
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [isCollapsed,  setIsCollapsed]  = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await dispatch(fetchSubtasks({ parentType, parentId }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch, parentType, parentId]);

  const doneCount = subtasks.filter(s => s.status === 'DONE').length;
  const pct       = subtasks.length ? Math.round((doneCount / subtasks.length) * 100) : 0;

  const handleToggle = async (id: string, current: string) => {
    await dispatch(setSubtaskStatus({ id, status: cycleStatus(current), parentType, parentId })).unwrap();
    onChange?.();
  };

  const columns: Column<Subtask>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (item) => {
        const badge = getTypeBadge(item);
        const isDone = item.status === 'DONE';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
            <input
              type="checkbox"
              checked={isDone}
              onChange={(e) => {
                e.stopPropagation();
                handleToggle(item.id, item.status);
              }}
              aria-label={`Toggle status for ${item.title}`}
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                flexShrink: 0,
                padding: '0.125rem 0.5rem',
                borderRadius: 9999,
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                background: badge.bg,
                color: badge.color,
                whiteSpace: 'nowrap',
              }}
            >
              {badge.label}
            </span>
            <span
              style={{
                fontSize: '0.9375rem',
                textDecoration: isDone ? 'line-through' : 'none',
                color: isDone ? 'var(--color-neutral-400)' : 'inherit',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.title}
            </span>
          </div>
        );
      }
    },
    {
      key: 'assignee',
      header: 'Assignee',
      render: (item) => item.assignee ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Avatar name={`${item.assignee.firstName} ${item.assignee.lastName}`} size={24} />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-700)' }}>
            {item.assignee.firstName} {item.assignee.lastName}
          </span>
        </div>
      ) : (
        <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>Unassigned</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <WorkflowStatusDropdown
          value={item.status}
          onChange={(newVal) => {
            dispatch(setSubtaskStatus({ id: item.id, status: newVal as string, parentType, parentId })).unwrap().then(() => onChange?.());
          }}
        />
      )
    },
    {
      key: 'meta',
      header: 'Priority / Meta',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {item.childItemType === ChildItemType.BUG && item.severity && (
            <span style={{ fontSize: '0.8125rem', color: '#dc2626', fontWeight: 600 }}>
              {item.severity}
            </span>
          )}
          {item.childItemType === ChildItemType.TASK && item.estimatedHours != null && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              {item.estimatedHours}h
            </span>
          )}
          {(!item.severity && item.estimatedHours == null) && (
            <span style={{ color: 'var(--color-neutral-400)' }}>—</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Child Items</span>
          {subtasks.length > 0 && (
            <span style={{ color: 'var(--color-neutral-500)', fontWeight: 400 }}>
              ({doneCount}/{subtasks.length})
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-600)', fontWeight: 500 }}>
            {isCollapsed ? '(Show)' : '(Hide)'}
          </span>
        </h4>
        <div onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
            <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add
          </Button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      {!isCollapsed && (
        <>
          {subtasks.length > 0 && <ProgressBar percent={pct} label="Completion" />}

          <Table
            columns={columns}
            data={subtasks}
            keyExtractor={(s) => s.id}
            loading={loading}
            emptyMessage="No child items yet. Click Add to create one."
          />
        </>
      )}

      {/* ── Create form modal ───────────────────────────────────────── */}
      {showForm && (
        <SubtaskForm
          parentType={parentType}
          parentId={parentId}
          onClose={() => setShowForm(false)}
          onCreated={onChange}
        />
      )}
    </div>
  );
};
