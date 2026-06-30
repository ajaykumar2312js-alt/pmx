import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchTaskDetail, selectCurrentTask, selectTaskDetailStatus, updateTask, deleteTask } from '../../redux/slices/taskSlice';
import { Card, Spinner, Alert, CommentThread, Button } from '../common';
import { TimeTracker } from './TimeTracker';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { InlineEdit, WorkflowStatusDropdown } from '../common/ui';
import { SubtaskList } from '../subtasks/SubtaskList';
import { enqueueToast } from '../../redux/slices/uiSlice';

import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../../routes/routePaths';
import { TaskPayload } from '../../services/taskService';
import { Trash2 } from 'lucide-react';

interface TaskDetailProps {
  taskId: string;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ taskId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const task = useAppSelector(selectCurrentTask);
  const status = useAppSelector(selectTaskDetailStatus);
  const users = useAppSelector(selectUsers);

  useEffect(() => {
    dispatch(fetchTaskDetail(taskId));
    dispatch(fetchUsers({ limit: 100 }));
  }, [dispatch, taskId]);

  if (status === 'loading') return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>;
  if (status === 'failed' || !task) return <Alert severity="error" message="Failed to load task details." />;

  const handleFieldSave = async (field: keyof TaskPayload, value: TaskPayload[keyof TaskPayload]) => {
    if (!task) return;
    const payload = { [field]: value };
    await dispatch(updateTask({ id: task.id, payload })).unwrap();
    dispatch(enqueueToast({ message: `Task updated`, severity: 'success' }));
  };

  const userOptions = users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
  
  const handleTimeSave = async (estimated: number | undefined, actual: number | undefined) => {
    await dispatch(updateTask({ id: task.id, payload: { estimatedHours: estimated, actualHours: actual } })).unwrap();
    dispatch(enqueueToast({ message: 'Time tracking updated', severity: 'success' }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary-600)' }}>Task</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--color-neutral-400)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                {task.epicId
                  ? <span style={{ cursor: 'pointer', color: 'var(--color-primary-500)' }} onClick={() => navigate(RoutePaths.EPIC_DETAIL(task.epicId!))}>Epic: {task.epic?.name} →</span>
                  : 'No Epic linked'}
              </span>
            </div>
            <InlineEdit
              value={task.title}
              onSave={(val) => handleFieldSave('title', val)}
              type="text"
              textStyle={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'block' }}
            />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Status:</strong>
                <WorkflowStatusDropdown
                  value={task.status}
                  onChange={(val) => handleFieldSave('status', val as string)}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={async () => {
                if (window.confirm(`Are you sure you want to delete Task "${task.title}"?`)) {
                  try {
                    await dispatch(deleteTask(task.id)).unwrap();
                    dispatch(enqueueToast({ message: 'Task deleted', severity: 'success' }));
                    navigate(RoutePaths.TASKS);
                  } catch {
                    dispatch(enqueueToast({ message: 'Failed to delete task', severity: 'error' }));
                  }
                }
              }}
            >
              <Trash2 size={14} style={{ marginRight: '0.25rem', color: 'var(--color-danger)' }} /> Delete
            </Button>
          </div>
        </div>

        {/* Description & Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.75rem' }}>Description</h4>
            <InlineEdit
              value={task.description}
              onSave={(val) => handleFieldSave('description', val)}
              type="textarea"
              placeholder="Add a description..."
              textStyle={{ color: 'var(--color-neutral-800)', minHeight: '100px', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '1px solid var(--color-neutral-200)', paddingLeft: '2rem' }}>
            <div style={{ fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>Assignee</div>
              <InlineEdit
                value={task.assigneeId ?? undefined}
                onSave={(val) => handleFieldSave('assigneeId', val)}
                type="select"
                options={userOptions}
                placeholder="Unassigned"
              />
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>Due Date</div>
              <InlineEdit
                value={task.dueDate}
                onSave={(val) => handleFieldSave('dueDate', val)}
                type="date"
                placeholder="None set"
              />
            </div>
            
            <TimeTracker 
              estimatedHours={task.estimatedHours} 
              actualHours={task.actualHours} 
              onSave={handleTimeSave} 
            />
          </div>
        </div>
      </Card>

      <Card style={{ padding: '1.5rem' }}>
        <SubtaskList parentType="tasks" parentId={task.id} />
      </Card>

      <Card style={{ padding: '1.5rem' }}>
        <CommentThread parentType="tasks" parentId={task.id} />
      </Card>
    </div>
  );
};
