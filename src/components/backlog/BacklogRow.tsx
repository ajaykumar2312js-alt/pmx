import React from 'react';
import { Badge, Checkbox, Button } from '../common';
import { BacklogItem } from '../../services/backlogService';
import { Priority } from '../../common/enums';

interface BacklogRowProps {
  item: BacklogItem;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onRefineClick: (id: string) => void;
}

export const BacklogRow: React.FC<BacklogRowProps> = ({ item, isSelected, onToggleSelection, onRefineClick }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr 100px 100px 100px 150px auto',
      gap: '1rem',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid var(--color-neutral-200)',
      background: 'white',
      width: '100%',
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
        <span style={{
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--border-radius-full)',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: item.status === 'Refined' ? 'var(--color-success-100)' : 'var(--color-neutral-100)',
          color: item.status === 'Refined' ? 'var(--color-success-700)' : 'var(--color-neutral-700)'
        }}>{item.status}</span>
      </div>

      <div>
        {item.epic ? (
          <span style={{ fontSize: '0.875rem', color: 'var(--color-primary-600)' }}>{item.epic.name}</span>
        ) : (
          <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>No Epic</span>
        )}
      </div>

      <div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onRefineClick(item.id)}
          disabled={item.status === 'Refined'}
        >
          Refine
        </Button>
      </div>
    </div>
  );
};
