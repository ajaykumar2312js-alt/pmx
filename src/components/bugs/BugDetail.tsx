import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchBugDetail, selectCurrentBug, selectBugDetailStatus, updateBug, deleteBug } from '../../redux/slices/bugSlice';
import { Spinner, Alert, CommentThread, Button } from '../common';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { SubtaskList } from '../subtasks/SubtaskList';
import { InlineEdit, WorkflowStatusDropdown } from '../common/ui';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { Severity } from '../../common/enums';
import { BugPayload } from '../../services/bugService';
import { Trash2 } from 'lucide-react';

interface BugDetailProps {
  bugId: string;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  LOW: 'var(--color-neutral-500)',
  MEDIUM: 'var(--color-warning-500)',
  HIGH: 'var(--color-danger-500)',
  CRITICAL: 'var(--color-danger-700)',
};

export const BugDetail: React.FC<BugDetailProps> = ({ bugId }) => {
  const dispatch = useAppDispatch();
  const bug = useAppSelector(selectCurrentBug);
  const status = useAppSelector(selectBugDetailStatus);
  const users = useAppSelector(selectUsers);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchBugDetail(bugId));
    dispatch(fetchUsers({ limit: 100 }));
  }, [dispatch, bugId]);



  const handleFieldSave = async (field: keyof BugPayload, value: BugPayload[keyof BugPayload]) => {
    if (!bug) return;
    const payload = { [field]: value };
    await dispatch(updateBug({ id: bug.id, payload })).unwrap();
    dispatch(enqueueToast({ message: `Bug updated`, severity: 'success' }));
  };

  const userOptions = users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
  const severityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Critical', value: 'CRITICAL' },
  ];
  const priorityOptions = [
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'High',     value: 'HIGH'     },
    { label: 'Medium',   value: 'MEDIUM'   },
    { label: 'Low',      value: 'LOW'      },
  ];

  return (
    <div style={{
      width: '100%',
      background: 'white',
      display: 'flex', flexDirection: 'column', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Bug Detail</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {bug && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={async () => {
                if (window.confirm(`Are you sure you want to delete Bug "${bug.title}"?`)) {
                  try {
                    await dispatch(deleteBug(bug.id)).unwrap();
                    dispatch(enqueueToast({ message: 'Bug deleted', severity: 'success' }));
                    navigate(-1);
                  } catch {
                    dispatch(enqueueToast({ message: 'Failed to delete bug', severity: 'error' }));
                  }
                }
              }}
            >
              <Trash2 size={14} style={{ marginRight: '0.25rem', color: 'var(--color-danger)' }} /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {status === 'loading' && <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>}
        {status === 'failed' && <Alert severity="error" message="Failed to load bug details." />}
        
        {status === 'succeeded' && bug && (
          <>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <WorkflowStatusDropdown
                  value={bug.status}
                  onChange={(val) => handleFieldSave('status', val as string)}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: SEVERITY_COLORS[bug.severity], display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Severity: 
                  <InlineEdit
                    value={bug.severity}
                    onSave={(val) => handleFieldSave('severity', val)}
                    type="select"
                    options={severityOptions}
                  />
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Priority: 
                  <InlineEdit
                    value={bug.priority}
                    onSave={(val) => handleFieldSave('priority', val)}
                    type="select"
                    options={priorityOptions}
                  />
                </span>
              </div>
              <InlineEdit
                value={bug.title}
                onSave={(val) => handleFieldSave('title', val)}
                type="text"
                textStyle={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700, display: 'block' }}
              />
              

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--color-neutral-50)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>Assignee</div>
                <InlineEdit
                  value={bug.assigneeId ?? undefined}
                  onSave={(val) => handleFieldSave('assigneeId', val)}
                  type="select"
                  options={userOptions}
                  placeholder="Unassigned"
                  textStyle={{ fontSize: '0.875rem', fontWeight: 500 }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>Reporter</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{bug.reporter ? `${bug.reporter.firstName} ${bug.reporter.lastName}` : 'System'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>Environment</div>
                <InlineEdit
                  value={bug.environment ?? undefined}
                  onSave={(val) => handleFieldSave('environment', val)}
                  type="text"
                  placeholder="-"
                  textStyle={{ fontSize: '0.875rem', fontWeight: 500 }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>Browser / OS</div>
                <InlineEdit
                  value={bug.browserOs ?? undefined}
                  onSave={(val) => handleFieldSave('browserOs', val)}
                  type="text"
                  placeholder="-"
                  textStyle={{ fontSize: '0.875rem', fontWeight: 500 }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>Parent Type</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>
                  {bug.parentType ? bug.parentType.toLowerCase() : 'None'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>Parent Name</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {bug.parent?.title || bug.parentId || '-'}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Steps to Reproduce</div>
              <InlineEdit
                value={bug.stepsToReproduce}
                onSave={(val) => handleFieldSave('stepsToReproduce', val)}
                type="textarea"
                placeholder="Steps to reproduce..."
                textStyle={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--color-neutral-800)', padding: '0.75rem', background: 'var(--color-neutral-50)', borderRadius: 4, display: 'block' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Expected Result</div>
                <InlineEdit
                  value={bug.expectedResult ?? undefined}
                  onSave={(val) => handleFieldSave('expectedResult', val)}
                  type="textarea"
                  placeholder="Expected result..."
                  textStyle={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--color-success-700)', padding: '0.75rem', background: 'var(--color-success-50)', borderRadius: 4, display: 'block' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Actual Result</div>
                <InlineEdit
                  value={bug.actualResult ?? undefined}
                  onSave={(val) => handleFieldSave('actualResult', val)}
                  type="textarea"
                  placeholder="Actual result..."
                  textStyle={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--color-danger-700)', padding: '0.75rem', background: 'var(--color-danger-50)', borderRadius: 4, display: 'block' }}
                />
              </div>
            </div>

            <SubtaskList parentType="bugs" parentId={bug.id} />
            <CommentThread parentType="bugs" parentId={bug.id} />
          </>
        )}
      </div>
    </div>
  );
};
