import React, { useEffect, useState } from 'react';
import { Card, Button, Avatar, Spinner, Alert } from '../common/ui';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchProjectById, selectCurrentProject } from '../../redux/slices/projectSlice';
import { hasRole } from '../../redux/slices/authSlice';
import { setActiveProject } from '../../redux/slices/uiSlice';
import { Role } from '../../common/enums';
import { ProjectForm } from './ProjectForm';
import { ArchiveProjectModal } from './ArchiveProjectModal';
import { DeleteProjectModal } from './DeleteProjectModal';
import { ManageTeamModal } from './ManageTeamModal';
import { useNavigate } from 'react-router-dom';

interface ProjectOverviewProps {
  projectId: string;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const project = useAppSelector(selectCurrentProject);
  const status = useAppSelector(state => state.projects.currentProjectStatus);
  const authState = useAppSelector(state => state.auth);
  
  const isPOOrAdmin = hasRole({ auth: authState }, Role.PO) || hasRole({ auth: authState }, Role.ADMIN);
  const isAdmin = hasRole({ auth: authState }, Role.ADMIN);

  const [showEdit, setShowEdit] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showManageTeam, setShowManageTeam] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectById(projectId));
    dispatch(setActiveProject(projectId));
  }, [dispatch, projectId]);

  if (status === 'loading') return <div style={{ padding: '2rem', textAlign: 'center' }}><Spinner /></div>;
  if (!project) return <Alert severity="error" message="Project not found" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Card>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {project.name}
                <span style={{ fontSize: '0.875rem', background: 'var(--color-primary-100)', color: 'var(--color-primary-700)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                  {project.key}
                </span>
                <span style={{ fontSize: '0.875rem', background: project.status === 'Active' ? 'var(--color-success-100)' : 'var(--color-neutral-100)', color: project.status === 'Active' ? 'var(--color-success-700)' : 'var(--color-neutral-700)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                  {project.status}
                </span>
              </h1>
              {project.description && (
                <p style={{ color: 'var(--color-neutral-600)', margin: 0, maxWidth: '800px', lineHeight: 1.5 }}>
                  {project.description}
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isPOOrAdmin && (
                <>
                  <Button variant="secondary" onClick={() => setShowEdit(true)}>Edit</Button>
                  {project.status !== 'Archived' && (
                    <Button variant="secondary" onClick={() => setShowArchive(true)}>Archive</Button>
                  )}
                </>
              )}
              {isAdmin && (
                <Button variant="primary" onClick={() => setShowDelete(true)}>Delete</Button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>Product Owner</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Avatar name={project.po ? `${project.po.firstName} ${project.po.lastName}` : 'Unassigned'} size={32} />
                <span style={{ fontWeight: 500 }}>{project.po ? `${project.po.firstName} ${project.po.lastName}` : 'Unassigned'}</span>
              </div>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>Timeline</h4>
              <div style={{ fontWeight: 500, color: 'var(--color-neutral-800)' }}>
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} &rarr; {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>Team Members ({project.teamIds?.length || 0})</h4>
              {isPOOrAdmin && (
                <Button variant="secondary" onClick={() => setShowManageTeam(true)}>Manage Team</Button>
              )}
            </div>
            {project.team && project.team.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                {project.team.map(member => (
                  <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-neutral-100)', padding: '0.25rem 0.5rem', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--color-neutral-200)' }}>
                    <Avatar name={`${member.firstName} ${member.lastName}`} size={24} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, paddingRight: '0.25rem' }}>{member.firstName} {member.lastName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-neutral-500)', margin: 0, fontSize: '0.875rem', fontStyle: 'italic', marginTop: '1rem' }}>No team members assigned</p>
            )}
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/backlog')}>
          <Card className="hover-shadow">
            <div style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary-800)' }}>Product Backlog</h3>
              <p style={{ margin: 0, color: 'var(--color-neutral-600)', fontSize: '0.875rem', lineHeight: 1.4 }}>Manage and prioritize features, bugs, and tasks.</p>
            </div>
          </Card>
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/sprints')}>
          <Card className="hover-shadow">
            <div style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary-800)' }}>Sprints</h3>
              <p style={{ margin: 0, color: 'var(--color-neutral-600)', fontSize: '0.875rem', lineHeight: 1.4 }}>Plan and execute timeboxed iterations.</p>
            </div>
          </Card>
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/kanban')}>
          <Card className="hover-shadow">
            <div style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary-800)' }}>Kanban Board</h3>
              <p style={{ margin: 0, color: 'var(--color-neutral-600)', fontSize: '0.875rem', lineHeight: 1.4 }}>Visualize workflow and manage current work.</p>
            </div>
          </Card>
        </div>
      </div>

      {showEdit && <ProjectForm project={project} onClose={() => setShowEdit(false)} />}
      {showArchive && <ArchiveProjectModal projectId={project.id} projectName={project.name} onClose={() => setShowArchive(false)} />}
      {showDelete && <DeleteProjectModal projectId={project.id} projectName={project.name} onClose={() => setShowDelete(false)} onDeleted={() => navigate('/projects')} />}
      {showManageTeam && <ManageTeamModal project={project} onClose={() => setShowManageTeam(false)} />}
    </div>
  );
};
