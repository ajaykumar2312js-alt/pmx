import React, { useState } from 'react';
import { Modal, Input, Button, Alert } from '../common';
import { useAppDispatch } from '../../redux/hooks';
import { splitStory } from '../../redux/slices/storySlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { Plus, Trash2 } from 'lucide-react';

interface ChildDraft {
  id: string;
  title: string;
}

interface SplitStoryModalProps {
  storyId: string;
  storyTitle: string;
  onClose: () => void;
}

export const SplitStoryModal: React.FC<SplitStoryModalProps> = ({ storyId, storyTitle, onClose }) => {
  const dispatch = useAppDispatch();
  const [children, setChildren] = useState<ChildDraft[]>([
    { id: crypto.randomUUID(), title: '' },
    { id: crypto.randomUUID(), title: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addChild = () => setChildren(prev => [...prev, { id: crypto.randomUUID(), title: '' }]);
  const removeChild = (id: string) => setChildren(prev => prev.filter(c => c.id !== id));

  const updateChild = (id: string, field: keyof ChildDraft, value: string) =>
    setChildren(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  const handleSubmit = async () => {
    const filled = children.filter(c => c.title.trim());
    if (filled.length < 2) { setError('At least 2 child stories are required.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      await dispatch(splitStory({
        id: storyId,
        payload: {
          children: filled.map(c => ({
            title: c.title,
          }))
        }
      })).unwrap();
      dispatch(enqueueToast({ message: `Story split into ${filled.length} child stories`, severity: 'success' }));
      onClose();
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Failed to split story.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Split: "${storyTitle}"`} isOpen onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <Alert severity="error" message={error} />}

        <Alert severity="info" message="The original story will be updated to reference these child stories. Each child inherits the parent's Epic." />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {children.map((child, i) => (
            <div key={child.id} style={{ display: 'grid', gridTemplateColumns: '1fr 36px', gap: '0.5rem', alignItems: 'flex-end' }}>
              <Input
                label={i === 0 ? 'Child Story Title' : ''}
                value={child.title}
                onChange={e => updateChild(child.id, 'title', e.target.value)}
                placeholder={`Child story ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removeChild(child.id)}
                disabled={children.length <= 2}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                aria-label={`Remove child ${i + 1}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <Button variant="ghost" size="sm" type="button" onClick={addChild} style={{ alignSelf: 'flex-start' }}>
          <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add Child Story
        </Button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>Split Story</Button>
        </div>
      </div>
    </Modal>
  );
};
