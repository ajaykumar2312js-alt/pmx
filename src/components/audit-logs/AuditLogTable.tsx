import React from 'react';
import { AuditLog, AuditLogMeta } from '../../services/auditLogService';
import { Avatar } from '../common/ui';
import styles from './AuditLogTable.module.css';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  meta: AuditLogMeta | null;
  onPageChange: (page: number) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, loading, meta, onPageChange }) => {
  if (loading) {
    return <div className={styles.loading}>Loading audit logs...</div>;
  }

  if (logs.length === 0) {
    return <div className={styles.empty}>No audit logs found.</div>;
  }

  const renderChanges = (changes?: Record<string, unknown>) => {
    if (!changes) return <span className={styles.noChanges}>-</span>;
    
    return (
      <div className={styles.changesContainer}>
        {Object.entries(changes).slice(0, 3).map(([key, value]) => (
          <div key={key} className={styles.changeItem}>
            <span className={styles.changeKey}>{key}:</span>
            <span className={styles.changeValue} title={JSON.stringify(value)}>
              {typeof value === 'object' ? JSON.stringify(value).substring(0, 30) + '...' : String(value)}
            </span>
          </div>
        ))}
        {Object.keys(changes).length > 3 && (
          <div className={styles.moreChanges}>+{Object.keys(changes).length - 3} more</div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>ID</th>
              <th>Changes</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className={styles.row}>
                <td className={styles.userCell}>
                  {log.user ? (
                    <div className={styles.userInfo}>
                      <Avatar name={`${log.user.firstName} ${log.user.lastName}`} src={log.user.avatarUrl} size={24} />
                      <span>{log.user.firstName} {log.user.lastName}</span>
                    </div>
                  ) : (
                    <span className={styles.systemUser}>System</span>
                  )}
                </td>
                <td>
                  <span className={`${styles.actionBadge} ${styles[log.action.toLowerCase()]}`}>
                    {log.action}
                  </span>
                </td>
                <td className={styles.entityCell}>{log.entityType}</td>
                <td className={styles.idCell} title={log.entityId}>
                  {log.entityId.substring(0, 8)}...
                </td>
                <td className={styles.changesCell}>{renderChanges(log.changes)}</td>
                <td className={styles.timeCell} title={new Date(log.timestamp).toLocaleString()}>
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            disabled={meta.page <= 1} 
            onClick={() => onPageChange(meta.page - 1)}
            className={styles.pageButton}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button 
            disabled={meta.page >= meta.totalPages} 
            onClick={() => onPageChange(meta.page + 1)}
            className={styles.pageButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
