import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchBugs, selectBugs, selectBugMeta, selectBugStatus, createBug, deleteBug } from '../../redux/slices/bugSlice';
import { fetchEpics, selectEpics } from '../../redux/slices/epicSlice';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { Table, Button, Avatar, Column, Pagination, ItemStatusDropdown } from '../common/ui';
import { Edit2, Trash2 } from 'lucide-react';
import { Severity } from '../../common/enums';
import { UNASSIGNED_VALUE } from '../../common/filterOptions';
import { BugForm } from './BugForm';
import { BugFilter } from './BugFilter';
import { BugDetailDrawer } from './BugDetailDrawer';
import { Modal } from '../common/ui';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { BugPayload, Bug } from '../../services/bugService';
import { SubtaskList } from '../subtasks/SubtaskList';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../../routes/routePaths';


interface BugListProps {
  projectId: string;
}

export const BugList: React.FC<BugListProps> = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const bugs = useAppSelector(selectBugs);
  const meta = useAppSelector(selectBugMeta);
  const status = useAppSelector(selectBugStatus);
  const epics = useAppSelector(selectEpics);
  const users = useAppSelector(selectUsers);
  
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  
  const [epicFilter, setEpicFilter] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<Severity | ''>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchEpics({ projectId, params: { limit: 100 } }));
    dispatch(fetchUsers({ limit: 100 }));
  }, [dispatch, projectId]);

  useEffect(() => {
    dispatch(fetchBugs({ 
      projectId, 
      params: { 
        page: 1, 
        limit: 20, 
        severity: filterSeverity || undefined,
        status: filterStatus || undefined 
      } 
    }));
  }, [dispatch, projectId, filterSeverity, filterStatus]);

  const handleCreateSubmit = async (payload: BugPayload) => {
    await dispatch(createBug({ projectId, payload })).unwrap();
    dispatch(enqueueToast({ message: 'Bug reported successfully', severity: 'success' }));
    setIsCreating(false);
  };

  const columns: Column<Bug>[] = [
    { 
      key: 'title', 
      header: 'Title', 
      render: (row) => (
        <span 
          style={{ fontWeight: 600, color: 'var(--color-primary-600)', cursor: 'pointer' }}
          onClick={() => setSelectedBugId(row.id)}
        >
          {row.title}
        </span>
      ) 
    },
    {
      key: 'epic',
      header: 'Epic',
      render: (row) => {
        const epicId = row.parentType === 'EPIC' ? row.parentId : undefined;
        const epic = epics.find(e => e.id === epicId);
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
      render: (row) => (
        <ItemStatusDropdown
          itemId={row.id}
          itemType="BUG"
          status={row.status}
        />
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: () => '—'
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{row.priority}</span>
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedBugId(row.id); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-neutral-500)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            title="Edit bug"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (!window.confirm(`Delete bug "${row.title}"?`)) return;
              try {
                await dispatch(deleteBug(row.id)).unwrap();
                dispatch(enqueueToast({ message: 'Bug deleted', severity: 'success' }));
              } catch {
                dispatch(enqueueToast({ message: 'Failed to delete bug', severity: 'error' }));
              }
            }}
            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            title="Delete bug"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const filteredBugs = bugs.filter(b => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (epicFilter && !(b.parentType === 'EPIC' && b.parentId === epicFilter)) return false;
    if (assigneeFilter === UNASSIGNED_VALUE && b.assigneeId) return false;
    if (assigneeFilter && assigneeFilter !== UNASSIGNED_VALUE && b.assigneeId !== assigneeFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Bugs & Defects</h2>
        <Button variant="primary" onClick={() => setIsCreating(true)}>Report Bug</Button>
      </div>
      <BugFilter
        search={search}
        onSearchChange={setSearch}
        epicId={epicFilter}
        onEpicChange={setEpicFilter}
        epics={epics}
        severity={filterSeverity}
        onSeverityChange={setFilterSeverity}
        status={filterStatus}
        onStatusChange={setFilterStatus}
        assigneeId={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        users={users}
      />

      <Table 
        columns={columns} 
        data={filteredBugs} 
        keyExtractor={(row) => row.id}
        loading={status === 'loading'}
        renderRowExpansion={(row) => <SubtaskList parentType="bugs" parentId={row.id} />}
      />
      <Pagination
        meta={meta}
        onNext={() => {}}
        onPrev={() => {}}
      />

      {isCreating && (
        <Modal title="Report Bug" isOpen onClose={() => setIsCreating(false)}>
          <BugForm 
            projectId={projectId} 
            onSubmit={handleCreateSubmit} 
            onCancel={() => setIsCreating(false)} 
          />
        </Modal>
      )}

      {selectedBugId && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setSelectedBugId(null)} />
          <BugDetailDrawer bugId={selectedBugId} onClose={() => setSelectedBugId(null)} />
        </>
      )}
    </div>
  );
};
