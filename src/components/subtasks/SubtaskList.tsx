import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchSubtasks, selectSubtasks, setSubtaskStatus, deleteSubtask } from '../../redux/slices/subtaskSlice';
import { Avatar, Button, Table, Column, ItemStatusDropdown } from '../common';
import { ProgressBar } from '../common/ui';
import { SubtaskForm } from './SubtaskForm';
import { enqueueToast } from '../../redux/slices/uiSlice';
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
  [ChildItemType.TASK]:    { label: 'Task',     bg: '#dbeafe', color: '#1d4ed8' },
  [ChildItemType.BUG]:     { label: 'Bug',      bg: '#fee2e2', color: '#dc2626' },
};

const getTypeBadge = (item: Subtask): TypeBadgeDef =>
  TYPE_BADGE[item.childItemType] ?? { label: String(item.childItemType), bg: '#f1f5f9', color: '#64748b' };



const cycleStatus = (current: string): string =>
  current === 'Done' ? 'To Do' : 'Done';

/**
 * Reusable child-item list embedded in Story / Task / Bug detail panels.
 * Supports creating children of any type — Subtask, Story, Task, Bug, or Custom.
 */
export const SubtaskList: React.FC<SubtaskListProps> = ({ parentType, parentId, onChange }) => {
  const dispatch  = useAppDispatch();
  const subtasks  = useAppSelector(selectSubtasks(parentType, parentId));
  const [loading,        setLoading]        = useState(true);
  const [showForm,       setShowForm]       = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [isCollapsed,    setIsCollapsed]    = useState(false);

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

  const doneCount = subtasks.filter(s => s.status === 'Done').length;
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
        const isDone = item.status === 'Done';
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
        <ItemStatusDropdown
          itemId={item.id}
          itemType="SUBTASK"
          status={item.status}
          parentType={parentType}
          parentId={parentId}
          onStatusChange={onChange}
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
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
          <button
            onClick={() => setEditingSubtask(item)}
            style={{
              background: 'none', border: 'none', color: 'var(--color-neutral-500)',
              cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center'
            }}
            title={`Edit ${item.childItemType}`}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={async () => {
              if (window.confirm(`Are you sure you want to delete ${item.childItemType} "${item.title}"?`)) {
                try {
                  await dispatch(deleteSubtask({ id: item.id, parentType, parentId })).unwrap();
                  dispatch(enqueueToast({ message: `${item.childItemType} deleted`, severity: 'success' }));
                  onChange?.();
                } catch (err: unknown) {
                  dispatch(enqueueToast({ message: (err as string) || `Failed to delete ${item.childItemType}`, severity: 'error' }));
                }
              }
            }}
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-danger)',
              cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center'
            }}
            title={`Delete ${item.childItemType}`}
          >
            <Trash2 size={16} />
          </button>
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

      {/* ── Edit form modal ─────────────────────────────────────────── */}
      {editingSubtask && (
        <SubtaskForm
          parentType={parentType}
          parentId={parentId}
          subtaskId={editingSubtask.id}
          initialData={editingSubtask}
          onClose={() => setEditingSubtask(null)}
          onCreated={onChange}
        />
      )}
    </div>
  );
};
