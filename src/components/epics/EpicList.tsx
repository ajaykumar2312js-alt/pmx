import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchEpics, selectEpics, selectEpicStatus, selectEpicMeta, updateEpic } from '../../redux/slices/epicSlice';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { fetchStories, selectStories } from '../../redux/slices/storySlice';
import { fetchTasks, selectTasks } from '../../redux/slices/taskSlice';
import { Table, Button, ProgressBar, Spinner, Alert, Pagination, Select, Input, StatusDropdown } from '../common';
import { Epic } from '../../services/epicService';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../../routes/routePaths';
import { EpicChildrenList } from './EpicChildrenList';

interface EpicListProps {
  projectId: string;
  onEditEpic: (epic: Epic) => void;
}

export const EpicList: React.FC<EpicListProps> = ({ projectId, onEditEpic }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const epics = useAppSelector(selectEpics);
  const status = useAppSelector(selectEpicStatus);
  const meta = useAppSelector(selectEpicMeta);
  const users = useAppSelector(selectUsers);
  const stories = useAppSelector(selectStories);
  const tasks = useAppSelector(selectTasks);

  const [cursor, setCursor] = useState<string | undefined>();
  const [direction, setDirection] = useState<'next' | 'prev' | undefined>();
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchEpics({ projectId, params: { cursor, direction, limit: 10 } }));
    dispatch(fetchUsers({ limit: 100 }));
    dispatch(fetchStories({ projectId, params: { limit: 1000 } })); // load many for filtering
    dispatch(fetchTasks({ projectId, params: { limit: 1000 } }));
  }, [dispatch, projectId, cursor, direction]);

  if (status === 'loading' && epics.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>;
  }

  const columns = [
    { 
      key: 'name', 
      header: 'Name',
      render: (item: Epic) => (
        <span 
          style={{ fontWeight: 600, color: 'var(--color-primary-600)', cursor: 'pointer' }}
          onClick={() => navigate(RoutePaths.EPIC_DETAIL(item.id))}
        >
          {item.name}
        </span>
      )
    },
    { 
      key: 'owner', 
      header: 'Owner',
      render: (item: Epic) => item.owner ? `${item.owner.firstName} ${item.owner.lastName}` : 'Unassigned'
    },
    { 
      key: 'targetRelease', 
      header: 'Target Release',
      render: (item: Epic) => item.targetRelease ? new Date(item.targetRelease).toLocaleDateString() : '-'
    },
    { 
      key: 'progress', 
      header: 'Progress',
      render: (item: Epic) => (
        <div style={{ width: '150px' }}>
          <ProgressBar percent={item.completionPercentage} />
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (item: Epic) => (
        <StatusDropdown
          value={item.status}
          options={[
            { label: 'Open', value: 'Open' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Done', value: 'Done' }
          ]}
          onChange={(newVal) => {
            dispatch(updateEpic({ id: item.id, payload: { status: newVal as Epic['status'] } }));
          }}
          colorMap={{
            'Open': { bg: 'var(--color-primary-100)', color: 'var(--color-primary-700)' },
            'In Progress': { bg: 'var(--color-warning-100)', color: 'var(--color-warning-700)' },
            'Done': { bg: 'var(--color-success-100)', color: 'var(--color-success-700)' },
          }}
        />
      )
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (item: Epic) => (
        <Button variant="secondary" size="sm" onClick={() => onEditEpic(item)}>
          Edit
        </Button>
      )
    }
  ];

  const filteredEpics = epics.filter(epic => {
    if (search && !epic.name.toLowerCase().includes(search.toLowerCase())) return false;
    
    if (assigneeFilter === 'UNASSIGNED') {
      const isEpicUnassigned = !epic.ownerId;
      const hasUnassignedStory = stories.some(s => s.epicId === epic.id && !s.assigneeId);
      const hasUnassignedTask = tasks.some(t => t.epicId === epic.id && !t.assigneeId);
      if (!isEpicUnassigned && !hasUnassignedStory && !hasUnassignedTask) return false;
    } else if (assigneeFilter) {
      const isEpicAssigned = epic.ownerId === assigneeFilter;
      const hasAssignedStory = stories.some(s => s.epicId === epic.id && s.assigneeId === assigneeFilter);
      const hasAssignedTask = tasks.some(t => t.epicId === epic.id && t.assigneeId === assigneeFilter);
      if (!isEpicAssigned && !hasAssignedStory && !hasAssignedTask) return false;
    }
    
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end', background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid var(--color-neutral-200)' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>Search</label>
          <Input label="" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search epics…" />
        </div>
        <div style={{ width: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>Assignee (Epics & Children)</label>
          <Select
            label=""
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            options={[
              { label: 'All Assignees', value: '' },
              { label: 'Unassigned', value: 'UNASSIGNED' },
              ...users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))
            ]}
          />
        </div>
      </div>

      {filteredEpics.length === 0 ? (
        <Alert severity="info" message="No epics found for this project." />
      ) : (
        <Table 
          columns={columns} 
          data={filteredEpics} 
          keyExtractor={(e) => e.id} 
          renderRowExpansion={(row) => <EpicChildrenList epicId={row.id} />}
        />
      )}

      {meta && (
        <div style={{ marginTop: '1.5rem' }}>
          <Pagination 
            meta={meta}
            onNext={() => { setCursor(meta.nextCursor || undefined); setDirection('next'); }}
            onPrev={() => { setCursor(meta.prevCursor || undefined); setDirection('prev'); }}
          />
        </div>
      )}
    </div>
  );
};
