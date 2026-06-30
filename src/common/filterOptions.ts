/**
 * Single source of truth for work-item filter dropdown options.
 *
 * Stories, Tasks, and Bugs all share the same filter UX, so their option
 * lists (values + human-readable labels) are derived here to keep them
 * standardized and consistent across every page.
 */
import { Severity, Priority } from './enums';
import { KANBAN_STATUSES } from './kanbanStatuses';

export interface FilterOption {
  value: string;
  label: string;
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  [Severity.LOW]: 'Low',
  [Severity.MEDIUM]: 'Medium',
  [Severity.HIGH]: 'High',
  [Severity.CRITICAL]: 'Critical',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.LOW]: 'Low',
  [Priority.MEDIUM]: 'Medium',
  [Priority.HIGH]: 'High',
  [Priority.CRITICAL]: 'Critical',
};

const allOption = (label: string): FilterOption => ({ value: '', label });

export const UNASSIGNED_VALUE = 'UNASSIGNED';

export interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
}

export interface NamedEntity {
  id: string;
  name: string;
}

export const workflowStatusFilterOptions = (): FilterOption[] => [
  allOption('All Statuses'),
  ...KANBAN_STATUSES.map((s) => ({ value: s.id, label: s.label })),
];

export const severityFilterOptions = (): FilterOption[] => [
  allOption('All Severities'),
  ...Object.values(Severity).map((s) => ({ value: s, label: SEVERITY_LABELS[s] })),
];

export const priorityFilterOptions = (): FilterOption[] => [
  allOption('All Priorities'),
  ...Object.values(Priority).map((p) => ({ value: p, label: PRIORITY_LABELS[p] })),
];

export const assigneeFilterOptions = (users: AssignableUser[]): FilterOption[] => [
  allOption('All Assignees'),
  { value: UNASSIGNED_VALUE, label: 'Unassigned' },
  ...users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` })),
];

export const epicFilterOptions = (epics: NamedEntity[]): FilterOption[] => [
  allOption('All Epics'),
  ...epics.map((e) => ({ value: e.id, label: e.name })),
];
