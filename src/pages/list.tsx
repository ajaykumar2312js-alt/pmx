import React, { useEffect, useState } from 'react';
import { ChevronRight, FileText, CheckSquare, CornerDownRight, Bug } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchEpics, selectEpics } from '../redux/slices/epicSlice';
import { fetchStories, selectStories } from '../redux/slices/storySlice';
import { fetchTasks, selectTasks } from '../redux/slices/taskSlice';
import { fetchBugs, selectBugs } from '../redux/slices/bugSlice';
import { fetchSubtasks } from '../redux/slices/subtaskSlice';
import { Avatar, Alert } from '../components/common';
import styles from './list.module.css';

const ListPage: React.FC = () => {
  const dispatch = useAppDispatch();
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

  useEffect(() => {
    if (activeProjectId) {
      dispatch(fetchEpics({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchStories({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchTasks({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
      dispatch(fetchBugs({ projectId: activeProjectId, params: { page: 1, limit: 100 } }));
    }
  }, [dispatch, activeProjectId]);

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
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  if (!activeProjectId) {
    return (
      <div className={styles.container}>
        <Alert severity="warning" message="Please select an active project from the sidebar to view the work outline." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Work Outline</h1>
          <p className={styles.subtitle}>Hierarchical outline of project epics, user stories, tasks, bugs, and sub-tasks</p>
        </div>
      </div>

      {epics.length === 0 ? (
        <div className={styles.emptyStateCard}>
          <h3>No Epics Found</h3>
          <p>Create epics and map stories, tasks, or bugs to them to build your project hierarchy outline.</p>
        </div>
      ) : (
        <div className={styles.tree}>
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
                      <span className={`${styles.badge} ${getStatusClass(epic.status)}`}>
                        {epic.status}
                      </span>
                    </div>
                    <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
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
                            {epicStories.map(story => {
                              const isStoryExpanded = !!expandedStories[story.id];
                              const storySubtasks = subtasksByParent[`stories:${story.id}`] || [];

                              return (
                                <React.Fragment key={story.id}>
                                  <div 
                                    className={`${styles.childRow} ${styles.taskRow}`} 
                                    onClick={() => toggleStory(story.id)}
                                  >
                                    <div className={styles.titleArea}>
                                      <ChevronRight 
                                        size={14} 
                                        className={`${styles.chevron} ${isStoryExpanded ? styles.chevronExpanded : ''}`} 
                                      />
                                      <FileText size={16} style={{ color: 'var(--color-primary)', marginRight: '6px' }} />
                                      <span className={styles.titleText} title={story.title}>{story.title}</span>
                                    </div>
                                    <div className={styles.metaArea}>
                                      <div className={`${styles.metaField} ${styles.metaAssignee}`}>
                                        {story.assignee && (
                                          <Avatar 
                                            name={`${story.assignee.firstName} ${story.assignee.lastName}`} 
                                            size={20} 
                                          />
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
                                        <span className={`${styles.badge} ${getStatusClass(story.status)}`}>
                                          {story.status}
                                        </span>
                                      </div>
                                      <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
                                    </div>
                                  </div>

                                  {isStoryExpanded && (
                                    <div className={styles.subtasksContainer}>
                                      {storySubtasks.length === 0 ? (
                                        <div style={{ padding: '0.5rem 1rem 0.5rem 3.5rem', fontSize: '0.8125rem', color: 'var(--color-neutral-400)' }}>
                                          No sub-tasks.
                                        </div>
                                      ) : (
                                        storySubtasks.map(subtask => (
                                          <div key={subtask.id} className={styles.subtaskRow}>
                                            <div className={styles.subtaskTitleArea}>
                                              <CornerDownRight size={14} style={{ color: 'var(--color-neutral-400)' }} />
                                              <span className={styles.titleText} title={subtask.title}>{subtask.title}</span>
                                            </div>
                                            <div className={styles.metaArea}>
                                              <div className={`${styles.metaField} ${styles.metaAssignee}`}>
                                                {subtask.assignee && (
                                                  <Avatar 
                                                    name={`${subtask.assignee.firstName} ${subtask.assignee.lastName}`} 
                                                    size={18} 
                                                  />
                                                )}
                                              </div>
                                              <div className={`${styles.metaField} ${styles.metaPriority}`}></div>
                                              <div className={`${styles.metaField} ${styles.metaStatus}`}>
                                                <span className={`${styles.badge} ${getStatusClass(subtask.status)}`}>
                                                  {subtask.status}
                                                </span>
                                              </div>
                                              <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
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
                                        size={14} 
                                        className={`${styles.chevron} ${isTaskExpanded ? styles.chevronExpanded : ''}`} 
                                      />
                                      <CheckSquare size={16} style={{ color: 'var(--color-success)', marginRight: '6px' }} />
                                      <span className={styles.titleText} title={task.title}>{task.title}</span>
                                    </div>
                                    <div className={styles.metaArea}>
                                      <div className={`${styles.metaField} ${styles.metaAssignee}`}>
                                        {task.assignee && (
                                          <Avatar 
                                            name={`${task.assignee.firstName} ${task.assignee.lastName}`} 
                                            size={20} 
                                          />
                                        )}
                                      </div>
                                      <div className={`${styles.metaField} ${styles.metaPriority}`}></div>
                                      <div className={`${styles.metaField} ${styles.metaStatus}`}>
                                        <span className={`${styles.badge} ${getStatusClass(task.status)}`}>
                                          {task.status}
                                        </span>
                                      </div>
                                      <div className={`${styles.metaField} ${styles.metaDueDate}`}>
                                        {task.dueDate && (
                                          <span className={styles.dateText}>{formatDate(task.dueDate)}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {isTaskExpanded && (
                                    <div className={styles.subtasksContainer}>
                                      {taskSubtasks.length === 0 ? (
                                        <div style={{ padding: '0.5rem 1rem 0.5rem 3.5rem', fontSize: '0.8125rem', color: 'var(--color-neutral-400)' }}>
                                          No sub-tasks.
                                        </div>
                                      ) : (
                                        taskSubtasks.map(subtask => (
                                          <div key={subtask.id} className={styles.subtaskRow}>
                                            <div className={styles.subtaskTitleArea}>
                                              <CornerDownRight size={14} style={{ color: 'var(--color-neutral-400)' }} />
                                              <span className={styles.titleText} title={subtask.title}>{subtask.title}</span>
                                            </div>
                                            <div className={styles.metaArea}>
                                              <div className={`${styles.metaField} ${styles.metaAssignee}`}>
                                                {subtask.assignee && (
                                                  <Avatar 
                                                    name={`${subtask.assignee.firstName} ${subtask.assignee.lastName}`} 
                                                    size={18} 
                                                  />
                                                )}
                                              </div>
                                              <div className={`${styles.metaField} ${styles.metaPriority}`}></div>
                                              <div className={`${styles.metaField} ${styles.metaStatus}`}>
                                                <span className={`${styles.badge} ${getStatusClass(subtask.status)}`}>
                                                  {subtask.status}
                                                </span>
                                              </div>
                                              <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
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

                        {epicBugs.length > 0 && (
                          <>
                            <div className={styles.sectionHeader}>Bugs</div>
                            {epicBugs.map(bug => {
                              const isBugExpanded = !!expandedBugs[bug.id];
                              const bugSubtasks = subtasksByParent[`bugs:${bug.id}`] || [];

                              return (
                                <React.Fragment key={bug.id}>
                                  <div 
                                    className={`${styles.childRow} ${styles.taskRow}`} 
                                    onClick={() => toggleBug(bug.id)}
                                  >
                                    <div className={styles.titleArea}>
                                      <ChevronRight 
                                        size={14} 
                                        className={`${styles.chevron} ${isBugExpanded ? styles.chevronExpanded : ''}`} 
                                      />
                                      <Bug size={16} style={{ color: 'var(--color-danger)', marginRight: '6px' }} />
                                      <span className={styles.titleText} title={bug.title}>{bug.title}</span>
                                    </div>
                                    <div className={styles.metaArea}>
                                      <div className={`${styles.metaField} ${styles.metaAssignee}`}>
                                        {bug.assignee && (
                                          <Avatar 
                                            name={`${bug.assignee.firstName} ${bug.assignee.lastName}`} 
                                            size={20} 
                                          />
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
                                        <span className={`${styles.badge} ${getStatusClass(bug.status)}`}>
                                          {bug.status}
                                        </span>
                                      </div>
                                      <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
                                    </div>
                                  </div>

                                  {isBugExpanded && (
                                    <div className={styles.subtasksContainer}>
                                      {bugSubtasks.length === 0 ? (
                                        <div style={{ padding: '0.5rem 1rem 0.5rem 3.5rem', fontSize: '0.8125rem', color: 'var(--color-neutral-400)' }}>
                                          No sub-tasks.
                                        </div>
                                      ) : (
                                        bugSubtasks.map(subtask => (
                                          <div key={subtask.id} className={styles.subtaskRow}>
                                            <div className={styles.subtaskTitleArea}>
                                              <CornerDownRight size={14} style={{ color: 'var(--color-neutral-400)' }} />
                                              <span className={styles.titleText} title={subtask.title}>{subtask.title}</span>
                                            </div>
                                            <div className={styles.metaArea}>
                                              <div className={`${styles.metaField} ${styles.metaAssignee}`}>
                                                {subtask.assignee && (
                                                  <Avatar 
                                                    name={`${subtask.assignee.firstName} ${subtask.assignee.lastName}`} 
                                                    size={18} 
                                                  />
                                                )}
                                              </div>
                                              <div className={`${styles.metaField} ${styles.metaPriority}`}></div>
                                              <div className={`${styles.metaField} ${styles.metaStatus}`}>
                                                <span className={`${styles.badge} ${getStatusClass(subtask.status)}`}>
                                                  {subtask.status}
                                                </span>
                                              </div>
                                              <div className={`${styles.metaField} ${styles.metaDueDate}`}></div>
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
  );
};

export default ListPage;
