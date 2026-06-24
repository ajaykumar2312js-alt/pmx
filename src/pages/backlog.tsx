import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { Button, Alert } from '../components/common';
import { 
  BacklogList, 
  BacklogFilter, 
  BulkActionBar, 
  CreateBacklogItemModal, 
  RefineItemModal 
} from '../components/backlog';
import { fetchBacklogItems, selectSelectedIds, clearSelection, bulkUpdateBacklogItems } from '../redux/slices/backlogSlice';
import { fetchSprints, selectSprints } from '../redux/slices/sprintSlice';
import { enqueueToast } from '../redux/slices/uiSlice';
import { Priority } from '../common/enums';
import { BacklogListParams } from '../services/backlogService';

const BacklogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);
  const selectedIds = useAppSelector(selectSelectedIds);
  const sprints = useAppSelector(selectSprints);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refineItemId, setRefineItemId] = useState<string | null>(null);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  React.useEffect(() => {
    if (activeProjectId) {
      dispatch(fetchSprints(activeProjectId));
    }
  }, [dispatch, activeProjectId]);

  if (!activeProjectId) {
    return (
      <div className="page-container">
        <Alert severity="warning" message="Please select an active project from the Projects page to view the backlog." />
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={() => window.location.href = '/projects'}>Go to Projects</Button>
        </div>
      </div>
    );
  }

  const handleFilterChange = (filters: Partial<BacklogListParams>) => {
    dispatch(fetchBacklogItems({ projectId: activeProjectId, ...filters, limit: 50 }));
  };

  const handleBulkAction = async (action: { priority?: Priority, sprintId?: string }) => {
    setIsApplyingBulk(true);
    try {
      await dispatch(bulkUpdateBacklogItems({
        projectId: activeProjectId,
        payload: {
          itemIds: selectedIds,
          priority: action.priority,
          sprintId: action.sprintId
        }
      })).unwrap();
      dispatch(enqueueToast({ message: `Bulk updated ${selectedIds.length} items`, severity: 'success' }));
    } catch (err: unknown) {
      const error = err as { message?: string };
      dispatch(enqueueToast({ message: error.message || 'Partial failure during bulk update', severity: 'error' }));
    } finally {
      setIsApplyingBulk(false);
    }
  };

  return (
    <div className="page-container" style={{ position: 'relative', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Product Backlog</h1>
        <Button onClick={() => setShowCreateModal(true)}>Create Backlog Item</Button>
      </div>

      <BacklogFilter onFilterChange={handleFilterChange} />
      
      <BacklogList 
        projectId={activeProjectId} 
        onRefineItem={(id) => setRefineItemId(id)}
      />

      {selectedIds.length > 0 && (
        <BulkActionBar 
          selectedCount={selectedIds.length}
          onClearSelection={() => dispatch(clearSelection())}
          onApplyAction={handleBulkAction}
          isApplying={isApplyingBulk}
          sprints={sprints}
        />
      )}

      {showCreateModal && (
        <CreateBacklogItemModal 
          projectId={activeProjectId} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}

      {refineItemId && (
        <RefineItemModal 
          itemId={refineItemId}
          onClose={() => setRefineItemId(null)}
        />
      )}
    </div>
  );
};

export default BacklogPage;
