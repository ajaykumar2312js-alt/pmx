export interface KanbanStatus {
  id: string;
  label: string;
  category: 'TODO' | 'IN_PROGRESS' | 'DONE';
  color: { bg: string; text: string };
}

export const KANBAN_STATUSES: KanbanStatus[] = [
  { id: 'To Do',       label: 'To Do',       category: 'TODO',        color: { bg: '#f1f5f9', text: '#475569' } },
  { id: 'In Progress', label: 'In Progress',  category: 'IN_PROGRESS', color: { bg: '#dbeafe', text: '#1d4ed8' } },
  { id: 'In Review',   label: 'In Review',    category: 'IN_PROGRESS', color: { bg: '#fef3c7', text: '#b45309' } },
  { id: 'Done',        label: 'Done',         category: 'DONE',        color: { bg: '#dcfce7', text: '#16a34a' } },
];

export const KANBAN_STATUS_IDS = new Set(KANBAN_STATUSES.map(s => s.id));

export const DEFAULT_STATUS = 'To Do';
