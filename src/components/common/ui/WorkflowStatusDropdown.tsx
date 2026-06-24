import React from 'react';
import { StatusDropdown } from './StatusDropdown';
import { useAppSelector } from '../../../redux/hooks';
import { selectActiveProject } from '../../../redux/slices/projectSlice';

interface WorkflowStatusDropdownProps {
  value: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const WorkflowStatusDropdown: React.FC<WorkflowStatusDropdownProps> = ({ value, onChange, disabled, size }) => {
  const project = useAppSelector(selectActiveProject);
  const statuses = project?.workflowStatuses || [];

  const options = statuses.map((s: any) => ({ value: s.id, label: s.label }));
  const colorMap = statuses.reduce((acc: any, s: any) => {
    acc[s.id] = { bg: s.color, color: '#1e293b' }; 
    return acc;
  }, {} as Record<string, { bg: string; color: string }>);

  if (!options.find((o: any) => String(o.value) === String(value))) {
    options.push({ value, label: value });
  }

  return (
    <StatusDropdown
      value={value}
      options={options}
      onChange={onChange}
      colorMap={colorMap}
      disabled={disabled}
      size={size}
    />
  );
};
