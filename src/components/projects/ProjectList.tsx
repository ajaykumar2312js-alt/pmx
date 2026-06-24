import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchProjects, selectProjects, selectProjectsMeta, selectProjectsStatus } from '../../redux/slices/projectSlice';
import { setActiveProject } from '../../redux/slices/uiSlice';
import { ProjectCard } from './ProjectCard';
import { Pagination, Spinner, Alert, Button } from '../common/ui';

interface ProjectListProps {
  onCreateClick?: () => void;
  canCreate?: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onCreateClick, canCreate }) => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjects);
  const meta = useAppSelector(selectProjectsMeta);
  const status = useAppSelector(selectProjectsStatus);
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);
  const error = useAppSelector(state => state.projects.error);

  const [cursor, setCursor] = useState<string | undefined>();
  const [direction, setDirection] = useState<'next' | 'prev' | undefined>();

  useEffect(() => {
    dispatch(fetchProjects({ cursor, direction, limit: 12 }));
  }, [dispatch, cursor, direction]);

  const handlePageChange = (newCursor?: string, newDir?: 'next' | 'prev') => {
    setCursor(newCursor);
    setDirection(newDir);
  };

  const handleSetActive = (id: string) => {
    dispatch(setActiveProject(id));
  };

  if (status === 'loading' && projects.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>;
  }

  if (status === 'failed' && error) {
    return <Alert severity="error" message={error} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Projects</h2>
        {canCreate && (
          <Button onClick={onCreateClick}>Create Project</Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Alert severity="info" message="No projects found." />
      ) : (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gridAutoRows: '1fr',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                isActive={project.id === activeProjectId}
                onSetActive={handleSetActive}
              />
            ))}
          </div>
          
          {meta && (
            <Pagination 
              meta={meta} 
              onNext={() => handlePageChange(meta.nextCursor || undefined, 'next')}
              onPrev={() => handlePageChange(meta.prevCursor || undefined, 'prev')}
            />
          )}
        </>
      )}
    </div>
  );
};
