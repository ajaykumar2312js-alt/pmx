import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchStories, selectStories, changeStoryStatus, deleteStory } from '../redux/slices/storySlice';
import { fetchTasks, selectTasks, updateTaskStatus, deleteTask } from '../redux/slices/taskSlice';
import { fetchBugs, selectBugs, updateBug, deleteBug } from '../redux/slices/bugSlice';
import { selectActiveProject } from '../redux/slices/projectSlice';
import { KanbanBoard, BoardColumn } from '../components/common';
import { Card, Alert, Button, Avatar } from '../components/common';
import { LayoutDashboard, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../routes/routePaths';
import { enqueueToast } from '../redux/slices/uiSlice';
import { KANBAN_STATUSES } from '../common/kanbanStatuses';

// Map legacy status codes to canonical Kanban status IDs
const LEGACY_STATUS_MAP: Record<string, string> = {
  TODO:               'To Do',
  IN_PROGRESS:        'In Progress',
  IN_REVIEW:          'In Review',
  DONE:               'Done',
  Open:               'To Do',
  Fixed:              'Done',
  'Ready for Retest': 'Done',
  Closed:             'Done',
  Reopened:           'In Progress',
};

const normalizeStatus = (status: string): string =>
  LEGACY_STATUS_MAP[status] ?? status;

interface KanbanItem {
  id: string;
  title: string;
  type: 'STORY' | 'TASK' | 'BUG';
  status: string;
  assignee?: { firstName: string; lastName: string; avatarUrl?: string };
  priority?: string;
}

const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  STORY: { bg: '#dcfce7', color: '#16a34a' },
  TASK:  { bg: '#dbeafe', color: '#1d4ed8' },
  BUG:   { bg: '#fee2e2', color: '#dc2626' },
};

const PRIORITY_COLOR = (p?: string) =>
  p === 'CRITICAL' || p === 'HIGH' ? '#dc2626' : 'var(--color-neutral-500)';

const KanbanPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activeProject = useAppSelector(selectActiveProject);
  const activeProjectId = activeProject?.id;

  const stories = useAppSelector(selectStories);
  const tasks   = useAppSelector(selectTasks);
  const bugs    = useAppSelector(selectBugs);

  const [localItems, setLocalItems] = useState<KanbanItem[]>([]);

  useEffect(() => {
    if (activeProjectId) {
      dispatch(fetchStories({ projectId: activeProjectId, params: { limit: 200 } }));
      dispatch(fetchTasks  ({ projectId: activeProjectId, params: { limit: 200 } }));
      dispatch(fetchBugs   ({ projectId: activeProjectId, params: { limit: 200 } }));
    }
  }, [dispatch, activeProjectId]);

  useEffect(() => {
    setLocalItems([
      ...stories.map(s => ({ ...s, type: 'STORY' as const, status: normalizeStatus(s.status) })),
      ...tasks  .map(t => ({ ...t, type: 'TASK'  as const, status: normalizeStatus(t.status) })),
      ...bugs   .map(b => ({ ...b, type: 'BUG'   as const, status: normalizeStatus(b.status) })),
    ]);
  }, [stories, tasks, bugs]);

  if (!activeProject) {
    return (
      <div className="page-container">
        <Alert severity="warning" message="Please select an active project from the sidebar to view the Kanban board." />
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={() => window.location.href = '/projects'}>Go to Projects</Button>
        </div>
      </div>
    );
  }

  const columns: BoardColumn<KanbanItem>[] = KANBAN_STATUSES.map(ks => ({
    id: ks.id,
    title: ks.label,
    items: localItems.filter(i => i.status === ks.id),
  }));

  const handleMove = (itemId: string, fromColId: string, toColId: string) => {
    if (fromColId === toColId) return;
    setLocalItems(prev => prev.map(i => i.id === itemId ? { ...i, status: toColId } : i));
    const item = localItems.find(i => i.id === itemId);
    if (!item) return;
    if (item.type === 'STORY') dispatch(changeStoryStatus({ id: itemId, status: toColId }));
    else if (item.type === 'TASK') dispatch(updateTaskStatus({ id: itemId, status: toColId }));
    else if (item.type === 'BUG') dispatch(updateBug({ id: itemId, payload: { status: toColId } }));
  };

  const renderCard = (item: KanbanItem) => {
    const ts = TYPE_STYLES[item.type] ?? { bg: '#f1f5f9', color: '#475569' };
    return (
      <Card style={{ flex: 1, minWidth: 0, padding: '0.875rem', marginBottom: '0.625rem', cursor: 'grab', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: ts.bg, color: ts.color, letterSpacing: '0.03em' }}>
            {item.type}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: PRIORITY_COLOR(item.priority) }}>
            {item.priority}
          </span>
        </div>

        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-neutral-900)', lineHeight: 1.4, marginBottom: '0.875rem' }}>
          {item.title}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button
              onClick={e => {
                e.stopPropagation();
                if (item.type === 'STORY') navigate(RoutePaths.STORY_DETAIL(item.id));
                else if (item.type === 'TASK') navigate(RoutePaths.TASK_DETAIL(item.id));
                else if (item.type === 'BUG') navigate(RoutePaths.BUG_DETAIL(item.id));
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', padding: 2, display: 'flex' }}
              title="Open detail"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={async e => {
                e.stopPropagation();
                if (!window.confirm(`Delete ${item.type} "${item.title}"?`)) return;
                try {
                  if (item.type === 'STORY') await dispatch(deleteStory(item.id)).unwrap();
                  else if (item.type === 'TASK') await dispatch(deleteTask(item.id)).unwrap();
                  else if (item.type === 'BUG') await dispatch(deleteBug(item.id)).unwrap();
                  dispatch(enqueueToast({ message: `${item.type} deleted`, severity: 'success' }));
                } catch {
                  dispatch(enqueueToast({ message: `Failed to delete ${item.type}`, severity: 'error' }));
                }
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 2, display: 'flex' }}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
          {item.assignee ? (
            <Avatar name={`${item.assignee.firstName} ${item.assignee.lastName}`} size={22} />
          ) : (
            <Avatar name="?" size={22} />
          )}
        </div>
      </Card>
    );
  };

  const renderColumn = (col: BoardColumn<KanbanItem>, children: React.ReactNode) => {
    const ks = KANBAN_STATUSES.find(s => s.id === col.id);
    return (
      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, minWidth: 280, maxWidth: 320, flex: '1 1 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span
            style={{
              display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
              background: ks?.color.bg ?? '#e2e8f0',
              border: `2px solid ${ks?.color.text ?? '#94a3b8'}`,
              flexShrink: 0,
            }}
          />
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-800)', flex: 1 }}>
            {col.title}
          </h3>
          <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: 12, color: '#64748b', fontWeight: 600 }}>
            {col.items.length}
          </span>
        </div>
        {children}
      </div>
    );
  };

  return (
    <div className="page-container" style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={28} /> Kanban Board
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Active execution board for <strong>{activeProject.name}</strong>. Drag cards between columns to update status.
        </p>
      </div>

      <KanbanBoard
        columns={columns}
        keyExtractor={item => item.id}
        onMove={handleMove}
        renderCard={renderCard}
        renderColumn={renderColumn}
      />
    </div>
  );
};

export default KanbanPage;
