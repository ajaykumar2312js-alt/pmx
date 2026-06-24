import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchBacklogItems, selectBacklogItems, selectBacklogStatus, selectBacklogMeta, selectSelectedIds, toggleSelection, selectAll, optimisticReorder, reorderBacklogItem } from '../../redux/slices/backlogSlice';
import { BacklogRow } from './BacklogRow';
import { SortableList } from '../common/ui/DragDrop';
import { Spinner, Alert, Pagination, Checkbox } from '../common';
import { BacklogItem } from '../../services/backlogService';
import { enqueueToast } from '../../redux/slices/uiSlice';

interface BacklogListProps {
  projectId: string;
  onRefineItem: (id: string) => void;
}

export const BacklogList: React.FC<BacklogListProps> = ({ projectId, onRefineItem }) => {
  const dispatch = useAppDispatch();
  const allItems = useAppSelector(selectBacklogItems);
  const items = allItems.filter(item => !item.sprintId);
  const status = useAppSelector(selectBacklogStatus);
  const meta = useAppSelector(selectBacklogMeta);
  const selectedIds = useAppSelector(selectSelectedIds);

  const [cursor, setCursor] = useState<string | undefined>();
  const [direction, setDirection] = useState<'next' | 'prev' | undefined>();

  useEffect(() => {
    dispatch(fetchBacklogItems({ projectId, cursor, direction, limit: 50 }));
  }, [dispatch, projectId, cursor, direction]);

  const handlePageChange = (newCursor?: string, newDir?: 'next' | 'prev') => {
    setCursor(newCursor);
    setDirection(newDir);
  };

  const handleReorder = async (newItems: BacklogItem[]) => {
    // Find the item that moved.
    // In a real LexoRank system we would compute the new rank based on neighbors.
    // For now, we simulate this by passing the new rank and optimistically updating the UI.
    
    // Check if an active sprint item is being moved (PRD 10.4 constraint)
    const movedItem = newItems.find((item, index) => item.id !== items[index]?.id);
    if (movedItem?.sprintId) {
      dispatch(enqueueToast({ 
        message: 'Warning: Reordering an item in an active sprint does not affect its sprint priority.', 
        severity: 'warning' 
      }));
    }

    const originalItems = [...allItems];
    const sprintItems = allItems.filter(item => item.sprintId);
    const mergedItems = [...newItems, ...sprintItems];
    dispatch(optimisticReorder(mergedItems));

    // Assume the backend accepts sourceId, destinationId, and we pass a dummy 'newRank'
    // A robust app would compute LexoRank on the client or server.
    if (movedItem) {
      const destinationIndex = newItems.findIndex(i => i.id === movedItem.id);
      const destinationItem = originalItems[destinationIndex];
      
      if (destinationItem) {
        dispatch(reorderBacklogItem({
          projectId,
          payload: { sourceId: movedItem.id, destinationId: destinationItem.id, newRank: 'computed-rank' },
          originalItems
        }));
      }
    }
  };

  const handleToggleAll = () => {
    dispatch(selectAll(selectedIds.length !== items.length));
  };

  if (status === 'loading' && items.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>;
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr 100px 100px 100px 150px auto',
        gap: '1rem',
        padding: '0.75rem 1rem 0.75rem 3.5rem', // Offset for drag handle
        background: 'var(--color-neutral-100)',
        borderBottom: '2px solid var(--color-neutral-200)',
        fontWeight: 600,
        fontSize: '0.875rem'
      }}>
        <div>
          <Checkbox 
            label="All"
            checked={items.length > 0 && selectedIds.length === items.length}
            onChange={handleToggleAll}
          />
        </div>
        <div>Title</div>
        <div>Type</div>
        <div>Priority</div>
        <div>Status</div>
        <div>Epic</div>
        <div>Actions</div>
      </div>

      {items.length === 0 ? (
        <div style={{ marginTop: '1rem' }}>
          <Alert severity="info" message="Backlog is empty." />
        </div>
      ) : (
        <SortableList<BacklogItem>
          items={items}
          keyExtractor={(item) => item.id}
          onReorder={handleReorder}
          renderItem={(item) => (
            <BacklogRow 
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelection={(id) => dispatch(toggleSelection(id))}
              onRefineClick={onRefineItem}
            />
          )}
        />
      )}

      {meta && (
        <div style={{ marginTop: '1.5rem' }}>
          <Pagination 
            meta={meta} 
            onNext={() => handlePageChange(meta.nextCursor || undefined, 'next')}
            onPrev={() => handlePageChange(meta.prevCursor || undefined, 'prev')}
          />
        </div>
      )}
    </div>
  );
};
