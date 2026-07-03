import React, { useState } from 'react';
import { Button } from '../common';
import { Priority } from '../../common/enums';
import { X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onApplyAction: (action: { priority?: Priority, status?: string, sprintId?: string }) => void;
  onDeleteAction?: () => void;
  isApplying: boolean;
  sprints: { id: string; name: string }[];
  statusOptions?: { label: string; value: string }[];
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ 
  selectedCount, 
  onClearSelection, 
  onApplyAction, 
  onDeleteAction,
  isApplying,
  sprints,
  statusOptions
}) => {
  const [priority, setPriority] = useState<Priority | ''>('');
  const [status, setStatus] = useState<string>('');
  const [sprintId, setSprintId] = useState('');

  if (selectedCount === 0) return null;

  const handleApply = () => {
    if (!priority && !sprintId && !status) return;
    onApplyAction({
      priority: priority ? (priority as Priority) : undefined,
      status: status || undefined,
      sprintId: sprintId || undefined,
    });
    // Reset internal state after apply (the parent might also clear selection)
    setPriority('');
    setStatus('');
    setSprintId('');
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to permanently delete ${selectedCount} selected items?`)) {
      if (onDeleteAction) onDeleteAction();
    }
  };

  return (
    <div style={{
      position: 'sticky',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(0)', // Actually, we will align it within the page container
      margin: '0 auto',
      width: 'fit-content',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      padding: '0.75rem 1.5rem',
      background: 'var(--color-neutral-900)',
      color: 'white',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
        <div style={{
          background: 'var(--color-primary-500)',
          color: 'white',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem'
        }}>
          {selectedCount}
        </div>
        <span>selected</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {statusOptions && statusOptions.length > 0 && (
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'var(--color-neutral-800)', color: 'white', outline: 'none' }}
          >
            <option value="">Update Status...</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        <select 
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority | '')}
          style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'var(--color-neutral-800)', color: 'white', outline: 'none' }}
        >
          <option value="">Update Priority...</option>
          <option value={Priority.LOW}>Low</option>
          <option value={Priority.MEDIUM}>Medium</option>
          <option value={Priority.HIGH}>High</option>
        </select>

        <select 
          value={sprintId}
          onChange={(e) => setSprintId(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'var(--color-neutral-800)', color: 'white', outline: 'none' }}
        >
          <option value="">Add to Sprint...</option>
          {sprints.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <Button 
          variant="primary" 
          size="sm" 
          disabled={(!priority && !sprintId && !status) || isApplying}
          onClick={handleApply}
          loading={isApplying}
        >
          Apply
        </Button>

        {onDeleteAction && (
          <Button 
            variant="danger" 
            size="sm" 
            onClick={handleDeleteClick}
            disabled={isApplying}
          >
            Delete
          </Button>
        )}
      </div>

      <button 
        onClick={onClearSelection}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--color-neutral-400)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '0.25rem'
        }}
        aria-label="Clear selection"
      >
        <X size={20} />
      </button>
    </div>
  );
};
