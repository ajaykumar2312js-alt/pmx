import React, { useState } from 'react';
import { useAppDispatch } from '../../../redux/hooks';
import { WorkflowStatusDropdown } from './WorkflowStatusDropdown';
import { StatusDropdown } from './StatusDropdown';
import { changeStoryStatus } from '../../../redux/slices/storySlice';
import { updateTaskStatus } from '../../../redux/slices/taskSlice';
import { updateBug } from '../../../redux/slices/bugSlice';
import { updateEpic } from '../../../redux/slices/epicSlice';
import { setSubtaskStatus } from '../../../redux/slices/subtaskSlice';
import { enqueueToast } from '../../../redux/slices/uiSlice';
import { SubtaskParentType } from '../../../services/subtaskService';
import { KANBAN_STATUSES } from '../../../common/kanbanStatuses';

export type WorkItemType = 'EPIC' | 'STORY' | 'TASK' | 'BUG' | 'SUBTASK';

interface ItemStatusDropdownProps {
  itemId: string;
  itemType: WorkItemType | string;
  status: string;
  onStatusChange?: (newStatus: string) => void;
  size?: 'sm' | 'md';
  // Required if itemType === 'SUBTASK'
  parentType?: SubtaskParentType;
  parentId?: string;
}

export const ItemStatusDropdown: React.FC<ItemStatusDropdownProps> = ({ itemId, itemType, status, onStatusChange, size, parentType, parentId }) => {
  const dispatch = useAppDispatch();
  const [localStatus, setLocalStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  const handleChange = async (newVal: string) => {
    if (newVal === localStatus) return;
    
    setLocalStatus(newVal);
    setLoading(true);
    try {
      const type = itemType.toUpperCase();
      if (type === 'EPIC') await dispatch(updateEpic({ id: itemId, payload: { status: newVal as any } })).unwrap();
      else if (type === 'STORY') await dispatch(changeStoryStatus({ id: itemId, status: newVal })).unwrap();
      else if (type === 'TASK') await dispatch(updateTaskStatus({ id: itemId, status: newVal })).unwrap();
      else if (type === 'BUG') await dispatch(updateBug({ id: itemId, payload: { status: newVal } })).unwrap();
      else if (type === 'SUBTASK') {
        if (!parentType || !parentId) throw new Error('Missing parent info for subtask');
        await dispatch(setSubtaskStatus({ id: itemId, status: newVal, parentType, parentId })).unwrap();
      }
      else {
        throw new Error(`Unsupported item type for status update: ${type}`);
      }
      
      dispatch(enqueueToast({ message: 'Status updated', severity: 'success' }));
      if (onStatusChange) onStatusChange(newVal);
    } catch (err) {
      setLocalStatus(status); // revert
      dispatch(enqueueToast({ message: 'Failed to update status', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const isEpic = String(itemType).toUpperCase() === 'EPIC';

  if (isEpic) {
    const epicOptions = KANBAN_STATUSES.map(s => ({ label: s.label, value: s.id }));
    const epicColorMap = KANBAN_STATUSES.reduce<Record<string, { bg: string; color: string }>>((acc, s) => {
      acc[s.id] = { bg: s.color.bg, color: s.color.text };
      return acc;
    }, {});
    return (
      <StatusDropdown
        value={localStatus}
        onChange={handleChange}
        disabled={loading}
        size={size}
        options={epicOptions}
        colorMap={epicColorMap}
      />
    );
  }

  return (
    <WorkflowStatusDropdown
      value={localStatus}
      onChange={handleChange}
      disabled={loading}
      size={size}
    />
  );
};
