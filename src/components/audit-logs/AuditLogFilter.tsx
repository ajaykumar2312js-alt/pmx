import React from 'react';
import { Filter } from 'lucide-react';
import styles from './AuditLogFilter.module.css';

interface AuditLogFilterProps {
  filters: {
    entityType?: string;
    action?: string;
    userId?: string;
  };
  users: Array<{ id: string; firstName: string; lastName: string }>;
  onFilterChange: (filters: { entityType?: string; action?: string; userId?: string }) => void;
}

export const AuditLogFilter: React.FC<AuditLogFilterProps> = ({ filters, users, onFilterChange }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Filter size={18} className={styles.icon} />
        <span className={styles.title}>Filter Logs</span>
      </div>
      
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label htmlFor="entityType" className={styles.label}>Entity Type</label>
          <select 
            id="entityType"
            className={styles.select}
            value={filters.entityType || ''}
            onChange={(e) => onFilterChange({ entityType: e.target.value })}
          >
            <option value="">All Entities</option>
            <option value="Project">Project</option>
            <option value="Epic">Epic</option>
            <option value="Sprint">Sprint</option>
            <option value="Story">Story</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Subtask">Subtask</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="action" className={styles.label}>Action</label>
          <select 
            id="action"
            className={styles.select}
            value={filters.action || ''}
            onChange={(e) => onFilterChange({ action: e.target.value })}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="userId" className={styles.label}>User</label>
          <select 
            id="userId"
            className={styles.select}
            value={filters.userId || ''}
            onChange={(e) => onFilterChange({ userId: e.target.value })}
          >
            <option value="">All Users</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
            ))}
          </select>
        </div>
        
        {(filters.entityType || filters.action || filters.userId) && (
          <button 
            className={styles.clearBtn}
            onClick={() => onFilterChange({ entityType: '', action: '', userId: '' })}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
