import React, { useState } from 'react';
import { Input, Select, Button } from '../common';
import { Priority } from '../../common/enums';
import { BacklogListParams } from '../../services/backlogService';

interface BacklogFilterProps {
  onFilterChange: (filters: Partial<BacklogListParams>) => void;
}

export const BacklogFilter: React.FC<BacklogFilterProps> = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [epicId, setEpicId] = useState(''); // Epics will be populated dynamically in E7

  const handleApply = () => {
    onFilterChange({
      search: search || undefined,
      priority: priority || undefined,
      status: status || undefined,
      epicId: epicId || undefined,
      cursor: undefined // reset cursor on new filter
    });
  };

  const handleClear = () => {
    setSearch('');
    setPriority('');
    setStatus('');
    setEpicId('');
    onFilterChange({
      search: undefined,
      priority: undefined,
      status: undefined,
      epicId: undefined,
      cursor: undefined
    });
  };

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-end',
      padding: '1rem',
      background: 'white',
      borderRadius: 'var(--border-radius-base)',
      border: '1px solid var(--color-neutral-200)',
      marginBottom: '1.5rem'
    }}>
      <div style={{ flex: 2 }}>
        <Input 
          label="Search Keyword" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="e.g. login issue"
        />
      </div>
      
      <div style={{ flex: 1 }}>
        <Select 
          label="Priority" 
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
          options={[
            { label: 'All Priorities', value: '' },
            { label: 'Low', value: Priority.LOW },
            { label: 'Medium', value: Priority.MEDIUM },
            { label: 'High', value: Priority.HIGH },
            { label: 'Critical', value: Priority.CRITICAL },
          ]}
        />
      </div>

      <div style={{ flex: 1 }}>
        <Select 
          label="Status" 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: 'All Statuses', value: '' },
            { label: 'New', value: 'New' },
            { label: 'Ready', value: 'Ready' },
            { label: 'Refined', value: 'Refined' },
            { label: 'Closed', value: 'Closed' },
          ]}
        />
      </div>

      <div style={{ flex: 1 }}>
        <Select 
          label="Epic" 
          value={epicId} 
          onChange={(e) => setEpicId(e.target.value)}
          options={[
            { label: 'All Epics', value: '' },
            // Mocks until Epic list is available (E7)
            { label: 'Mock Epic A', value: 'mock-epic-a' },
            { label: 'Mock Epic B', value: 'mock-epic-b' },
          ]}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <Button variant="secondary" onClick={handleClear}>Clear</Button>
        <Button variant="primary" onClick={handleApply}>Filter</Button>
      </div>
    </div>
  );
};
