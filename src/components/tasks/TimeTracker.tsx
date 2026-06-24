import React, { useState } from 'react';
import { Button } from '../common/ui';

interface TimeTrackerProps {
  estimatedHours?: number;
  actualHours?: number;
  onSave: (estimated: number | undefined, actual: number | undefined) => void;
  readOnly?: boolean;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ estimatedHours, actualHours, onSave, readOnly }) => {
  const [est, setEst] = useState<string>(estimatedHours ? estimatedHours.toString() : '');
  const [act, setAct] = useState<string>(actualHours ? actualHours.toString() : '');
  const [isEditing, setIsEditing] = useState(!readOnly && (!estimatedHours && !actualHours));

  const handleSave = () => {
    const estVal = est.trim() === '' ? undefined : parseFloat(est);
    const actVal = act.trim() === '' ? undefined : parseFloat(act);
    
    // Only save if numeric or empty
    if ((estVal === undefined || !isNaN(estVal)) && (actVal === undefined || !isNaN(actVal))) {
      onSave(estVal, actVal);
      setIsEditing(false);
    }
  };

  if (readOnly || !isEditing) {
    const displayEst = estimatedHours ?? 0;
    const displayAct = actualHours ?? 0;
    const displayVar = displayEst - displayAct;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-neutral-700)' }}>Time Tracking</span>
          {!readOnly && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--color-neutral-50)', borderRadius: '4px' }}>
            <div style={{ color: 'var(--color-neutral-500)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Estimated</div>
            <div style={{ fontWeight: 500 }}>{displayEst}h</div>
          </div>
          <div style={{ padding: '0.5rem', background: 'var(--color-neutral-50)', borderRadius: '4px' }}>
            <div style={{ color: 'var(--color-neutral-500)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Actual</div>
            <div style={{ fontWeight: 500 }}>{displayAct}h</div>
          </div>
        </div>
        
        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: displayVar < 0 ? 'var(--color-danger-600)' : 'var(--color-success-600)' }}>
          {displayVar < 0 ? `Over by ${Math.abs(displayVar)}h` : `Under by ${displayVar}h`}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
      <div style={{ fontWeight: 600, color: 'var(--color-neutral-700)' }}>Time Tracking</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--color-neutral-600)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Estimated (h)</label>
          <input 
            type="number" 
            min="0" 
            step="0.5" 
            value={est} 
            onChange={(e) => setEst(e.target.value)}
            style={{ width: '100%', padding: '0.375rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-neutral-300)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--color-neutral-600)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Actual (h)</label>
          <input 
            type="number" 
            min="0" 
            step="0.5" 
            value={act} 
            onChange={(e) => setAct(e.target.value)}
            style={{ width: '100%', padding: '0.375rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-neutral-300)' }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
        {(estimatedHours !== undefined || actualHours !== undefined) && (
          <Button variant="ghost" size="sm" onClick={() => {
            setEst(estimatedHours ? estimatedHours.toString() : '');
            setAct(actualHours ? actualHours.toString() : '');
            setIsEditing(false);
          }}>Cancel</Button>
        )}
        <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};
