import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchAuditLogs, selectAuditLogs, selectAuditLogsMeta, selectAuditLogsStatus } from '../../redux/slices/auditLogSlice';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { AuditLogTable } from '../../components/audit-logs/AuditLogTable';
import { AuditLogFilter } from '../../components/audit-logs/AuditLogFilter';
import styles from './AuditLogs.module.css';

const AuditLogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const logs = useAppSelector(selectAuditLogs);
  const meta = useAppSelector(selectAuditLogsMeta);
  const status = useAppSelector(selectAuditLogsStatus);
  const users = useAppSelector(selectUsers);
  
  const [filters, setFilters] = useState({ entityType: '', action: '', userId: '' });
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    dispatch(fetchAuditLogs({
      skip: (page - 1) * limit,
      limit,
      ...filters
    }));
  }, [dispatch, page, filters]);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers({ page: 1, limit: 100 }));
    }
  }, [dispatch, users.length]);

  const handleFilterChange = (newFilters: { entityType?: string; action?: string; userId?: string }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Audit Logs</h1>
        <p className={styles.description}>Track all system activities and entity changes.</p>
      </div>
      
      <div className={styles.content}>
        <AuditLogFilter filters={filters} users={users} onFilterChange={handleFilterChange} />
        
        <div className={styles.tableWrapper}>
          <AuditLogTable 
            logs={logs} 
            loading={status === 'loading'} 
            meta={meta}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
