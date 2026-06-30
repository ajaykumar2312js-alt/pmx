import React, { useState } from 'react';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '../Loader/Skeleton';
import { Checkbox } from '../Form/Checkbox';
import styles from './Table.module.css';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  width?: string | number;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  selectedIds?: Set<string>;
  onSelectRow?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onRowClick?: (row: T) => void;
  className?: string;
  renderRowExpansion?: (row: T) => React.ReactNode;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyMessage = 'No data available',
  selectedIds,
  onSelectRow,
  onSelectAll,
  onRowClick,
  className,
  renderRowExpansion,
}: TableProps<T>) {
  const isAllSelected = data.length > 0 && selectedIds?.size === data.length;
  const hasSelection = selectedIds !== undefined;
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const colSpanCount = columns.length + (hasSelection ? 1 : 0) + (renderRowExpansion ? 1 : 0);

  return (
    <div className={clsx(styles.container, className)}>
      <table className={styles.table}>
        <thead>
          <tr>
            {renderRowExpansion && (
              <th className={styles.th} style={{ width: '40px' }} />
            )}
            {hasSelection && (
              <th className={styles.th} style={{ width: '48px' }} onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  label="Select all"
                  className="sr-only" // hidden label
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={styles.th}
                scope="col"
                style={col.width !== undefined ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className={styles.tr}>
                {renderRowExpansion && (
                  <td className={styles.td}>
                    <Skeleton width={16} height={16} />
                  </td>
                )}
                {hasSelection && (
                  <td className={styles.td}>
                    <Skeleton width={16} height={16} />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    <Skeleton height={20} width={`${Math.random() * 40 + 40}%`} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colSpanCount} className={styles.emptyState}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const id = keyExtractor(row);
              const isSelected = selectedIds?.has(id);
              const isExpanded = expandedRowIds.has(id);

              return (
                <React.Fragment key={id}>
                  <tr 
                    className={clsx(styles.tr, { 
                      [styles.selected]: isSelected,
                      [styles.clickable]: !!onRowClick
                    })}
                    onClick={() => {
                      if (onRowClick) onRowClick(row);
                    }}
                  >
                    {renderRowExpansion && (
                      <td className={styles.td} style={{ verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={clsx(styles.expandButton, { [styles.expandButtonExpanded]: isExpanded })}
                          onClick={(e) => { e.stopPropagation(); toggleRow(id); }}
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    )}
                    {hasSelection && (
                      <td className={styles.td} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          label={`Select row ${id}`}
                          className="sr-only"
                          checked={isSelected}
                          onChange={(e) => onSelectRow?.(id, e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={styles.td}>
                        {col.render ? col.render(row) : (row[col.key as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                  {renderRowExpansion && isExpanded && (
                    <tr className={styles.expansionRow}>
                      <td colSpan={colSpanCount} className={styles.td}>
                        {renderRowExpansion(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
