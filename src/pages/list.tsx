import React, { useEffect, useState } from 'react';
import { ChevronRight, FileText, CheckSquare, CornerDownRight, Bug as BugIcon, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchEpics, selectEpics } from '../redux/slices/epicSlice';
import { fetchStories, selectStories } from '../redux/slices/storySlice';
import { fetchTasks, selectTasks } from '../redux/slices/taskSlice';
import { fetchBugs, selectBugs } from '../redux/slices/bugSlice';
import { fetchSubtasks } from '../redux/slices/subtaskSlice';
import { Avatar, Alert, ItemStatusDropdown, Checkbox } from '../components/common';
import { enqueueToast } from '../redux/slices/uiSlice';
import { deleteEpic } from '../redux/slices/epicSlice';
import { deleteStory } from '../redux/slices/storySlice';
import { deleteTask } from '../redux/slices/taskSlice';
import { deleteBug } from '../redux/slices/bugSlice';
import { deleteSubtask } from '../redux/slices/subtaskSlice';
import { fetchSprints, selectSprints } from '../redux/slices/sprintSlice';
import { BulkActionBar } from '../components/backlog';
import { issueService } from '../services/issueService';
import { Priority } from '../common/enums';
import { RoutePaths } from '../routes/routePaths';
import type { Story } from '../services/storyService';
import type { Task } from '../services/taskService';
import type { Bug as BugItem } from '../services/bugService';
import styles from './list.module.css';

const ListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);

  const epics = useAppSelector(selectEpics);
  const stories = useAppSelector(selectStories);
  const tasks = useAppSelector(selectTasks);
  const bugs = useAppSelector(selectBugs);
  const subtasksByParent = useAppSelector(state => state.subtasks.byParent);

  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [expandedBugs, setExpandedBugs] = useState<Record<string, boolean>>({});
  const [standaloneExpanded, setStandaloneExpanded] = useState(true);

  const sprints = useAppSelector(selectSprints);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  useEffect(() => {
    if (activeProjectId) {
      dispatch(fetchEpics({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchStories({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchTasks({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchBugs({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchSprints(activeProjectId));
    }
  }, [dispatch, activeProjectId]);

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleClearSelection = () => setSelectedIds([]);

  const reloadData = () => {
    if (activeProjectId) {
      dispatch(fetchEpics({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchStories({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchTasks({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchBugs({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
    }
  };

  const handleBulkAction = async (action: { priority?: Priority, status?: string, sprintId?: string }) => {
    if (!activeProjectId) return;
    setIsApplyingBulk(true);
    try {
      await issueService.bulkUpdate(activeProjectId, {
        itemIds: selectedIds,
        priority: action.priority,
        status: action.status,
        sprintId: action.sprintId
      });
      dispatch(enqueueToast({ message: `Updated ${selectedIds.length} items`, severity: 'success' }));
      handleClearSelection();
      reloadData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      dispatch(enqueueToast({ message: error.message || 'Failed to update items', severity: 'error' }));
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!activeProjectId) return;
    setIsApplyingBulk(true);
    try {
      await issueService.bulkDelete(activeProjectId, { itemIds: selectedIds });
      dispatch(enqueueToast({ message: `Deleted ${selectedIds.length} items`, severity: 'success' }));
      handleClearSelection();
      reloadData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      dispatch(enqueueToast({ message: error.message || 'Failed to delete items', severity: 'error' }));
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const toggleEpic = (epicId: string) => {
    setExpandedEpics(prev => ({ ...prev, [epicId]: !prev[epicId] }));
  };

  const toggleStory = (storyId: string) => {
    setExpandedStories(prev => {
      const next = { ...prev, [storyId]: !prev[storyId] };
      if (next[storyId]) {
        dispatch(fetchSubtasks({ parentType: 'stories', parentId: storyId }));
      }
      return next;
    });
  };

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      if (next[taskId]) {
        dispatch(fetchSubtasks({ parentType: 'tasks', parentId: taskId }));
      }
      return next;
    });
  };

  const toggleBug = (bugId: string) => {
    setExpandedBugs(prev => {
      const next = { ...prev, [bugId]: !prev[bugId] };
      if (next[bugId]) {
        dispatch(fetchSubtasks({ parentType: 'bugs', parentId: bugId }));
      }
      return next;
    });
  };

  const getPriorityClass = (priority: string) => {
    const p = priority.toLowerCase();
    return styles[`priority_${p}`] || styles.priority_low;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // ── Row renderers ──────────────────────────────────────────────────────────

  const renderStoryRow = (story: Story) => {
    const isExpanded = !!expandedStories[story.id];
    const subtasks = subtasksByParent[`stories:${story.id}`] || [];
    return (
      <React.Fragment key={story.id}>
        <div className={`${styles.childRow} ${styles.taskRow}`} onClick={() => toggleStory(story.id)}>
          <div className={styles.titleArea}>
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox checked={selectedIds.includes(story.id)} onChange={() => handleToggleSelection(story.id)} />
            </div>
            <ChevronRight size={14} className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`} />
            <FileText size={16} style={{ color: 'var(--color-primary)', marginRight: '6px' }} />
            <span className={styles.titleText} title={story.title}>{story.title}</span>
          </div>
          <div className={styles.metaArea}>
            <div className={`${styles.metaField} ${styles.metaAssignee}`}>
              {story.assignee && (
                <Avatar name={`${story.assignee.firstName} ${story.assignee.lastName}`} size={20} />
              )}
            </div>
            <div className={`${styles.metaField} ${styles.metaPriority}`}>
              {story.priority && (
                <span className={`${styles.priority} ${getPriorityClass(story.priority)}`} title={`Priority: ${story.priority}`}>
                  {story.priority[0]}
                </span>
              )}
            </div>
            <div className={`${styles.metaField} ${styles.metaStatus}`}>
              <ItemStatusDropdown
                itemId={story.id}
                itemType="STORY"
                status={story.status}
                size="sm"
                onStatusChange={() => { if (activeProjectId) dispatch(fetchStories({ projectId: activeProjectId, params: {} })); }}
              />
            </div>
            <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
            <div className={`${styles.metaField} ${styles.metaActions}`}>
              <button className={styles.actionButton} onClick={(e) => { e.stopPropagation(); navigate(RoutePaths.STORY_DETAIL(story.id)); }} title="Edit Story">
                <Edit2 size={14} />
              </button>
              <button className={`${styles.actionButton} ${styles.delete}`} onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete Story "${story.title}"?`)) {
                  try {
                    await dispatch(deleteStory(story.id)).unwrap();
                    dispatch(enqueueToast({ message: 'Story deleted', severity: 'success' }));
                  } catch {
                    dispatch(enqueueToast({ message: 'Failed to delete story', severity: 'error' }));
                  }
                }
              }} title="Delete Story">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className={styles.subtasksContainer}>
            {subtasks.length === 0 ? (
              <div style={{ padding: '0.5rem 1rem 0.5rem 3.5rem', fontSize: '0.8125rem', color: 'var(--color-neutral-400)' }}>
                No sub-tasks.
              </div>
            ) : (
              subtasks.map(subtask => (
                <div key={subtask.id} className={styles.subtaskRow}>
                  <div className={styles.subtaskTitleArea}>
                    <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                      <Checkbox checked={selectedIds.includes(subtask.id)} onChange={() => handleToggleSelection(subtask.id)} />
                    </div>
                    <CornerDownRight size={14} style={{ color: 'var(--color-neutral-400)' }} />
                    <span className={styles.titleText} title={subtask.title}>{subtask.title}</span>
                  </div>
                  <div className={styles.metaArea}>
                    <div className={`${styles.metaField} ${styles.metaAssignee}`}>
                      {subtask.assignee && (
                        <Avatar name={`${subtask.assignee.firstName} ${subtask.assignee.lastName}`} size={18} />
                      )}
                    </div>
                    <div className={`${styles.metaField} ${styles.metaPriority}`}></div>
                    <div className={`${styles.metaField} ${styles.metaStatus}`}>
                      <ItemStatusDropdown
                        itemId={subtask.id}
                        itemType="SUBTASK"
                        status={subtask.status}
                        size="sm"
                        parentType="stories"
                        parentId={story.id}
                      />
                    </div>
                    <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
                    <div className={`${styles.metaField} ${styles.metaActions}`}>
                      <button className={`${styles.actionButton} ${styles.delete}`} onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete Subtask "${subtask.title}"?`)) {
                          try {
                            await dispatch(deleteSubtask({ id: subtask.id, parentType: 'stories', parentId: story.id })).unwrap();
                            dispatch(enqueueToast({ message: 'Subtask deleted', severity: 'success' }));
                          } catch {
                            dispatch(enqueueToast({ message: 'Failed to delete subtask', severity: 'error' }));
                          }
                        }
                      }} title="Delete Subtask">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  const renderTaskRow = (task: Task) => {
    const isExpanded = !!expandedTasks[task.id];
    const subtasks = subtasksByParent[`tasks:${task.id}`] || [];
    return (
      <React.Fragment key={task.id}>
        <div className={`${styles.childRow} ${styles.taskRow}`} onClick={() => toggleTask(task.id)}>
          <div className={styles.titleArea}>
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox checked={selectedIds.includes(task.id)} onChange={() => handleToggleSelection(task.id)} />
            </div>
            <ChevronRight size={14} className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`} />
            <CheckSquare size={16} style={{ color: 'var(--color-success)', marginRight: '6px' }} />
            <span className={styles.titleText} title={task.title}>{task.title}</span>
          </div>
          <div className={styles.metaArea}>
            <div className={`${styles.metaField} ${styles.metaAssignee}`}>
              {task.assignee && (
                <Avatar name={`${task.assignee.firstName} ${task.assignee.lastName}`} size={20} />
              )}
            </div>
            <div className={`${styles.metaField} ${styles.metaPriority}`}></div>
            <div className={`${styles.metaField} ${styles.metaStatus}`}>
              <ItemStatusDropdown
                itemId={task.id}
                itemType="TASK"
                status={task.status}
                size="sm"
                onStatusChange={() => { if (activeProjectId) dispatch(fetchTasks({ projectId: activeProjectId, params: {} })); }}
              />
            </div>
            <div className={`${styles.metaField} ${styles.metaDueDate}`}>
              {task.dueDate && (
                <span className={styles.dateText}>{formatDate(task.dueDate)}</span>
              )}
            </div>
            <div className={`${styles.metaField} ${styles.metaActions}`}>
              <button className={styles.actionButton} onClick={(e) => { e.stopPropagation(); navigate(RoutePaths.TASK_DETAIL(task.id)); }} title="Edit Task">
                <Edit2 size={14} />
              </button>
              <button className={`${styles.actionButton} ${styles.delete}`} onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete Task "${task.title}"?`)) {
                  try {
                    await dispatch(deleteTask(task.id)).unwrap();
                    dispatch(enqueueToast({ message: 'Task deleted', severity: 'success' }));
                  } catch {
                    dispatch(enqueueToast({ message: 'Failed to delete task', severity: 'error' }));
                  }
                }
              }} title="Delete Task">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className={styles.subtasksContainer}>
            {subtasks.length === 0 ? (
              <div style={{ padding: '0.5rem 1rem 0.5rem 3.5rem', fontSize: '0.8125rem', color: 'var(--color-neutral-400)' }}>
                No sub-tasks.
              </div>
            ) : (
              subtasks.map(subtask => (
                <div key={subtask.id} className={styles.subtaskRow}>
                  <div className={styles.subtaskTitleArea}>
                    <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                      <Checkbox checked={selectedIds.includes(subtask.id)} onChange={() => handleToggleSelection(subtask.id)} />
                    </div>
                    <CornerDownRight size={14} style={{ color: 'var(--color-neutral-400)' }} />
                    <span className={styles.titleText} title={subtask.title}>{subtask.title}</span>
                  </div>
                  <div className={styles.metaArea}>
                    <div className={`${styles.metaField} ${styles.metaAssignee}`}>
                      {subtask.assignee && (
                        <Avatar name={`${subtask.assignee.firstName} ${subtask.assignee.lastName}`} size={18} />
                      )}
                    </div>
                    <div className={`${styles.metaField} ${styles.metaPriority}`}></div>
                    <div className={`${styles.metaField} ${styles.metaStatus}`}>
                      <ItemStatusDropdown
                        itemId={subtask.id}
                        itemType="SUBTASK"
                        status={subtask.status}
                        size="sm"
                        parentType="tasks"
                        parentId={task.id}
                      />
                    </div>
                    <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
                    <div className={`${styles.metaField} ${styles.metaActions}`}>
                      <button className={`${styles.actionButton} ${styles.delete}`} onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete Subtask "${subtask.title}"?`)) {
                          try {
                            await dispatch(deleteSubtask({ id: subtask.id, parentType: 'tasks', parentId: task.id })).unwrap();
                            dispatch(enqueueToast({ message: 'Subtask deleted', severity: 'success' }));
                          } catch {
                            dispatch(enqueueToast({ message: 'Failed to delete subtask', severity: 'error' }));
                          }
                        }
                      }} title="Delete Subtask">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  const renderBugRow = (bug: BugItem) => {
    const isExpanded = !!expandedBugs[bug.id];
    const subtasks = subtasksByParent[`bugs:${bug.id}`] || [];
    return (
      <React.Fragment key={bug.id}>
        <div className={`${styles.childRow} ${styles.taskRow}`} onClick={() => toggleBug(bug.id)}>
          <div className={styles.titleArea}>
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox checked={selectedIds.includes(bug.id)} onChange={() => handleToggleSelection(bug.id)} />
            </div>
            <ChevronRight size={14} className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`} />
            <BugIcon size={16} style={{ color: 'var(--color-danger)', marginRight: '6px' }} />
            <span className={styles.titleText} title={bug.title}>{bug.title}</span>
          </div>
          <div className={styles.metaArea}>
            <div className={`${styles.metaField} ${styles.metaAssignee}`}>
              {bug.assignee && (
                <Avatar name={`${bug.assignee.firstName} ${bug.assignee.lastName}`} size={20} />
              )}
            </div>
            <div className={`${styles.metaField} ${styles.metaPriority}`}>
              {bug.priority && (
                <span className={`${styles.priority} ${getPriorityClass(bug.priority)}`} title={`Priority: ${bug.priority}`}>
                  {bug.priority[0]}
                </span>
              )}
            </div>
            <div className={`${styles.metaField} ${styles.metaStatus}`}>
              <ItemStatusDropdown
                itemId={bug.id}
                itemType="BUG"
                status={bug.status}
                size="sm"
                onStatusChange={() => { if (activeProjectId) dispatch(fetchBugs({ projectId: activeProjectId, params: {} })); }}
              />
            </div>
            <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
            <div className={`${styles.metaField} ${styles.metaActions}`}>
              <button className={styles.actionButton} onClick={(e) => { e.stopPropagation(); navigate(RoutePaths.BUG_DETAIL(bug.id)); }} title="Edit Bug">
                <Edit2 size={14} />
              </button>
              <button className={`${styles.actionButton} ${styles.delete}`} onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete Bug "${bug.title}"?`)) {
                  try {
                    await dispatch(deleteBug(bug.id)).unwrap();
                    dispatch(enqueueToast({ message: 'Bug deleted', severity: 'success' }));
                  } catch {
                    dispatch(enqueueToast({ message: 'Failed to delete bug', severity: 'error' }));
                  }
                }
              }} title="Delete Bug">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className={styles.subtasksContainer}>
            {subtasks.length === 0 ? (
              <div style={{ padding: '0.5rem 1rem 0.5rem 3.5rem', fontSize: '0.8125rem', color: 'var(--color-neutral-400)' }}>
                No sub-tasks.
              </div>
            ) : (
              subtasks.map(subtask => (
                <div key={subtask.id} className={styles.subtaskRow}>
                  <div className={styles.subtaskTitleArea}>
                    <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                      <Checkbox checked={selectedIds.includes(subtask.id)} onChange={() => handleToggleSelection(subtask.id)} />
                    </div>
                    <CornerDownRight size={14} style={{ color: 'var(--color-neutral-400)' }} />
                    <span className={styles.titleText} title={subtask.title}>{subtask.title}</span>
                  </div>
                  <div className={styles.metaArea}>
                    <div className={`${styles.metaField} ${styles.metaAssignee}`}>
                      {subtask.assignee && (
                        <Avatar name={`${subtask.assignee.firstName} ${subtask.assignee.lastName}`} size={18} />
                      )}
                    </div>
                    <div className={`${styles.metaField} ${styles.metaPriority}`}></div>
                    <div className={`${styles.metaField} ${styles.metaStatus}`}>
                      <ItemStatusDropdown
                        itemId={subtask.id}
                        itemType="SUBTASK"
                        status={subtask.status}
                        size="sm"
                        parentType="bugs"
                        parentId={bug.id}
                      />
                    </div>
                    <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
                    <div className={`${styles.metaField} ${styles.metaActions}`}>
                      <button className={`${styles.actionButton} ${styles.delete}`} onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete Subtask "${subtask.title}"?`)) {
                          try {
                            await dispatch(deleteSubtask({ id: subtask.id, parentType: 'bugs', parentId: bug.id })).unwrap();
                            dispatch(enqueueToast({ message: 'Subtask deleted', severity: 'success' }));
                          } catch {
                            dispatch(enqueueToast({ message: 'Failed to delete subtask', severity: 'error' }));
                          }
                        }
                      }} title="Delete Subtask">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  // ── Early return ───────────────────────────────────────────────────────────

  if (!activeProjectId) {
    return (
      <div className={styles.container}>
        <Alert severity="warning" message="Please select an active project from the sidebar to view the work outline." />
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const standaloneStories = stories.filter(s => !s.epicId);
  const standaloneTasks = tasks.filter(t => !t.epicId);
  const standaloneBugs = bugs.filter(b => !(b.parentType === 'EPIC' && b.parentId));
  const hasStandaloneItems = standaloneStories.length > 0 || standaloneTasks.length > 0 || standaloneBugs.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Work Outline</h1>
          <p className={styles.subtitle}>Hierarchical outline of project epics, user stories, tasks, bugs, and sub-tasks</p>
        </div>
      </div>

      {epics.length === 0 && !hasStandaloneItems ? (
        <div className={styles.emptyStateCard}>
          <h3>No Epics Found</h3>
          <p>Create epics and map stories, tasks, or bugs to them to build your project hierarchy outline.</p>
        </div>
      ) : (
        <div className={styles.tree}>
          {/* ── Epic-linked items ────────────────────────────────────────── */}
          {epics.map(epic => {
            const isEpicExpanded = !!expandedEpics[epic.id];
            const epicStories = stories.filter(s => s.epicId === epic.id);
            const epicTasks = tasks.filter(t => t.epicId === epic.id);
            const epicBugs = bugs.filter(b => b.parentType === 'EPIC' && b.parentId === epic.id);
            const hasChildren = epicStories.length > 0 || epicTasks.length > 0 || epicBugs.length > 0;

            return (
              <div key={epic.id} className={styles.epicNode}>
                <div className={styles.epicHeader} onClick={() => toggleEpic(epic.id)}>
                  <div className={styles.epicTitleArea}>
                    <ChevronRight
                      size={18}
                      className={`${styles.chevron} ${isEpicExpanded ? styles.chevronExpanded : ''}`}
                    />
                    <span>{epic.name}</span>
                  </div>
                  <div className={styles.metaArea}>
                    <div className={`${styles.metaField} ${styles.metaAssignee}`}>
                      {epic.owner && (
                        <Avatar
                          name={`${epic.owner.firstName} ${epic.owner.lastName}`}
                          size={24}
                        />
                      )}
                    </div>
                    <div className={`${styles.metaField} ${styles.metaPriority}`}></div>
                    <div className={`${styles.metaField} ${styles.metaStatus}`}>
                      <ItemStatusDropdown
                        itemId={epic.id}
                        itemType="EPIC"
                        status={epic.status}
                        size="sm"
                        onStatusChange={() => { if (activeProjectId) dispatch(fetchEpics({ projectId: activeProjectId, params: {} })); }}
                      />
                    </div>
                    <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
                    <div className={`${styles.metaField} ${styles.metaActions}`}>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => { e.stopPropagation(); navigate(RoutePaths.EPIC_DETAIL(epic.id)); }}
                        title="Edit Epic"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.delete}`}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete Epic "${epic.name}"?`)) {
                            try {
                              await dispatch(deleteEpic(epic.id)).unwrap();
                              dispatch(enqueueToast({ message: 'Epic deleted', severity: 'success' }));
                            } catch {
                              dispatch(enqueueToast({ message: 'Failed to delete epic', severity: 'error' }));
                            }
                          }
                        }}
                        title="Delete Epic"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {isEpicExpanded && (
                  <div className={styles.epicChildren}>
                    {!hasChildren ? (
                      <div style={{ padding: '1rem var(--spacing-5)', fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>
                        No mapped stories, tasks, or bugs.
                      </div>
                    ) : (
                      <>
                        {epicStories.length > 0 && (
                          <>
                            <div className={styles.sectionHeader}>User Stories</div>
                            {epicStories.map(renderStoryRow)}
                          </>
                        )}
                        {epicTasks.length > 0 && (
                          <>
                            <div className={styles.sectionHeader}>Tasks</div>
                            {epicTasks.map(renderTaskRow)}
                          </>
                        )}
                        {epicBugs.length > 0 && (
                          <>
                            <div className={styles.sectionHeader}>Bugs</div>
                            {epicBugs.map(renderBugRow)}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Standalone items (no epic) ───────────────────────────────── */}
          {hasStandaloneItems && (
            <div className={styles.epicNode}>
              <div className={styles.epicHeader} onClick={() => setStandaloneExpanded(prev => !prev)}>
                <div className={styles.epicTitleArea}>
                  <ChevronRight
                    size={18}
                    className={`${styles.chevron} ${standaloneExpanded ? styles.chevronExpanded : ''}`}
                  />
                  <span style={{ color: 'var(--color-neutral-500)', fontStyle: 'italic' }}>
                    Standalone Items (No Epic) — {standaloneStories.length + standaloneTasks.length + standaloneBugs.length} item{standaloneStories.length + standaloneTasks.length + standaloneBugs.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className={styles.metaArea}>
                  <div className={`${styles.metaField} ${styles.metaAssignee}`}></div>
                  <div className={`${styles.metaField} ${styles.metaPriority}`}></div>
                  <div className={`${styles.metaField} ${styles.metaStatus}`}></div>
                  <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
                  <div className={`${styles.metaField} ${styles.metaActions}`}></div>
                </div>
              </div>

              {standaloneExpanded && (
                <div className={styles.epicChildren}>
                  {standaloneStories.length > 0 && (
                    <>
                      <div className={styles.sectionHeader}>User Stories</div>
                      {standaloneStories.map(renderStoryRow)}
                    </>
                  )}
                  {standaloneTasks.length > 0 && (
                    <>
                      <div className={styles.sectionHeader}>Tasks</div>
                      {standaloneTasks.map(renderTaskRow)}
                    </>
                  )}
                  {standaloneBugs.length > 0 && (
                    <>
                      <div className={styles.sectionHeader}>Bugs</div>
                      {standaloneBugs.map(renderBugRow)}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClearSelection={handleClearSelection}
            onApplyAction={handleBulkAction}
            onDeleteAction={handleBulkDelete}
            isApplying={isApplyingBulk}
            sprints={sprints}
            statusOptions={[
              { label: 'To Do', value: 'To Do' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Done', value: 'Done' }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ListPage;
