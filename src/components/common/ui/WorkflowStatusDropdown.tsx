import React from 'react';
import { StatusDropdown } from './StatusDropdown';
import { KANBAN_STATUSES } from '../../../common/kanbanStatuses';

interface WorkflowStatusDropdownProps {
  value: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const OPTIONS = KANBAN_STATUSES.map(s => ({ value: s.id, label: s.label }));
const COLOR_MAP = KANBAN_STATUSES.reduce<Record<string, { bg: string; color: string }>>((acc, s) => {
  acc[s.id] = { bg: s.color.bg, color: s.color.text };
  return acc;
}, {});

export const WorkflowStatusDropdown: React.FC<WorkflowStatusDropdownProps> = ({ value, onChange, disabled, size }) => (
  <StatusDropdown
    value={value}
    options={OPTIONS}
    onChange={onChange}
    colorMap={COLOR_MAP}
    disabled={disabled}
    size={size}
  />
);
