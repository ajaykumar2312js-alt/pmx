import React from 'react';
import { Input, Select } from '../common/ui';
import { Severity } from '../../common/enums';
import {
  workflowStatusFilterOptions,
  severityFilterOptions,
  assigneeFilterOptions,
  epicFilterOptions,
  NamedEntity,
} from '../../common/filterOptions';

interface BugFilterProps {
  search: string;
  onSearchChange: (s: string) => void;
  epicId: string;
  onEpicChange: (e: string) => void;
  epics: NamedEntity[];
  severity: Severity | '';
  onSeverityChange: (s: Severity | '') => void;
  status: string;
  onStatusChange: (s: string) => void;
  assigneeId: string;
  onAssigneeChange: (a: string) => void;
  users: { id: string; firstName: string; lastName: string }[];
}

import { useAppSelector } from '../../redux/hooks';
import { selectActiveProject } from '../../redux/slices/projectSlice';

export const BugFilter: React.FC<BugFilterProps> = ({
  search,
  onSearchChange,
  epicId,
  onEpicChange,
  epics,
  severity,
  onSeverityChange,
  status,
  onStatusChange,
  assigneeId,
  onAssigneeChange,
  users,
}) => {
  const activeProject = useAppSelector(selectActiveProject);
  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end', background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid var(--color-neutral-200)' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <Input label="Search" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search bugs…" />
      </div>
      <div style={{ width: '200px' }}>
        <Select
          label="Epic"
          value={epicId}
          onChange={(e) => onEpicChange(e.target.value)}
          options={epicFilterOptions(epics)}
        />
      </div>
      <div style={{ width: '200px' }}>
        <Select
          label="Status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          options={workflowStatusFilterOptions()}
        />
      </div>
      <div style={{ width: '200px' }}>
        <Select
          label="Severity"
          value={severity}
          onChange={(e) => onSeverityChange(e.target.value as Severity | '')}
          options={severityFilterOptions()}
        />
      </div>
      <div style={{ width: '200px' }}>
        <Select
          label="Assignee"
          value={assigneeId}
          onChange={(e) => onAssigneeChange(e.target.value)}
          options={assigneeFilterOptions(users)}
        />
      </div>
    </div>
  );
};
