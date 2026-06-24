import React, { useState, useEffect, FormEvent } from 'react';
import { Modal, Input, TextArea, DatePicker, Select, Button, Alert } from '../common/ui';
import { useAppDispatch } from '../../redux/hooks';
import { createProject, updateProject } from '../../redux/slices/projectSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { userService } from '../../services/userService';
import { UserProfile } from '../../redux/slices/authSlice';
import { Project, ProjectPayload } from '../../services/projectService';

interface ProjectFormProps {
  onClose: () => void;
  project?: Project; // If provided, we are in edit mode
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, project }) => {
  const dispatch = useAppDispatch();
  const isEdit = !!project;

  const [name, setName] = useState(project?.name || '');
  const [key, setKey] = useState(project?.key || '');
  const [description, setDescription] = useState(project?.description || '');
  const [startDate, setStartDate] = useState(project?.startDate || '');
  const [endDate, setEndDate] = useState(project?.endDate || '');
  const [poId, setPoId] = useState(project?.poId || '');
  const [teamIds, setTeamIds] = useState<string[]>(project?.teamIds || []);
  const [status, setStatus] = useState<Project['status']>(project?.status || 'Active');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await userService.list({ limit: 100 });
        if (active) {
          setUsers(res.items);
        }
      } catch {
        // failed to fetch users, ignoring for now
      } finally {
        if (active) setLoadingUsers(false);
      }
    };
    fetchUsers();
    return () => { active = false; };
  }, []);

  const userOptions = users.map(u => ({
    label: `${u.firstName} ${u.lastName} (${u.email})`,
    value: u.id,
  }));

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Project name is required';
    if (name.length > 100) errors.name = 'Project name cannot exceed 100 characters';
    if (!key.trim()) errors.key = 'Project key is required';
    if (!/^[A-Z0-9]+$/.test(key)) errors.key = 'Project key must be uppercase alphanumeric';
    if (!poId) errors.poId = 'Product Owner is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!validate()) return;

    setSubmitting(true);
    const payload: ProjectPayload = {
      name,
      key,
      description: description || undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      status,
      poId,
      teamIds,
    };

    try {
      if (isEdit) {
        await dispatch(updateProject({ id: project.id, payload })).unwrap();
        dispatch(enqueueToast({ message: 'Project updated successfully', severity: 'success' }));
      } else {
        await dispatch(createProject(payload)).unwrap();
        dispatch(enqueueToast({ message: 'Project created successfully', severity: 'success' }));
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { statusCode?: number, code?: string, errors?: Array<{field: string, message: string}>, message?: string };
      if (error.statusCode === 409 || error.code === 'DUPLICATE_KEY') {
        setFieldErrors(prev => ({ ...prev, key: 'Project Key already in use' }));
      } else if (error.statusCode === 422 && error.errors) {
        const errors: Record<string, string> = {};
        error.errors.forEach((e: {field: string, message: string}) => { errors[e.field] = e.message; });
        setFieldErrors(prev => ({ ...prev, ...errors }));
      } else {
        setErrorMsg(error.message || 'An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Project' : 'Create Project'}
      isOpen={true}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && <Alert severity="error" message={errorMsg} />}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 2 }}>
            <Input
              label="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              error={fieldErrors.name}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              label="Project Key"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              required
              error={fieldErrors.key}
              helpText="e.g. PMX"
            />
          </div>
        </div>

        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          error={fieldErrors.description}
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={fieldErrors.startDate}
            />
          </div>
          <div style={{ flex: 1 }}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={fieldErrors.endDate}
            />
          </div>
        </div>

        <Select
          label="Product Owner"
          value={poId}
          onChange={(e) => setPoId(e.target.value)}
          options={userOptions}
          required
          error={fieldErrors.poId}
          disabled={loadingUsers}
        />

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-neutral-700)' }}>Team Members</label>
          <Select
            value=""
            onChange={(e) => {
              const id = e.target.value;
              if (id && !teamIds.includes(id)) {
                setTeamIds([...teamIds, id]);
              }
            }}
            options={[{ label: 'Select a member to add...', value: '' }, ...userOptions.filter(u => !teamIds.includes(u.value as string))]}
            disabled={loadingUsers}
          />
          {teamIds.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
              {teamIds.map(id => {
                const user = users.find(u => u.id === id);
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-primary-100)', color: 'var(--color-primary-800)', padding: '0.25rem 0.75rem', borderRadius: 'var(--border-radius-full)', fontSize: '0.875rem' }}>
                    {user ? `${user.firstName} ${user.lastName}` : id}
                    <button 
                      type="button" 
                      onClick={() => setTeamIds(teamIds.filter(tId => tId !== id))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: 'var(--color-primary-600)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {fieldErrors.teamIds && <div style={{ color: 'var(--color-danger-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{fieldErrors.teamIds}</div>}
        </div>

        {isEdit && (
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Project['status'])}
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Archived', value: 'Archived' },
              { label: 'Completed', value: 'Completed' },
            ]}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
