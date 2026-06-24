import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Alert } from '../common/ui';
import { useAppDispatch } from '../../redux/hooks';
import { updateProject } from '../../redux/slices/projectSlice';
import { enqueueToast } from '../../redux/slices/uiSlice';
import { userService } from '../../services/userService';
import { UserProfile } from '../../redux/slices/authSlice';
import { Project } from '../../services/projectService';

interface ManageTeamModalProps {
  project: Project;
  onClose: () => void;
}

export const ManageTeamModal: React.FC<ManageTeamModalProps> = ({ project, onClose }) => {
  const dispatch = useAppDispatch();
  const [teamIds, setTeamIds] = useState<string[]>(project.teamIds || []);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await userService.list({ limit: 100 });
        if (active) setUsers(res.items);
      } catch {
        if (active) setErrorMsg('Failed to load users');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await dispatch(updateProject({ id: project.id, payload: { teamIds } })).unwrap();
      dispatch(enqueueToast({ message: 'Team members updated successfully', severity: 'success' }));
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to update team members');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Manage Team Members" isOpen={true} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && <Alert severity="error" message={errorMsg} />}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-neutral-700)' }}>Select Members</label>
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
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="primary" loading={submitting}>Save</Button>
        </div>
      </form>
    </Modal>
  );
};
