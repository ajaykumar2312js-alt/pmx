import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchStoryDetail, selectCurrentStory, selectStoryDetailStatus, updateStory } from '../../redux/slices/storySlice';
import { Card, Spinner, Alert, Button } from '../common';
import { AcceptanceCriteriaEditor } from './AcceptanceCriteriaEditor/AcceptanceCriteriaEditor';
import { fetchUsers, selectUsers } from '../../redux/slices/userSlice';
import { InlineEdit, WorkflowStatusDropdown } from '../common/ui';
import { SplitStoryModal } from './SplitStoryModal';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { ACEntry, StoryPayload } from '../../services/storyService';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../../routes/routePaths';
import { Scissors } from 'lucide-react';
import { SubtaskList } from '../subtasks/SubtaskList';


interface StoryDetailProps {
  storyId: string;
}

export const StoryDetail: React.FC<StoryDetailProps> = ({ storyId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const story = useAppSelector(selectCurrentStory);
  const status = useAppSelector(selectStoryDetailStatus);
  const users = useAppSelector(selectUsers);
  const [isEditingAC, setIsEditingAC] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [tempAC, setTempAC] = useState<ACEntry[]>([]);

  useEffect(() => {
    dispatch(fetchStoryDetail(storyId));
    dispatch(fetchUsers({ limit: 100 }));
  }, [dispatch, storyId]);

  useEffect(() => {
    if (story?.acceptanceCriteria) {
      setTempAC(story.acceptanceCriteria);
    }
  }, [story?.acceptanceCriteria]);

  if (status === 'loading') return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>;
  if (status === 'failed' || !story) return <Alert severity="error" message="Failed to load story details." />;

  const handleFieldSave = async (field: keyof StoryPayload, value: StoryPayload[keyof StoryPayload]) => {
    if (!story) return;
    const payload = { [field]: value };
    await dispatch(updateStory({ id: story.id, payload })).unwrap();
    dispatch(enqueueToast({ message: `Story updated`, severity: 'success' }));
  };

  const handleSaveAC = async () => {
    await handleFieldSave('acceptanceCriteria', tempAC);
    setIsEditingAC(false);
  };

  const userOptions = users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
  const priorityOptions = [
    { label: 'Highest', value: 'Highest' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
    { label: 'Lowest', value: 'Lowest' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary-600)' }}>Story</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--color-neutral-400)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                {story.epicId
                  ? <span style={{ cursor: 'pointer', color: 'var(--color-primary-500)' }} onClick={() => navigate(RoutePaths.EPIC_DETAIL(story.epicId!))}>View Epic →</span>
                  : 'No Epic linked'}
              </span>
            </div>
            <InlineEdit
              value={story.title}
              onSave={(val) => handleFieldSave('title', val)}
              type="text"
              textStyle={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'block' }}
            />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Status:</strong>
                <WorkflowStatusDropdown
                  value={story.status}
                  onChange={(val) => handleFieldSave('status', val as string)}
                />
              </div>
              <span>Created {new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsSplitting(true)}>
              <Scissors size={14} style={{ marginRight: '0.25rem' }} /> Split
            </Button>
          </div>
        </div>

        {/* Description */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '2rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.75rem' }}>User Story</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--color-neutral-800)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <strong style={{ color: 'var(--color-neutral-500)', marginTop: '0.25rem', width: '60px' }}>As a</strong>
                <InlineEdit value={story.asA} onSave={(val) => handleFieldSave('asA', val)} type="textarea" placeholder="user..." containerStyle={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <strong style={{ color: 'var(--color-neutral-500)', marginTop: '0.25rem', width: '60px' }}>I want</strong>
                <InlineEdit value={story.iWant} onSave={(val) => handleFieldSave('iWant', val)} type="textarea" placeholder="to do something..." containerStyle={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <strong style={{ color: 'var(--color-neutral-500)', marginTop: '0.25rem', width: '60px' }}>So that</strong>
                <InlineEdit value={story.soThat} onSave={(val) => handleFieldSave('soThat', val)} type="textarea" placeholder="I achieve a goal..." containerStyle={{ flex: 1 }} />
              </div>
            </div>
          </div>

          {/* Sidebar meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid var(--color-neutral-200)', paddingLeft: '2rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>Priority</div>
              <InlineEdit
                value={story.priority}
                onSave={(val) => handleFieldSave('priority', val)}
                type="select"
                options={priorityOptions}
              />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>Assignee</div>
              <InlineEdit
                value={story.assigneeId}
                onSave={(val) => handleFieldSave('assigneeId', val)}
                type="select"
                options={userOptions}
                placeholder="Unassigned"
              />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>Story Points</div>
              <InlineEdit
                value={story.storyPoints}
                onSave={(val) => handleFieldSave('storyPoints', val ? Number(val) : undefined)}
                type="number"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Acceptance Criteria */}
      <Card style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Acceptance Criteria</h3>
          {isEditingAC ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" size="sm" onClick={() => { setTempAC(story.acceptanceCriteria); setIsEditingAC(false); }}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveAC}>Save AC</Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setIsEditingAC(true)}>Edit AC</Button>
          )}
        </div>
        <AcceptanceCriteriaEditor entries={isEditingAC ? tempAC : story.acceptanceCriteria} readOnly={!isEditingAC} onChange={setTempAC} />
      </Card>

      {/* Sub-tasks */}
      <Card style={{ padding: '1.5rem' }}>
        <SubtaskList parentType="stories" parentId={story.id} />
      </Card>

      {/* Child stories (from split) */}
      {story.childStories && story.childStories.length > 0 && (
        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem' }}>Child Stories ({story.childStories.length})</h3>
          {story.childStories.map(child => (
            <div key={child.id} style={{ padding: '0.625rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9375rem' }}>{child.title}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Split modal */}
      {isSplitting && (
        <SplitStoryModal
          storyId={story.id}
          storyTitle={story.title}
          onClose={() => setIsSplitting(false)}
        />
      )}
    </div>
  );
};
