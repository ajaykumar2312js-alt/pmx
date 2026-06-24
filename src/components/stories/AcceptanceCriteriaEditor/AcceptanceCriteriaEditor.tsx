import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../common';
import styles from './AcceptanceCriteriaEditor.module.css';
import type { ACEntry } from '../../../services/storyService';

export type { ACEntry };

interface AcceptanceCriteriaEditorProps {
  entries: ACEntry[];
  onChange?: (entries: ACEntry[]) => void;
  readOnly?: boolean;
}

const emptyEntry = (): ACEntry => ({
  id: crypto.randomUUID(),
  given: '',
  when: '',
  then: '',
});

export const AcceptanceCriteriaEditor: React.FC<AcceptanceCriteriaEditorProps> = ({
  entries,
  onChange,
  readOnly = false,
}) => {
  const handleFieldChange = (id: string, field: keyof Omit<ACEntry, 'id'>, value: string) => {
    if (!onChange) return;
    onChange(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAdd = () => {
    if (!onChange) return;
    onChange([...entries, emptyEntry()]);
  };

  const handleRemove = (id: string) => {
    if (!onChange) return;
    onChange(entries.filter(e => e.id !== id));
  };

  if (readOnly) {
    if (entries.length === 0) return <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>No acceptance criteria defined.</p>;
    return (
      <div className={styles.readOnlyList}>
        {entries.map((entry, i) => (
          <div key={entry.id} className={styles.readOnlyCard}>
            <span className={styles.entryIndex}>AC {i + 1}</span>
            <div className={styles.gwt}>
              <div><span className={styles.gwtLabel}>Given</span> {entry.given}</div>
              <div><span className={styles.gwtLabel}>When</span> {entry.when}</div>
              <div><span className={styles.gwtLabel}>Then</span> {entry.then}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Acceptance Criteria (Given / When / Then)</span>
        <Button variant="ghost" size="sm" type="button" onClick={handleAdd}>
          <Plus size={14} style={{ marginRight: '0.25rem' }} />
          Add Criterion
        </Button>
      </div>

      {entries.length === 0 && (
        <p className={styles.empty}>No criteria yet. Click "Add Criterion" to begin.</p>
      )}

      <div className={styles.entries}>
        {entries.map((entry, i) => (
          <div key={entry.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.entryIndex}>AC {i + 1}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemove(entry.id)}
                aria-label={`Remove AC ${i + 1}`}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {(['given', 'when', 'then'] as const).map(field => (
              <div key={field} className={styles.row}>
                <label className={styles.gwtLabel} htmlFor={`${entry.id}-${field}`}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <textarea
                  id={`${entry.id}-${field}`}
                  className={styles.textarea}
                  value={entry[field]}
                  onChange={e => handleFieldChange(entry.id, field, e.target.value)}
                  placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)}...`}
                  rows={2}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
