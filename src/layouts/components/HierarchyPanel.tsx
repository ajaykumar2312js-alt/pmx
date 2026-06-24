import React, { useEffect, useState } from 'react';
import { X, ChevronRight, FileText, CheckSquare, CornerDownRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchEpics, selectEpics } from '../../redux/slices/epicSlice';
import { fetchStories, selectStories } from '../../redux/slices/storySlice';
import { fetchTasks, selectTasks } from '../../redux/slices/taskSlice';
import { fetchSubtasks } from '../../redux/slices/subtaskSlice';
import { Avatar } from '../../components/common/ui';
import styles from './HierarchyPanel.module.css';

interface HierarchyPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HierarchyPanel: React.FC<HierarchyPanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);
  
  const epics = useAppSelector(selectEpics);
  const stories = useAppSelector(selectStories);
  const tasks = useAppSelector(selectTasks);
  const subtasksByParent = useAppSelector(state => state.subtasks.byParent);

  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && activeProjectId) {
      dispatch(fetchEpics({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchStories({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchTasks({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
    }
  }, [dispatch, isOpen, activeProjectId]);

  const toggleEpic = (epicId: string) => {
    setExpandedEpics(prev => ({ ...prev, [epicId]: !prev[epicId] }));
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

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase().replace(' ', '_');
    return styles[`status_${s}`] || styles.status_todo;
  };

  const getPriorityClass = (priority: string) => {
    const p = priority.toLowerCase();
    return styles[`priority_${p}`] || styles.priority_low;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  if (!activeProjectId) return null;

  return (
    <aside className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`} aria-label="Work Hierarchy Panel">
      <div className={styles.header}>
        <h3 className={styles.title}>Work Hierarchy</h3>
        <button onClick={onClose} className={styles.closeButton} aria-label="Close panel">
          <X size={18} />
        </button>
      </div>

      <div className={styles.content}>
        {epics.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No epics found for this project.</p>
          </div>
        ) : (
          <div className={styles.tree}>
            {epics.map(epic => {
              const isEpicExpanded = !!expandedEpics[epic.id];
              const epicStories = stories.filter(s => s.epicId === epic.id);
              const epicTasks = tasks.filter(t => t.epicId === epic.id);
              const hasChildren = epicStories.length > 0 || epicTasks.length > 0;

              return (
                <div key={epic.id} className={styles.epicNode}>
                  <div className={styles.epicHeader} onClick={() => toggleEpic(epic.id)}>
                    <div className={styles.epicTitleArea}>
                      <ChevronRight 
                        size={16} 
                        className={`${styles.chevron} ${isEpicExpanded ? styles.chevronExpanded : ''}`} 
                      />
                      <span>{epic.name}</span>
                    </div>
                    <div className={styles.metaArea}>
                      {epic.owner && (
                        <Avatar 
                          name={`${epic.owner.firstName} ${epic.owner.lastName}`} 
                          size={20} 
                        />
                      )}
                      <span className={`${styles.badge} ${getStatusClass(epic.status)}`}>
                        {epic.status}
                      </span>
                    </div>
                  </div>

                  {isEpicExpanded && (
                    <div className={styles.epicChildren}>
                      {!hasChildren ? (
                        <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                          No mapped stories or tasks.
                        </div>
                      ) : (
                        <>
                          {epicStories.length > 0 && (
                            <>
                              <div className={styles.sectionHeader}>User Stories</div>
                              {epicStories.map(story => (
                                <div key={story.id} className={styles.childRow}>
                                  <div className={styles.titleArea}>
                                    <FileText size={14} style={{ color: 'var(--color-primary)', marginRight: '4px' }} />
                                    <span className={styles.titleText} title={story.title}>{story.title}</span>
                                  </div>
                                  <div className={styles.metaArea}>
                                    {story.assignee && (
                                      <Avatar 
                                        name={`${story.assignee.firstName} ${story.assignee.lastName}`} 
                                        size={18} 
                                      />
                                    )}
                                    <span className={`${styles.badge} ${getStatusClass(story.status)}`}>
                                      {story.status}
                                    </span>
                                    <span className={`${styles.priority} ${getPriorityClass(story.priority)}`} title={`Priority: ${story.priority}`}>
                                      {story.priority[0]}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}

                          {epicTasks.length > 0 && (
                            <>
                              <div className={styles.sectionHeader}>Tasks</div>
                              {epicTasks.map(task => {
                                const isTaskExpanded = !!expandedTasks[task.id];
                                const taskSubtasks = subtasksByParent[`tasks:${task.id}`] || [];

                                return (
                                  <React.Fragment key={task.id}>
                                    <div 
                                      className={`${styles.childRow} ${styles.taskRow}`} 
                                      onClick={() => toggleTask(task.id)}
                                    >
                                      <div className={styles.titleArea}>
                                        <ChevronRight 
                                          size={12} 
                                          className={`${styles.chevron} ${isTaskExpanded ? styles.chevronExpanded : ''}`} 
                                        />
                                        <CheckSquare size={14} style={{ color: 'var(--color-success)', marginRight: '4px' }} />
                                        <span className={styles.titleText} title={task.title}>{task.title}</span>
                                      </div>
                                      <div className={styles.metaArea}>
                                        {task.assignee && (
                                          <Avatar 
                                            name={`${task.assignee.firstName} ${task.assignee.lastName}`} 
                                            size={18} 
                                          />
                                        )}
                                        <span className={`${styles.badge} ${getStatusClass(task.status)}`}>
                                          {task.status}
                                        </span>
                                        {task.dueDate && (
                                          <span className={styles.dateText}>{formatDate(task.dueDate)}</span>
                                        )}
                                      </div>
                                    </div>

                                    {isTaskExpanded && (
                                      <div className={styles.subtasksContainer}>
                                        {taskSubtasks.length === 0 ? (
                                          <div style={{ padding: '0.25rem 0.5rem 0.25rem 2.5rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                                            No sub-tasks.
                                          </div>
                                        ) : (
                                          taskSubtasks.map(subtask => (
                                            <div key={subtask.id} className={styles.subtaskRow}>
                                              <div className={styles.subtaskTitleArea}>
                                                <CornerDownRight size={12} style={{ color: 'var(--color-neutral-400)' }} />
                                                <span className={styles.titleText} title={subtask.title}>{subtask.title}</span>
                                              </div>
                                              <div className={styles.metaArea}>
                                                {subtask.assignee && (
                                                  <Avatar 
                                                    name={`${subtask.assignee.firstName} ${subtask.assignee.lastName}`} 
                                                    size={16} 
                                                  />
                                                )}
                                                <span className={`${styles.badge} ${getStatusClass(subtask.status)}`}>
                                                  {subtask.status}
                                                </span>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
