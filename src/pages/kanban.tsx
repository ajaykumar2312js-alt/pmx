import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchStories, selectStories, changeStoryStatus } from '../redux/slices/storySlice';
import { fetchTasks, selectTasks, updateTaskStatus } from '../redux/slices/taskSlice';
import { fetchBugs, selectBugs, updateBug } from '../redux/slices/bugSlice';
import { selectActiveProject, updateProject } from '../redux/slices/projectSlice';
import { KanbanBoard, BoardColumn } from '../components/common';
import { Card, Alert, Button, Avatar } from '../components/common';
import { LayoutDashboard, Plus, Edit2, Check, X } from 'lucide-react';

interface KanbanItem {
  id: string;
  title: string;
  type: 'STORY' | 'TASK' | 'BUG';
  status: string;
  assignee?: { firstName: string; lastName: string; avatarUrl?: string };
  priority?: string;
}

const KanbanPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(selectActiveProject);
  const activeProjectId = activeProject?.id;

  const stories = useAppSelector(selectStories);
  const tasks = useAppSelector(selectTasks);
  const bugs = useAppSelector(selectBugs);

  const [localItems, setLocalItems] = useState<KanbanItem[]>([]);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState('');

  useEffect(() => {
    if (activeProjectId) {
      dispatch(fetchStories({ projectId: activeProjectId, params: { limit: 100 } }));
      dispatch(fetchTasks({ projectId: activeProjectId, params: { limit: 100 } }));
      dispatch(fetchBugs({ projectId: activeProjectId, params: { limit: 100 } }));
    }
  }, [dispatch, activeProjectId]);

  useEffect(() => {
    const combined: KanbanItem[] = [
      ...stories.map(s => ({ ...s, type: 'STORY' as const })),
      ...tasks.map(t => ({ ...t, type: 'TASK' as const })),
      ...bugs.map(b => ({ ...b, type: 'BUG' as const }))
    ];
    setLocalItems(combined);
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

  const columns: BoardColumn<KanbanItem>[] = (activeProject.workflowStatuses || []).map(ws => ({
    id: ws.id,
    title: ws.label,
    items: localItems.filter(i => i.status === ws.id)
  }));

  const handleMove = (itemId: string, fromColId: string, toColId: string) => {
    if (fromColId === toColId) return;

    setLocalItems(prev => prev.map(item => item.id === itemId ? { ...item, status: toColId } : item));
    
    const item = localItems.find(i => i.id === itemId);
    if (!item) return;

    if (item.type === 'STORY') {
      dispatch(changeStoryStatus({ id: itemId, status: toColId }));
    } else if (item.type === 'TASK') {
      dispatch(updateTaskStatus({ id: itemId, status: toColId }));
    } else if (item.type === 'BUG') {
      dispatch(updateBug({ id: itemId, payload: { status: toColId } }));
    }
  };

  const handleSaveEdit = (statusId: string) => {
    if (!editLabel.trim()) {
      setEditingColumnId(null);
      return;
    }
    const newStatuses = activeProject.workflowStatuses.map(s => 
      s.id === statusId ? { ...s, label: editLabel.trim() } : s
    );
    dispatch(updateProject({ id: activeProject.id, payload: { workflowStatuses: newStatuses } }));
    setEditingColumnId(null);
  };

  const handleAddStatus = () => {
    if (!newStatusLabel.trim()) {
      setIsAddingStatus(false);
      return;
    }
    const newId = newStatusLabel.trim().toUpperCase().replace(/\s+/g, '_');
    const newStatus = {
      id: newId,
      label: newStatusLabel.trim(),
      category: 'TODO' as any,
      color: '#dfe1e6',
      order: activeProject.workflowStatuses.length + 1
    };
    dispatch(updateProject({ id: activeProject.id, payload: { workflowStatuses: [...activeProject.workflowStatuses, newStatus] } }));
    setIsAddingStatus(false);
    setNewStatusLabel('');
  };

  const renderCard = (item: KanbanItem) => (
    <Card style={{ padding: '1rem', marginBottom: '0.75rem', cursor: 'grab', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' }}>
          {item.type}
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: item.priority === 'CRITICAL' || item.priority === 'HIGH' ? '#de350b' : 'var(--color-neutral-500)' }}>
          {item.priority}
        </span>
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-primary-700)' }}>
        {item.title}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {item.assignee ? (
          <Avatar name={`${item.assignee.firstName} ${item.assignee.lastName}`} size={24} />
        ) : (
          <Avatar name="Unassigned" size={24} />
        )}
      </div>
    </Card>
  );

  const renderColumn = (col: BoardColumn<KanbanItem>, children: React.ReactNode) => {
    const isEditing = editingColumnId === col.id;
    return (
      <div key={col.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', minWidth: '300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <input
                autoFocus
                value={editLabel}
                onChange={e => setEditLabel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveEdit(col.id);
                  if (e.key === 'Escape') setEditingColumnId(null);
                }}
                style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-neutral-300)' }}
              />
              <button onClick={() => handleSaveEdit(col.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success-600)' }}><Check size={16} /></button>
              <button onClick={() => setEditingColumnId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger-600)' }}><X size={16} /></button>
            </div>
          ) : (
            <>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {col.title}
                <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#64748b' }}>
                  {col.items.length}
                </span>
              </h3>
              <button 
                onClick={() => { setEditingColumnId(col.id); setEditLabel(col.title); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-500)' }}
              >
                <Edit2 size={16} />
              </button>
            </>
          )}
        </div>
        {children}
      </div>
    );
  };

  const appendContent = (
    <div style={{ minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
      {isAddingStatus ? (
        <Card style={{ padding: '16px', background: '#f8fafc' }}>
          <input
            autoFocus
            placeholder="Status name..."
            value={newStatusLabel}
            onChange={e => setNewStatusLabel(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddStatus();
              if (e.key === 'Escape') setIsAddingStatus(false);
            }}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid var(--color-neutral-300)' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setIsAddingStatus(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddStatus}>Save</Button>
          </div>
        </Card>
      ) : (
        <button
          onClick={() => setIsAddingStatus(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '16px',
            background: 'rgba(255,255,255,0.5)', border: '2px dashed var(--color-neutral-300)',
            borderRadius: '8px', color: 'var(--color-neutral-600)', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 600, justifyContent: 'center'
          }}
        >
          <Plus size={20} /> Add Status
        </button>
      )}
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={28} /> Kanban Board
        </h1>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Active execution board for <strong>{activeProject.name}</strong>. Drag and drop items or customize workflow columns.
        </p>
      </div>

      <KanbanBoard
        columns={columns}
        keyExtractor={item => item.id}
        onMove={handleMove}
        renderCard={renderCard}
        renderColumn={renderColumn}
        appendContent={appendContent}
      />
    </div>
  );
};

export default KanbanPage;
