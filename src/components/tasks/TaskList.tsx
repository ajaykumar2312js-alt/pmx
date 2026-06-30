import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchTasks, selectTasks, selectTaskMeta, selectTaskStatus } from '../../redux/slices/taskSlice';
import { selectActiveProject } from '../../redux/slices/projectSlice';
import { fetchEpics, selectEpics } from '../../redux/slices/epicSlice';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { Table, Button, Avatar, Select, Column, Pagination, Input, ItemStatusDropdown } from '../common/ui';
import { Edit2, Trash2 } from 'lucide-react';
import { workflowStatusFilterOptions, assigneeFilterOptions, epicFilterOptions, UNASSIGNED_VALUE } from '../../common/filterOptions';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../../routes/routePaths';
import { TaskForm } from './TaskForm';
import { Modal } from '../common/ui';
import { createTask, deleteTask } from '../../redux/slices/taskSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { TaskPayload, Task } from '../../services/taskService';
import { SubtaskList } from '../subtasks/SubtaskList';

interface TaskListProps {
  projectId: string;
}

export const TaskList: React.FC<TaskListProps> = ({ projectId }) => {
  const activeProject = useAppSelector(selectActiveProject);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const tasks = useAppSelector(selectTasks);
  const meta = useAppSelector(selectTaskMeta);
  const status = useAppSelector(selectTaskStatus);
  const epics = useAppSelector(selectEpics);
  const users = useAppSelector(selectUsers);
  
  const [isCreating, setIsCreating] = useState(false);
  const [epicFilter, setEpicFilter] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [direction, setDirection] = useState<'next' | 'prev' | undefined>();

  useEffect(() => {
    dispatch(fetchEpics({ projectId, params: { limit: 100 } }));
    dispatch(fetchUsers({ limit: 100 }));
  }, [dispatch, projectId]);

  useEffect(() => {
    dispatch(fetchTasks({
      projectId,
      params: {
        limit: 20,
        cursor,
        direction,
        status: filterStatus || undefined,
      }
    }));
  }, [dispatch, projectId, filterStatus, cursor, direction]);

  const handleCreateSubmit = async (payload: TaskPayload) => {
    await dispatch(createTask({ projectId, payload })).unwrap();
    dispatch(enqueueToast({ message: 'Task created successfully', severity: 'success' }));
    setIsCreating(false);
  };

  const columns: Column<Task>[] = [
    { 
      key: 'title', 
      header: 'Title', 
      render: (row) => (
        <span 
          style={{ fontWeight: 600, color: 'var(--color-primary-600)', cursor: 'pointer' }}
          onClick={() => navigate(RoutePaths.TASK_DETAIL(row.id))}
        >
          {row.title}
        </span>
      ) 
    },
    {
      key: 'epic',
      header: 'Epic',
      render: (row) => {
        const epic = epics.find(e => e.id === row.epicId);
        return epic
          ? <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary-500)', cursor: 'pointer' }} onClick={() => navigate(RoutePaths.EPIC_DETAIL(epic.id))}>{epic.name}</span>
          : <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.8125rem' }}>—</span>;
      }
    },
    { 
      key: 'assignee', 
      header: 'Assignee', 
      render: (row) => row.assignee ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Avatar name={`${row.assignee.firstName} ${row.assignee.lastName}`} size={24} />
          <span>{row.assignee.firstName} {row.assignee.lastName}</span>
        </div>
      ) : <span style={{ color: 'var(--color-neutral-400)' }}>Unassigned</span>
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (row) => {
        return (
          <ItemStatusDropdown
            itemId={row.id}
            itemType="TASK"
            status={row.status}
          />
        );
      }
    },
    { 
      key: 'dueDate', 
      header: 'Due Date', 
      render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '—'
    },
    {
      key: 'priority',
      header: 'Priority',
      render: () => '—'
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(RoutePaths.TASK_DETAIL(row.id)); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-neutral-500)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            title="Edit task"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (!window.confirm(`Delete task "${row.title}"?`)) return;
              try {
                await dispatch(deleteTask(row.id)).unwrap();
                dispatch(enqueueToast({ message: 'Task deleted', severity: 'success' }));
              } catch {
                dispatch(enqueueToast({ message: 'Failed to delete task', severity: 'error' }));
              }
            }}
            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            title="Delete task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const filteredTasks = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (epicFilter && t.epicId !== epicFilter) return false;
    if (assigneeFilter === UNASSIGNED_VALUE && t.assigneeId) return false;
    if (assigneeFilter && assigneeFilter !== UNASSIGNED_VALUE && t.assigneeId !== assigneeFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Tasks</h2>
        <Button variant="primary" onClick={() => setIsCreating(true)}>Create Task</Button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end', background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid var(--color-neutral-200)' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input label="Search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" />
        </div>
        <div style={{ width: '200px' }}>
          <Select
            label="Epic"
            value={epicFilter}
            onChange={e => setEpicFilter(e.target.value)}
            options={epicFilterOptions(epics)}
          />
        </div>
        <div style={{ width: '200px' }}>
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCursor(undefined);
              setDirection(undefined);
            }}
            options={workflowStatusFilterOptions()}
          />
        </div>
        <div style={{ width: '200px' }}>
          <Select
            label="Assignee"
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            options={assigneeFilterOptions(users)}
          />
        </div>
      </div>

      <Table 
        columns={columns} 
        data={filteredTasks} 
        keyExtractor={(row) => row.id}
        loading={status === 'loading'}
        renderRowExpansion={(row) => <SubtaskList parentType="tasks" parentId={row.id} />}
      />
      <Pagination
        meta={meta}
        onNext={() => { setCursor(meta?.nextCursor ?? undefined); setDirection('next'); }}
        onPrev={() => { setCursor(meta?.prevCursor ?? undefined); setDirection('prev'); }}
      />

      {isCreating && (
        <Modal title="Create Task" isOpen onClose={() => setIsCreating(false)}>
          <TaskForm 
            projectId={projectId} 
            onSubmit={handleCreateSubmit} 
            onCancel={() => setIsCreating(false)} 
          />
        </Modal>
      )}
    </div>
  );
};
