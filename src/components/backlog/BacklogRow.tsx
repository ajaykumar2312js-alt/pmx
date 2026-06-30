import React from 'react';
import { Badge, Checkbox, Button } from '../common';
import { BacklogItem, BacklogItemStatus } from '../../services/backlogService';
import { Priority } from '../../common/enums';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../../routes/routePaths';

interface BacklogRowProps {
  item: BacklogItem;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEditClick: (id: string) => void;
  onDeleteClick?: (id: string, title: string) => void;
  onStatusChange: (id: string, newStatus: BacklogItemStatus) => void;
}

export const BacklogRow: React.FC<BacklogRowProps> = ({ item, isSelected, onToggleSelection, onEditClick, onDeleteClick, onStatusChange }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr 100px 100px 100px auto',
      gap: '1rem',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid var(--color-neutral-200)',
      background: 'white',
      width: '100%',
      flex: 1,
    }}>
      <div>
        <Checkbox 
          label=""
          checked={isSelected}
          onChange={() => onToggleSelection(item.id)}
          aria-label={`Select ${item.title}`}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontWeight: 500 }}>{item.title}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{item.id}</span>
      </div>

      <div>
        {item.type ? (
          <Badge level={item.type as unknown as Priority} /> // Needs proper Type Badge
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Unrefined</span>
        )}
      </div>

      <div>
        <Badge level={item.priority} />
      </div>

      <div>
        <select 
          value={item.status} 
          onChange={(e) => onStatusChange(item.id, e.target.value as BacklogItemStatus)}
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: '1px solid var(--color-neutral-300)',
            backgroundColor: 'var(--color-neutral-100)',
            color: 'var(--color-neutral-700)',
            cursor: 'pointer'
          }}
        >
          <option value="New">New</option>
          <option value="Ready">Ready</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {item.type ? (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => {
              if (item.type === 'STORY') navigate(RoutePaths.STORY_DETAIL(item.id));
              else if (item.type === 'TASK') navigate(RoutePaths.TASK_DETAIL(item.id));
              else if (item.type === 'BUG') navigate(RoutePaths.BUG_DETAIL(item.id));
              else if (item.type === 'EPIC') navigate(RoutePaths.EPIC_DETAIL(item.id));
            }}
          >
            Edit
          </Button>
        ) : (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onEditClick(item.id)}
            disabled={item.status === 'Closed'}
          >
            Edit
          </Button>
        )}
        {onDeleteClick && (
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => onDeleteClick(item.id, item.title)}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
