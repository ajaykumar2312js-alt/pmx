import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchStories, selectStories, selectStoryStatus, selectStoryMeta, deleteStory } from '../../redux/slices/storySlice';
import { fetchEpics, selectEpics } from '../../redux/slices/epicSlice';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { Table, Spinner, Alert, Pagination, Button, Select, Input, Avatar, Column, ItemStatusDropdown } from '../common';
import { Story } from '../../services/storyService';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../../routes/routePaths';
import { Edit2, Trash2 } from 'lucide-react';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { SubtaskList } from '../subtasks/SubtaskList';
import {
  workflowStatusFilterOptions,
  assigneeFilterOptions,
  epicFilterOptions,
  UNASSIGNED_VALUE,
} from '../../common/filterOptions';

interface StoryListProps {
  projectId: string;
  onCreateStory: () => void;
}

export const StoryList: React.FC<StoryListProps> = ({ projectId, onCreateStory }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const stories = useAppSelector(selectStories);
  const status = useAppSelector(selectStoryStatus);
  const meta = useAppSelector(selectStoryMeta);
  const epics = useAppSelector(selectEpics);
  const users = useAppSelector(selectUsers);

  const [epicFilter, setEpicFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [direction, setDirection] = useState<'next' | 'prev' | undefined>();

  useEffect(() => {
    dispatch(fetchEpics({ projectId, params: { limit: 100 } }));
    dispatch(fetchUsers({ limit: 100 }));
  }, [dispatch, projectId]);

  useEffect(() => {
    dispatch(fetchStories({
      projectId,
      params: {
        limit: 15,
        cursor,
        direction,
        ...(epicFilter ? { epicId: epicFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }
    }));
  }, [dispatch, projectId, epicFilter, statusFilter, cursor, direction]);

  const columns: Column<Story>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <span
          style={{ fontWeight: 600, color: 'var(--color-primary-600)', cursor: 'pointer' }}
          onClick={() => navigate(RoutePaths.STORY_DETAIL(item.id))}
        >
          {item.title}
        </span>
      ),
    },
    {
      key: 'epic',
      header: 'Epic',
      render: (item) => {
        const epic = epics.find(e => e.id === item.epicId);
        return epic
          ? <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary-500)', cursor: 'pointer' }} onClick={() => navigate(RoutePaths.EPIC_DETAIL(epic.id))}>{epic.name}</span>
          : <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.8125rem' }}>—</span>;
      },
    },
    {
      key: 'assignee',
      header: 'Assignee',
      render: (item) => item.assignee ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Avatar name={`${item.assignee.firstName} ${item.assignee.lastName}`} size={24} />
          <span>{item.assignee.firstName} {item.assignee.lastName}</span>
        </div>
      ) : <span style={{ color: 'var(--color-neutral-400)' }}>Unassigned</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <ItemStatusDropdown
          itemId={item.id}
          itemType="STORY"
          status={item.status}
        />
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: () => '—'
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.priority}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(RoutePaths.STORY_DETAIL(item.id)); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-neutral-500)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            title="Edit story"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (!window.confirm(`Delete story "${item.title}"?`)) return;
              try {
                await dispatch(deleteStory(item.id)).unwrap();
                dispatch(enqueueToast({ message: 'Story deleted', severity: 'success' }));
              } catch {
                dispatch(enqueueToast({ message: 'Failed to delete story', severity: 'error' }));
              }
            }}
            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            title="Delete story"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const filtered = stories.filter(s => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (assigneeFilter === UNASSIGNED_VALUE && s.assigneeId) return false;
    if (assigneeFilter && assigneeFilter !== UNASSIGNED_VALUE && s.assigneeId !== assigneeFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Filter toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end', background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid var(--color-neutral-200)' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input label="Search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories…" />
        </div>
        <div style={{ width: '200px' }}>
          <Select
            label="Epic"
            value={epicFilter}
            onChange={e => { setEpicFilter(e.target.value); setCursor(undefined); }}
            options={epicFilterOptions(epics)}
          />
        </div>
        <div style={{ width: '200px' }}>
          <Select
            label="Status"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCursor(undefined); }}
            options={workflowStatusFilterOptions()}
          />
        </div>
        <div style={{ width: '200px' }}>
          <Select
            label="Assignee"
            value={assigneeFilter}
            onChange={e => { setAssigneeFilter(e.target.value); setCursor(undefined); }}
            options={assigneeFilterOptions(users)}
          />
        </div>
        <Button onClick={onCreateStory}>+ </Button>
      </div>

      {status === 'loading' && filtered.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>
      ) : filtered.length === 0 ? (
        <Alert severity="info" message="No stories found. Create the first one!" />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={s => s.id}
          renderRowExpansion={(row) => <SubtaskList parentType="stories" parentId={row.id} />}
        />
      )}

      {meta && (
        <div style={{ marginTop: '1.5rem' }}>
          <Pagination
            meta={meta}
            onNext={() => { setCursor(meta.nextCursor ?? undefined); setDirection('next'); }}
            onPrev={() => { setCursor(meta.prevCursor ?? undefined); setDirection('prev'); }}
          />
        </div>
      )}
    </div>
  );
};
