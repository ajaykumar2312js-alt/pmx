import React, { useState, useEffect } from 'react';
import { FormField, Select } from '../common/ui';
import { epicService } from '../../services/epicService';
import { storyService } from '../../services/storyService';
import { taskService } from '../../services/taskService';

type ParentType = 'EPIC' | 'STORY' | 'TASK' | '';

interface ParentItemSelectorProps {
  projectId: string;
  value?: { id: string; type: ParentType };
  onChange: (value: { id: string; type: ParentType } | undefined) => void;
  error?: string;
}

export const ParentItemSelector: React.FC<ParentItemSelectorProps> = ({ projectId, value, onChange, error }) => {
  const [type, setType] = useState<ParentType>(value?.type || '');
  const [items, setItems] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchItems = async () => {
      if (!type || !projectId) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        let resItems: { id: string; title?: string; name?: string }[] = [];
        if (type === 'EPIC') {
          const res = await epicService.list(projectId, { limit: 100, page: 1 });
          resItems = res.items;
        } else if (type === 'STORY') {
          const res = await storyService.list(projectId, { limit: 100, page: 1 });
          resItems = res.items;
        } else if (type === 'TASK') {
          const res = await taskService.list(projectId, { limit: 100, page: 1 });
          resItems = res.items;
        }
        
        if (isMounted) {
          setItems(resItems.map(item => ({ 
            id: item.id, 
            title: item.title || item.name || 'Untitled'
          })));
        }
      } catch (err) {
        console.error('Failed to load parent items', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItems();
    return () => { isMounted = false; };
  }, [type, projectId]);

  const handleTypeChange = (newType: ParentType) => {
    setType(newType);
    if (!newType) {
      onChange(undefined);
    } else {
      onChange({ id: '', type: newType });
    }
  };

  const handleItemChange = (id: string) => {
    if (type) {
      onChange({ id, type });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <FormField label="Parent Type" error={error && !type ? error : undefined}>
          <Select 
            value={type} 
            onChange={(e) => handleTypeChange(e.target.value as ParentType)}
            options={[
              { value: '', label: 'None (Optional)' },
              { value: 'EPIC', label: 'Epic' },
              { value: 'STORY', label: 'Story' },
              { value: 'TASK', label: 'Task' }
            ]}
          />
        </FormField>
      </div>
      
      {type && (
        <div style={{ flex: 2 }}>
          <FormField label={`Select ${type.charAt(0) + type.slice(1).toLowerCase()}`} error={error && type && !value?.id ? error : undefined}>
            <Select 
              value={value?.id || ''} 
              onChange={(e) => handleItemChange(e.target.value)}
              options={[
                { value: '', label: loading ? 'Loading...' : `Select a ${type.toLowerCase()}...` },
                ...items.map(item => ({ value: item.id, label: item.title }))
              ]}
              disabled={loading}
            />
          </FormField>
        </div>
      )}
    </div>
  );
};
