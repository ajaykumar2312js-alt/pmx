import React from 'react';
import { useAppSelector } from '../../redux/hooks';
import { selectStories } from '../../redux/slices/storySlice';
import { selectTasks } from '../../redux/slices/taskSlice';
import { selectBugs } from '../../redux/slices/bugSlice';
import { FileText, CheckSquare, Bug } from 'lucide-react';
import { Avatar, Badge } from '../common';
import { SubtaskList } from '../subtasks/SubtaskList';
import { Priority, Severity } from '../../common/enums';

interface EpicChildrenListProps {
  epicId: string;
}

interface Assignee {
  id: string;
  firstName: string;
  lastName: string;
}

export const EpicChildrenList: React.FC<EpicChildrenListProps> = ({ epicId }) => {
  const stories = useAppSelector(selectStories).filter(s => s.epicId === epicId);
  const tasks = useAppSelector(selectTasks).filter(t => t.epicId === epicId);
  const bugs = useAppSelector(selectBugs).filter(b => b.parentType === 'EPIC' && b.parentId === epicId);

  if (stories.length === 0 && tasks.length === 0 && bugs.length === 0) {
    return (
      <div style={{ padding: '1rem', color: 'var(--color-neutral-500)', fontSize: '0.875rem', textAlign: 'center' }}>
        No items mapped to this Epic.
      </div>
    );
  }

  const renderAssignee = (assignee: Assignee | null | undefined) => {
    if (!assignee) return <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>Unassigned</span>;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Avatar name={`${assignee.firstName} ${assignee.lastName}`} size={20} />
        <span style={{ fontSize: '0.85rem' }}>{assignee.firstName} {assignee.lastName}</span>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
      case 'Done':
      case 'RESOLVED':
      case 'CLOSED':
        return { bg: '#d1fae5', text: '#065f46' };
      case 'IN_PROGRESS':
      case 'In Progress':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'IN_REVIEW':
      case 'In Review':
        return { bg: '#fef3c7', text: '#92400e' };
      default:
        return { bg: 'var(--color-neutral-200)', text: 'var(--color-neutral-700)' };
    }
  };

  const renderRow = (
    id: string,
    title: string,
    type: 'story' | 'task' | 'bug',
    status: string,
    assignee: Assignee | null | undefined,
    priority?: Priority | Severity,
  ) => {
    const Icon = type === 'story' ? FileText : type === 'task' ? CheckSquare : Bug;
    const iconColor = type === 'story' ? 'var(--color-primary)' : type === 'task' ? 'var(--color-success)' : 'var(--color-danger)';
    const statusStyle = getStatusColor(status);

    return (
      <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '0.75rem 1rem', border: '1px solid var(--color-neutral-200)', 
          borderRadius: '8px', backgroundColor: 'white' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <Icon size={16} style={{ color: iconColor }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-neutral-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            <div style={{ width: '120px' }}>{renderAssignee(assignee)}</div>
            <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
              {priority && <Badge level={priority} />}
            </div>
            <div style={{ width: '100px', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ 
                fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', 
                borderRadius: '999px', textTransform: 'uppercase', 
                backgroundColor: statusStyle.bg, color: statusStyle.text 
              }}>
                {status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Render Subtasks slightly indented */}
        <div style={{ paddingLeft: '2rem', paddingRight: '1rem' }}>
          <SubtaskList parentType={type === 'story' ? 'stories' : type === 'task' ? 'tasks' : 'bugs'} parentId={id} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#fafafa', borderTop: '1px solid var(--color-neutral-200)', borderBottom: '1px solid var(--color-neutral-200)' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {stories.map(s => renderRow(s.id, s.title, 'story', s.status, s.assignee ?? null, s.priority))}
        {tasks.map(t => renderRow(t.id, t.title, 'task', t.status, t.assignee ?? null))}
        {bugs.map(b => renderRow(b.id, b.title, 'bug', b.status, b.assignee ?? null, b.priority))}
      </div>
    </div>
  );
};
