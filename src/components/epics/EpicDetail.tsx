import React, { useEffect } from 'react';
import { Card, ProgressBar, Spinner, Alert, Button } from '../common';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchEpicDetail, selectCurrentEpic, selectEpicDetailStatus, updateEpic, deleteEpic } from '../../redux/slices/epicSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { EpicPayload } from '../../services/epicService';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { InlineEdit, StatusDropdown } from '../common/ui';
import { KANBAN_STATUSES } from '../../common/kanbanStatuses';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../../routes/routePaths';
import { Trash2 } from 'lucide-react';

interface EpicDetailProps {
  epicId: string;
}

export const EpicDetail: React.FC<EpicDetailProps> = ({ epicId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const epic = useAppSelector(selectCurrentEpic);
  const status = useAppSelector(selectEpicDetailStatus);
  const users = useAppSelector(selectUsers);

  useEffect(() => {
    if (epicId) {
      dispatch(fetchEpicDetail(epicId));
      dispatch(fetchUsers({ limit: 100 }));
    }
  }, [dispatch, epicId]);

  if (status === 'loading') {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>;
  }

  if (status === 'failed' || !epic) {
    return <Alert severity="error" message="Failed to load Epic details." />;
  }

  const handleFieldSave = async (field: keyof EpicPayload, value: EpicPayload[keyof EpicPayload]) => {
    if (!epic) return;
    const payload = { [field]: value };
    await dispatch(updateEpic({ id: epic.id, payload })).unwrap();
    dispatch(enqueueToast({ message: `Epic updated`, severity: 'success' }));
  };

  const userOptions = users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
  const statusOptions = KANBAN_STATUSES.map(s => ({ label: s.label, value: s.id }));
  const statusColorMap = KANBAN_STATUSES.reduce<Record<string, { bg: string; color: string }>>((acc, s) => {
    acc[s.id] = { bg: s.color.bg, color: s.color.text };
    return acc;
  }, {});

  return (
    <Card style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary-600)' }}>Epic</span>
          </div>
          <InlineEdit
            value={epic.name ?? undefined}
            onSave={(val) => handleFieldSave('name', val)}
            type="text"
            textStyle={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'block' }}
          />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong>Status:</strong>
              <StatusDropdown
                value={epic.status}
                options={statusOptions}
                onChange={(val) => handleFieldSave('status', val)}
                colorMap={statusColorMap}
              />
            </div>
            <span>Created {new Date(epic.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={async () => {
              if (window.confirm(`Are you sure you want to delete Epic "${epic.name}"?`)) {
                try {
                  await dispatch(deleteEpic(epic.id)).unwrap();
                  dispatch(enqueueToast({ message: 'Epic deleted', severity: 'success' }));
                  navigate(RoutePaths.EPICS);
                } catch {
                  dispatch(enqueueToast({ message: 'Failed to delete epic', severity: 'error' }));
                }
              }
            }}
          >
            <Trash2 size={14} style={{ marginRight: '0.25rem', color: 'var(--color-danger)' }} /> Delete
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-neutral-700)' }}>Description</h4>
          <InlineEdit
            value={epic.description ?? undefined}
            onSave={(val) => handleFieldSave('description', val)}
            type="textarea"
            placeholder="Add a description..."
            textStyle={{ color: 'var(--color-neutral-800)', minHeight: '100px', lineHeight: 1.6 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '2rem', borderLeft: '1px solid var(--color-neutral-200)' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-neutral-700)' }}>Owner</h4>
            <InlineEdit
              value={epic.ownerId ?? undefined}
              onSave={(val) => handleFieldSave('ownerId', val)}
              type="select"
              options={userOptions}
              placeholder="Unassigned"
              textStyle={{ fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-neutral-700)' }}>Target Release</h4>
            <InlineEdit
              value={epic.targetRelease ?? undefined}
              onSave={(val) => handleFieldSave('targetRelease', val)}
              type="date"
              placeholder="None set"
              textStyle={{ fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-neutral-700)' }}>Progress Roll-up</h4>
            <ProgressBar percent={epic.completionPercentage} label={`${epic.completionPercentage}%`} />
          </div>
        </div>
      </div>
    </Card>
  );
};
