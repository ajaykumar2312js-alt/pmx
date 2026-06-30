import React, { useState } from 'react';
import { FormField, Input, Select, Button, TextArea } from '../common/ui';
import { ParentItemSelector } from './ParentItemSelector';
import { BugPayload } from '../../services/bugService';
import { Severity, Priority } from '../../common/enums';
import { DEFAULT_STATUS } from '../../common/kanbanStatuses';

interface BugFormProps {
  projectId: string;
  initialData?: Partial<BugPayload> & { id?: string };
  onSubmit: (payload: BugPayload) => Promise<void>;
  onCancel: () => void;
}

export const BugForm: React.FC<BugFormProps> = ({ projectId, initialData, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [stepsToReproduce, setStepsToReproduce] = useState(initialData?.stepsToReproduce || '');
  const [expectedResult, setExpectedResult] = useState(initialData?.expectedResult || '');
  const [actualResult, setActualResult] = useState(initialData?.actualResult || '');
  const [severity, setSeverity] = useState<Severity>(initialData?.severity || Severity.MEDIUM);
  const [priority, setPriority] = useState<Priority>(initialData?.priority || Priority.MEDIUM);
  const [environment, setEnvironment] = useState(initialData?.environment || '');
  const [browserOs, setBrowserOs] = useState(initialData?.browserOs || '');
  
  const [parent, setParent] = useState<{ id: string; type: 'EPIC' | 'STORY' | 'TASK' | '' } | undefined>(
    initialData?.parentId ? { id: initialData.parentId, type: initialData.parentType as 'EPIC' | 'STORY' | 'TASK' | '' } : undefined
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!stepsToReproduce.trim()) newErrors.stepsToReproduce = 'Steps to Reproduce is required for Bug reports';
    
    if (parent && parent.type && !parent.id) {
      newErrors.parent = 'Please select a specific parent item or set type to None';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        stepsToReproduce,
        expectedResult,
        actualResult,
        severity,
        priority,
        environment,
        browserOs,
        parentId: parent?.id || undefined,
        parentType: parent?.type || undefined,
        status: initialData?.status || DEFAULT_STATUS,
      });
    } catch (err: unknown) {
      const e = err as Error;
      setErrors({ form: e.message || 'Submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {errors.form && <div style={{ color: 'var(--color-danger-600)', fontSize: '0.875rem', padding: '0.5rem', background: 'var(--color-danger-50)', borderRadius: 4 }}>{errors.form}</div>}
      
      <FormField label="Title" required error={errors.title}>
        <Input 
          value={title} 
          onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({...prev, title: ''})); }} 
          placeholder="Concise bug summary" 
        />
      </FormField>

      <ParentItemSelector 
        projectId={projectId} 
        value={parent} 
        onChange={(v) => { setParent(v); setErrors(prev => ({...prev, parent: ''})); }} 
        error={errors.parent}
      />

      <FormField label="Steps to Reproduce" required error={errors.stepsToReproduce}>
        <TextArea 
          value={stepsToReproduce} 
          onChange={(e) => { setStepsToReproduce(e.target.value); setErrors(prev => ({...prev, stepsToReproduce: ''})); }} 
          placeholder="1. Go to...\n2. Click on...\n3. Observe..." 
          rows={4}
        />
      </FormField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormField label="Expected Result">
          <TextArea 
            value={expectedResult} 
            onChange={(e) => setExpectedResult(e.target.value)} 
            rows={3}
          />
        </FormField>
        
        <FormField label="Actual Result">
          <TextArea 
            value={actualResult} 
            onChange={(e) => setActualResult(e.target.value)} 
            rows={3}
          />
        </FormField>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormField label="Severity">
          <Select 
            value={severity} 
            onChange={(e) => setSeverity(e.target.value as Severity)}
            options={Object.values(Severity).map(s => ({ value: s, label: s }))}
          />
        </FormField>
        
        <FormField label="Priority">
          <Select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={Object.values(Priority).map(p => ({ value: p, label: p }))}
          />
        </FormField>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormField label="Environment">
          <Input 
            value={environment} 
            onChange={(e) => setEnvironment(e.target.value)} 
            placeholder="e.g. Staging, Production" 
          />
        </FormField>
        
        <FormField label="Browser / OS">
          <Input 
            value={browserOs} 
            onChange={(e) => setBrowserOs(e.target.value)} 
            placeholder="e.g. Chrome 114 / macOS" 
          />
        </FormField>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>Save Bug</Button>
      </div>
    </form>
  );
};
