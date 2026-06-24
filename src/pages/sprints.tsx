import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { 
  fetchSprints, 
  createSprint, 
  updateSprint, 
  startSprint, 
  selectSprints 
} from '../redux/slices/sprintSlice';
import { 
  fetchBacklogItems, 
  bulkUpdateBacklogItems, 
  selectBacklogItems 
} from '../redux/slices/backlogSlice';
import { fetchProjects, selectActiveProject } from '../redux/slices/projectSlice';
import { 
  Button, 
  Input, 
  TextArea, 
  DatePicker, 
  Card, 
  Badge, 
  Tag,
  Alert,
  Modal,
  Select,
  Table,
  Column
} from '../components/common';
import { 
  Search, 
  User, 
  Trash2, 
  Play, 
  CheckCircle, 
  Users, 
  Briefcase
} from 'lucide-react';
import { SprintStatus, Priority, WorkItemType } from '../common/enums';
import { enqueueToast } from '../redux/slices/uiSlice';
import { SubtaskList } from '../components/subtasks';
import { Sprint } from '../services/sprintService';
import { BacklogItem } from '../services/backlogService';

const SprintsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(selectActiveProject);
  const activeProjectId = activeProject?.id || null;

  // Redux states
  const sprints = useAppSelector(selectSprints);
  const backlogItems = useAppSelector(selectBacklogItems);

  // Selected Sprint ID
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  
  // Creation/Edit Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sprintAssigneeId, setSprintAssigneeId] = useState('');
  const [sprintPriority, setSprintPriority] = useState<Priority>(Priority.MEDIUM);
  const [sprintStatusField, setSprintStatusField] = useState<SprintStatus>(SprintStatus.PLANNED);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Backlog search/filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [backlogSelectedIds, setBacklogSelectedIds] = useState<string[]>([]);

  // Bulk assignment in Sprint state
  const [sprintSelectedIds, setSprintSelectedIds] = useState<string[]>([]);
  const [bulkAssigneeId, setBulkAssigneeId] = useState('');

  const clearForm = useCallback(() => {
    setSprintName('');
    setSprintGoal('');
    setStartDate('');
    setEndDate('');
    setSprintAssigneeId('');
    setSprintPriority(Priority.MEDIUM);
    setSprintStatusField(SprintStatus.PLANNED);
    setFormErrors({});
  }, []);

  // Initial load
  useEffect(() => {
    dispatch(fetchProjects({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Load sprints and backlog items when active project changes
  useEffect(() => {
    if (activeProjectId) {
      dispatch(fetchSprints(activeProjectId));
      dispatch(fetchBacklogItems({ projectId: activeProjectId, limit: 100 }));
      // Intentional reset of selection/form when the active project changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSprintId(null);
      clearForm();
    }
  }, [dispatch, activeProjectId, clearForm]);

  // Select the first planned or active sprint by default if none selected
  useEffect(() => {
    if (sprints.length > 0 && !selectedSprintId) {
      const activeOrPlanned = sprints.find(s => s.status === SprintStatus.ACTIVE) || sprints[0];
      // Intentional default selection of the first active/planned sprint.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSprintId(activeOrPlanned.id);
    }
  }, [sprints, selectedSprintId]);

  // Sync edit form with selected sprint
  const selectedSprint = sprints.find(s => s.id === selectedSprintId);
  
  const openEditModal = () => {
    if (selectedSprint) {
      setSprintName(selectedSprint.name);
      setSprintGoal(selectedSprint.goal || '');
      setStartDate(selectedSprint.startDate ? selectedSprint.startDate.split('T')[0] : '');
      setEndDate(selectedSprint.endDate ? selectedSprint.endDate.split('T')[0] : '');
      setSprintAssigneeId(selectedSprint.assigneeId || '');
      setSprintPriority(selectedSprint.priority || Priority.MEDIUM);
      setSprintStatusField(selectedSprint.status);
      setFormErrors({});
      setShowEditModal(true);
    }
  };

  if (!activeProjectId) {
    return (
      <div className="page-container">
        <Alert severity="warning" message="Please select an active project from the sidebar to manage sprints." />
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={() => window.location.href = '/projects'}>Go to Projects</Button>
        </div>
      </div>
    );
  }

  // Get project team members for assignment
  const teamMembers = activeProject?.team || [];
  const projectPO = activeProject?.po;
  const allTeamMembers = [...teamMembers];
  if (projectPO && !allTeamMembers.find(t => t.id === projectPO.id)) {
    allTeamMembers.unshift(projectPO);
  }

  // Filter backlog items
  const availableBacklog = backlogItems.filter(item => {
    if (item.sprintId) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterType && item.type !== filterType) return false;
    if (filterPriority && item.priority !== filterPriority) return false;
    return true;
  });

  // Items added to the selected sprint
  const sprintItems = backlogItems.filter(item => item.sprintId === selectedSprintId);

  // Calculations for Capacity Overview
  const memberAssignedCount: Record<string, number> = {};
  allTeamMembers.forEach(member => {
    memberAssignedCount[member.id] = 0;
  });

  sprintItems.forEach(item => {
    if (item.assigneeId) {
      memberAssignedCount[item.assigneeId] = (memberAssignedCount[item.assigneeId] || 0) + 1;
    }
  });

  const getCapacityStatus = (count: number) => {
    if (count === 0) return { label: 'Available', color: SprintStatus.PLANNED };
    if (count <= 2) return { label: 'Optimal', color: SprintStatus.ACTIVE };
    return { label: 'Overloaded', color: SprintStatus.COMPLETED }; // Map colors logically
  };

  // Sprint Summary stats
  const epicsCount = sprintItems.filter(i => i.type === WorkItemType.EPIC).length;
  const storiesCount = sprintItems.filter(i => i.type === WorkItemType.STORY).length;
  const tasksCount = sprintItems.filter(i => i.type === WorkItemType.TASK).length;
  const bugsCount = sprintItems.filter(i => i.type === WorkItemType.BUG).length;

  const assignedMembers = Array.from(new Set(
    sprintItems.map(i => i.assignee).filter(Boolean)
  )) as { id: string; firstName: string; lastName: string }[];

  // Validations
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!sprintName.trim()) errors.sprintName = 'Sprint name is mandatory';
    if (!startDate) errors.startDate = 'Start date is mandatory';
    if (!endDate) errors.endDate = 'End date is mandatory';
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      errors.endDate = 'End date must be greater than start date';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleCreateSprint = async () => {
    if (!validateForm()) return;

    try {
      const newSprint = await dispatch(createSprint({
        projectId: activeProjectId,
        payload: {
          name: sprintName,
          goal: sprintGoal,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          assigneeId: sprintAssigneeId || undefined,
          priority: sprintPriority,
        }
      })).unwrap();

      dispatch(enqueueToast({ message: `Sprint "${newSprint.name}" created successfully.`, severity: 'success' }));
      setSelectedSprintId(newSprint.id);
      setShowCreateModal(false);
      clearForm();
    } catch (err: unknown) {
      dispatch(enqueueToast({ message: (err as string) ||'Failed to create sprint', severity: 'error' }));
    }
  };

  const handleUpdateSprintDetails = async () => {
    if (!selectedSprintId || !validateForm()) return;

    try {
      await dispatch(updateSprint({
        id: selectedSprintId,
        payload: {
          name: sprintName,
          goal: sprintGoal,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          assigneeId: sprintAssigneeId || undefined,
          priority: sprintPriority,
          status: sprintStatusField,
        }
      })).unwrap();

      dispatch(enqueueToast({ message: 'Sprint details updated.', severity: 'success' }));
      setShowEditModal(false);
    } catch (err: unknown) {
      dispatch(enqueueToast({ message: (err as string) ||'Failed to update sprint details', severity: 'error' }));
    }
  };

  const handleAddSelectedToSprint = async () => {
    if (!selectedSprintId || backlogSelectedIds.length === 0) return;

    try {
      await dispatch(bulkUpdateBacklogItems({
        projectId: activeProjectId,
        payload: {
          itemIds: backlogSelectedIds,
          sprintId: selectedSprintId,
        }
      })).unwrap();

      dispatch(enqueueToast({ message: `Added ${backlogSelectedIds.length} items to sprint.`, severity: 'success' }));
      setBacklogSelectedIds([]);
    } catch (err: unknown) {
      dispatch(enqueueToast({ message: (err as string) ||'Failed to add items to sprint', severity: 'error' }));
    }
  };

  const handleRemoveFromSprint = async (itemId: string) => {
    try {
      await dispatch(bulkUpdateBacklogItems({
        projectId: activeProjectId,
        payload: {
          itemIds: [itemId],
          sprintId: null,
        }
      })).unwrap();

      dispatch(enqueueToast({ message: 'Item removed from sprint.', severity: 'success' }));
    } catch (err: unknown) {
      dispatch(enqueueToast({ message: (err as string) ||'Failed to remove item', severity: 'error' }));
    }
  };

  const handleAssigneeChange = async (itemId: string, assigneeId: string) => {
    const assignee = allTeamMembers.find(t => t.id === assigneeId) || null;
    try {
      await dispatch(bulkUpdateBacklogItems({
        projectId: activeProjectId,
        payload: {
          itemIds: [itemId],
          assigneeId: assigneeId || null,
          assignee: assignee ? { id: assignee.id, firstName: assignee.firstName, lastName: assignee.lastName } : null,
        }
      })).unwrap();
    } catch (err: unknown) {
      dispatch(enqueueToast({ message: (err as string) ||'Failed to update assignee', severity: 'error' }));
    }
  };

  const handleBulkAssign = async () => {
    if (sprintSelectedIds.length === 0) return;
    const assignee = allTeamMembers.find(t => t.id === bulkAssigneeId) || null;

    try {
      await dispatch(bulkUpdateBacklogItems({
        projectId: activeProjectId,
        payload: {
          itemIds: sprintSelectedIds,
          assigneeId: bulkAssigneeId || null,
          assignee: assignee ? { id: assignee.id, firstName: assignee.firstName, lastName: assignee.lastName } : null,
        }
      })).unwrap();

      dispatch(enqueueToast({ message: `Assigned ${sprintSelectedIds.length} items.`, severity: 'success' }));
      setSprintSelectedIds([]);
      setBulkAssigneeId('');
    } catch (err: unknown) {
      dispatch(enqueueToast({ message: (err as string) ||'Bulk assignment failed', severity: 'error' }));
    }
  };

  const handleStartSprint = async () => {
    if (!selectedSprintId || !selectedSprint) return;

    if (!selectedSprint.name?.trim()) {
      dispatch(enqueueToast({ message: 'Sprint Name is mandatory before starting.', severity: 'warning' }));
      return;
    }
    if (!selectedSprint.goal?.trim()) {
      dispatch(enqueueToast({ message: 'Sprint Goal is mandatory before starting.', severity: 'warning' }));
      return;
    }
    if (!selectedSprint.startDate || !selectedSprint.endDate) {
      dispatch(enqueueToast({ message: 'Sprint dates are mandatory before starting.', severity: 'warning' }));
      return;
    }
    if (sprintItems.length === 0) {
      dispatch(enqueueToast({ message: 'At least one work item must be added to the sprint before starting.', severity: 'warning' }));
      return;
    }

    try {
      await dispatch(startSprint(selectedSprintId)).unwrap();
      dispatch(enqueueToast({ message: 'Sprint started successfully! Backlog items moved to Sprint Board.', severity: 'success' }));
    } catch (err: unknown) {
      dispatch(enqueueToast({ message: (err as string) ||'Failed to start sprint', severity: 'error' }));
    }
  };

  const isLocked = selectedSprint?.status === SprintStatus.ACTIVE || selectedSprint?.status === SprintStatus.COMPLETED;

  const toggleBacklogSelected = (id: string) => {
    setBacklogSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSprintSelected = (id: string) => {
    setSprintSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const renderTypeLabel = (type?: WorkItemType) => {
    if (!type) return null;
    const isBug = type === WorkItemType.BUG;
    const isStory = type === WorkItemType.STORY;
    const isEpic = type === WorkItemType.EPIC;

    const bg = isBug ? '#ffebe6' : isStory ? '#e3fcef' : isEpic ? '#deebff' : '#dfe1e6';
    const fg = isBug ? '#de350b' : isStory ? '#006644' : isEpic ? '#0052cc' : '#42526e';

    return (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        padding: '2px 6px', 
        borderRadius: '3px', 
        fontSize: '11px', 
        fontWeight: 700, 
        textTransform: 'uppercase', 
        letterSpacing: '0.5px', 
        backgroundColor: bg, 
        color: fg 
      }}>
        {type}
      </span>
    );
  };

  // Standardized Sprints Table Columns
  const sprintColumns: Column<Sprint>[] = [
    {
      key: 'name',
      header: 'Sprint Name',
      render: (row) => (
        <span 
          style={{ 
            fontWeight: 600, 
            color: selectedSprintId === row.id ? 'var(--color-primary-700)' : 'var(--color-primary-500)', 
            textDecoration: selectedSprintId === row.id ? 'underline' : 'none'
          }}
        >
          {row.name}
        </span>
      )
    },
    {
      key: 'assignee',
      header: 'Assignee (Owner)',
      render: (row) => row.assignee ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem' }}>{row.assignee.firstName} {row.assignee.lastName}</span>
        </div>
      ) : <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.85rem' }}>—</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Tag status={row.status} />
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString() : '—'
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => row.priority ? <Badge level={row.priority} /> : <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.85rem' }}>—</span>
    }
  ];

  // Standardized Sprint Items Table Columns
  const sprintItemsColumns: Column<BacklogItem>[] = [
    {
      key: 'select',
      header: '',
      render: (row) => !isLocked ? (
        <input 
          type="checkbox"
          checked={sprintSelectedIds.includes(row.id)}
          onChange={() => toggleSprintSelected(row.id)}
        />
      ) : null
    },
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>
          {row.title}
        </span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => renderTypeLabel(row.type)
    },
    {
      key: 'epic',
      header: 'Epic',
      render: (row) => row.epic?.name ? (
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary-500)' }}>{row.epic.name}</span>
      ) : (
        <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.8125rem' }}>—</span>
      )
    },
    {
      key: 'assignee',
      header: 'Assignee',
      render: (row) => (
        <select
          value={row.assigneeId || ''}
          onChange={(e) => handleAssigneeChange(row.id, e.target.value)}
          disabled={isLocked}
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            fontSize: '0.85rem'
          }}
        >
          <option value="">Unassigned</option>
          {allTeamMembers.map(t => (
            <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
          ))}
        </select>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Tag status={row.status} />
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: () => <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.8125rem' }}>—</span>
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => <Badge level={row.priority} />
    },
    {
      key: 'actions',
      header: '',
      render: (row) => !isLocked ? (
        <button
          onClick={() => handleRemoveFromSprint(row.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-danger)',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Remove from Sprint"
        >
          <Trash2 size={16} />
        </button>
      ) : null
    }
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0 }}>Sprints</h1>
          <Button onClick={() => { clearForm(); setShowCreateModal(true); }}>Create Sprint</Button>
        </div>

        {sprints.length === 0 ? (
          <Alert severity="info" message="No Sprints created yet. Click 'Create Sprint' to start planning." />
        ) : (
          <Table
            columns={sprintColumns}
            data={sprints}
            keyExtractor={(s) => s.id}
            onRowClick={(row) => setSelectedSprintId(row.id)}
          />
        )}

        {/* Selected Sprint Active Planning Workspace */}
        {selectedSprint ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', marginTop: '1.5rem' }}>
            
            {/* Main Planning Workspace */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Selected Sprint Header card */}
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem' }}>
                  <div style={{ flex: 1, paddingRight: '2rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>Active Plan: {selectedSprint.name}</h3>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                      <strong style={{ fontWeight: 600 }}>Goal:</strong> {selectedSprint.goal || 'No goal set yet.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Tag status={selectedSprint.status} />
                    {!isLocked && (
                      <Button variant="secondary" onClick={openEditModal} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                        Edit Details
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Items in Sprint Table */}
              <Card>
                <div style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0 }}>Items in Sprint ({sprintItems.length})</h3>
                    
                    {sprintItems.length > 0 && !isLocked && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <select
                          value={bulkAssigneeId}
                          onChange={(e) => setBulkAssigneeId(e.target.value)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg-panel)',
                            color: 'var(--color-text-primary)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="">-- Bulk Assign --</option>
                          {allTeamMembers.map(t => (
                            <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                          ))}
                        </select>
                        <Button 
                          variant="secondary" 
                          onClick={handleBulkAssign} 
                          disabled={sprintSelectedIds.length === 0 || !bulkAssigneeId}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>

                  {sprintItems.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-panel)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                      <Briefcase size={40} style={{ marginBottom: '1rem', opacity: 0.4, color: 'var(--color-primary)' }} />
                      <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>No items added to this sprint yet</p>
                      {!isLocked && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Select items from the Backlog Selection panel below and add them to this sprint.</p>}
                    </div>
                  ) : (
                    <Table
                      columns={sprintItemsColumns}
                      data={sprintItems}
                      keyExtractor={(item) => item.id}
                      renderRowExpansion={(row) => (
                        <SubtaskList 
                          parentType={row.type === WorkItemType.BUG ? 'bugs' : row.type === WorkItemType.STORY ? 'stories' : 'tasks'} 
                          parentId={row.id} 
                        />
                      )}
                    />
                  )}
                </div>
              </Card>

              {/* Backlog Item Selector */}
              {selectedSprint && !isLocked && (
                <Card>
                  <div style={{ padding: '1rem 1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Backlog Selection</h3>

                    {/* Filters toolbar */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                        <input
                          type="text"
                          placeholder="Search backlog..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 1rem 0.45rem 2.25rem',
                            borderRadius: '6px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg-panel)',
                            color: 'var(--color-text-primary)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg-panel)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        <option value="">All Types</option>
                        <option value={WorkItemType.EPIC}>Epic</option>
                        <option value={WorkItemType.STORY}>User Story</option>
                        <option value={WorkItemType.TASK}>Task</option>
                        <option value={WorkItemType.BUG}>Bug</option>
                      </select>

                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        style={{
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg-panel)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        <option value="">All Priorities</option>
                        <option value={Priority.CRITICAL}>Critical</option>
                        <option value={Priority.HIGH}>High</option>
                        <option value={Priority.MEDIUM}>Medium</option>
                        <option value={Priority.LOW}>Low</option>
                      </select>

                      <Button 
                        variant="primary" 
                        disabled={backlogSelectedIds.length === 0}
                        onClick={handleAddSelectedToSprint}
                        style={{ padding: '0.45rem 1rem' }}
                      >
                        Add selected to Sprint
                      </Button>
                    </div>

                    {availableBacklog.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-panel)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>No backlog items matching the current selection, or all items are already assigned to sprints.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {availableBacklog.map(item => (
                          <div 
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.65rem 1rem',
                              border: '1px solid var(--color-border)',
                              borderRadius: '6px',
                              backgroundColor: 'var(--color-bg-card)',
                              gap: '1rem',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <input 
                                type="checkbox"
                                checked={backlogSelectedIds.includes(item.id)}
                                onChange={() => toggleBacklogSelected(item.id)}
                                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                              />
                              {renderTypeLabel(item.type)}
                              <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.title}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <Badge level={item.priority} />
                              <Button 
                                variant="secondary"
                                onClick={async () => {
                                  try {
                                    await dispatch(bulkUpdateBacklogItems({
                                      projectId: activeProjectId,
                                      payload: {
                                        itemIds: [item.id],
                                        sprintId: selectedSprintId,
                                      }
                                    })).unwrap();
                                  } catch (err: unknown) {
                                    dispatch(enqueueToast({ message: (err as string) ||'Failed to add item', severity: 'error' }));
                                  }
                                }}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}

            </div>

            {/* Side Panel: Capacity & Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Sprint Review Summary Card */}
              <Card style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <CheckCircle size={20} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ margin: 0 }}>Review Summary</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', paddingLeft: '1.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Sprint Name</span>
                    <span style={{ fontWeight: 500, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>{selectedSprint.name || <span style={{ color: 'var(--color-text-danger)' }}>Missing</span>}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Sprint Goal</span>
                    <span style={{ color: 'var(--color-text-primary)', lineHeight: '1.4' }}>{selectedSprint.goal || <span style={{ color: 'var(--color-text-danger)', fontStyle: 'italic' }}>No goal set</span>}</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--color-bg-panel)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Start Date</span>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{selectedSprint.startDate ? new Date(selectedSprint.startDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>End Date</span>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{selectedSprint.endDate ? new Date(selectedSprint.endDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>Sprint Stats:</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-panel)', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{epicsCount}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Epics</div>
                      </div>
                      <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-panel)', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{storiesCount}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Stories</div>
                      </div>
                      <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-panel)', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{tasksCount}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Tasks</div>
                      </div>
                      <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-panel)', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{bugsCount}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Bugs</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>Assigned Members ({assignedMembers.length}):</strong>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {assignedMembers.length === 0 ? (
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>None</span>
                      ) : (
                        assignedMembers.map(m => (
                          <span 
                            key={m.id} 
                            style={{
                              padding: '0.2rem 0.5rem',
                              backgroundColor: 'var(--color-bg-panel)',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              border: '1px solid var(--color-border)'
                            }}
                          >
                            {m.firstName} {m.lastName}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {!isLocked && (
                    <Button 
                      variant="primary" 
                      onClick={handleStartSprint}
                      style={{ marginTop: '0.75rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Play size={16} /> Start Sprint
                    </Button>
                  )}
                </div>
              </Card>

              {/* Team Capacity Overview Card */}
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Users size={20} />
                  <h3 style={{ margin: 0 }}>Team Capacity</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {allTeamMembers.map(member => {
                    const count = memberAssignedCount[member.id] || 0;
                    const status = getCapacityStatus(count);

                    return (
                      <div 
                        key={member.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          border: '1px solid var(--color-border)',
                          borderRadius: '6px',
                          backgroundColor: 'var(--color-bg-panel)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>
                            <User size={14} />
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                            {member.firstName} {member.lastName}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                            {count} item{count !== 1 ? 's' : ''}
                          </span>
                          <Tag status={status.color} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

            </div>
          </div>
        ) : null}

        {/* Standardized Create Sprint Modal */}
        {showCreateModal && (
          <Modal title="Create New Sprint" isOpen onClose={() => setShowCreateModal(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
              <Input
                label="Sprint Name"
                placeholder="e.g. Sprint 2 - Integration"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                error={formErrors.sprintName}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  error={formErrors.startDate}
                  required
                />
                <DatePicker
                  label="End Date (Due Date)"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  error={formErrors.endDate}
                  required
                />
              </div>
              <TextArea
                label="Sprint Goal"
                placeholder="Establish database mapping and authentication hooks..."
                value={sprintGoal}
                onChange={(e) => setSprintGoal(e.target.value)}
                rows={3}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Select
                  label="Assignee (Owner)"
                  value={sprintAssigneeId}
                  onChange={(e) => setSprintAssigneeId(e.target.value)}
                  options={[{ label: 'Unassigned', value: '' }, ...allTeamMembers.map(t => ({ label: `${t.firstName} ${t.lastName}`, value: t.id }))]}
                />
                <Select
                  label="Priority"
                  value={sprintPriority}
                  onChange={(e) => setSprintPriority(e.target.value as Priority)}
                  options={[
                    { label: 'Low', value: Priority.LOW },
                    { label: 'Medium', value: Priority.MEDIUM },
                    { label: 'High', value: Priority.HIGH },
                    { label: 'Critical', value: Priority.CRITICAL }
                  ]}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <Button variant="secondary" onClick={() => { setShowCreateModal(false); clearForm(); }}>Cancel</Button>
                <Button variant="primary" onClick={handleCreateSprint}>Create Sprint</Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Standardized Edit Sprint Modal */}
        {showEditModal && (
          <Modal title="Edit Sprint Details" isOpen onClose={() => setShowEditModal(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
              <Input
                label="Sprint Name"
                placeholder="e.g. Sprint 2 - Integration"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                error={formErrors.sprintName}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  error={formErrors.startDate}
                  required
                />
                <DatePicker
                  label="End Date (Due Date)"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  error={formErrors.endDate}
                  required
                />
              </div>
              <TextArea
                label="Sprint Goal"
                placeholder="Establish database mapping and authentication hooks..."
                value={sprintGoal}
                onChange={(e) => setSprintGoal(e.target.value)}
                rows={3}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Select
                  label="Assignee (Owner)"
                  value={sprintAssigneeId}
                  onChange={(e) => setSprintAssigneeId(e.target.value)}
                  options={[{ label: 'Unassigned', value: '' }, ...allTeamMembers.map(t => ({ label: `${t.firstName} ${t.lastName}`, value: t.id }))]}
                />
                <Select
                  label="Priority"
                  value={sprintPriority}
                  onChange={(e) => setSprintPriority(e.target.value as Priority)}
                  options={[
                    { label: 'Low', value: Priority.LOW },
                    { label: 'Medium', value: Priority.MEDIUM },
                    { label: 'High', value: Priority.HIGH },
                    { label: 'Critical', value: Priority.CRITICAL }
                  ]}
                />
              </div>
              <Select
                label="Status"
                value={sprintStatusField}
                onChange={(e) => setSprintStatusField(e.target.value as SprintStatus)}
                options={[
                  { label: 'Planned', value: SprintStatus.PLANNED },
                  { label: 'Active', value: SprintStatus.ACTIVE },
                  { label: 'Completed', value: SprintStatus.COMPLETED }
                ]}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleUpdateSprintDetails}>Save Changes</Button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
};

export default SprintsPage;
