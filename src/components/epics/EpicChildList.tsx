import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { selectCurrentEpicChildren, selectCurrentEpic, refreshEpicChildren } from '../../redux/slices/epicSlice';
import { createStory } from '../../redux/slices/storySlice';
import { createTask } from '../../redux/slices/taskSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { Table, Badge, Alert, ItemStatusDropdown, Modal, Button } from '../common';
import { ChildItem } from '../../services/epicService';
import { WorkItemType } from '../../common/enums';
import { StoryForm } from '../stories/StoryForm';
import { TaskForm } from '../tasks/TaskForm';
import { StoryPayload } from '../../services/storyService';
import { TaskPayload } from '../../services/taskService';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '../../routes/routePaths';
import { Plus } from 'lucide-react';

type ModalType = 'story' | 'task' | null;

export const EpicChildList: React.FC = () => {
  const dispatch = useAppDispatch();
  const children = useAppSelector(selectCurrentEpicChildren);
  const currentEpic = useAppSelector(selectCurrentEpic);
  const navigate = useNavigate();

  const [modalType, setModalType] = useState<ModalType>(null);

  const handleCreateStory = async (payload: StoryPayload) => {
    if (!currentEpic) return;
    await dispatch(createStory({
      projectId: currentEpic.projectId,
      payload: { ...payload, epicId: currentEpic.id },
    })).unwrap();
    dispatch(enqueueToast({ message: 'Story created successfully', severity: 'success' }));
    dispatch(refreshEpicChildren(currentEpic.id));
    setModalType(null);
  };

  const handleCreateTask = async (payload: TaskPayload) => {
    if (!currentEpic) return;
    await dispatch(createTask({
      projectId: currentEpic.projectId,
      payload: { ...payload, epicId: currentEpic.id },
    })).unwrap();
    dispatch(enqueueToast({ message: 'Task created successfully', severity: 'success' }));
    dispatch(refreshEpicChildren(currentEpic.id));
    setModalType(null);
  };

  const getDetailPath = (item: ChildItem) => {
    switch (item.type) {
      case WorkItemType.STORY: return RoutePaths.STORY_DETAIL(item.id);
      case WorkItemType.TASK:  return RoutePaths.TASK_DETAIL(item.id);
      case WorkItemType.BUG:   return RoutePaths.BUG_DETAIL(item.id);
      default: return '/backlog';
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (item: ChildItem) => (
        <span
          style={{ fontWeight: 500, color: 'var(--color-primary-600)', cursor: 'pointer' }}
          onClick={() => navigate(getDetailPath(item))}
        >
          {item.title}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: ChildItem) => (
        <span style={{
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: 'var(--color-neutral-200)',
          color: 'var(--color-neutral-800)',
        }}>
          {item.type}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '140px',
      render: (item: ChildItem) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ItemStatusDropdown
            itemId={item.id}
            itemType={item.type}
            status={item.status}
            size="sm"
          />
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '100px',
      render: (item: ChildItem) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Badge level={item.priority} />
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (item: ChildItem) =>
        item.owner ? `${item.owner.firstName} ${item.owner.lastName}` : 'Unassigned',
    },
  ];

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Child Items ({children.length})</h3>
        {currentEpic && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={() => setModalType('story')}>
              <Plus size={14} style={{ marginRight: '0.25rem' }} /> Story
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setModalType('task')}>
              <Plus size={14} style={{ marginRight: '0.25rem' }} /> Task
            </Button>
          </div>
        )}
      </div>

      {children.length === 0 ? (
        <Alert severity="info" message="No child items yet. Use the buttons above to create Stories or Tasks within this Epic." />
      ) : (
        <Table columns={columns} data={children} keyExtractor={c => c.id} />
      )}

      {modalType === 'story' && currentEpic && (
        <Modal isOpen title="Create Story" onClose={() => setModalType(null)}>
          <StoryForm
            projectId={currentEpic.projectId}
            initialData={{ epicId: currentEpic.id }}
            onSubmit={handleCreateStory}
            onCancel={() => setModalType(null)}
          />
        </Modal>
      )}

      {modalType === 'task' && currentEpic && (
        <Modal isOpen title="Create Task" onClose={() => setModalType(null)}>
          <TaskForm
            projectId={currentEpic.projectId}
            initialData={{ epicId: currentEpic.id }}
            onSubmit={handleCreateTask}
            onCancel={() => setModalType(null)}
          />
        </Modal>
      )}
    </div>
  );
};
