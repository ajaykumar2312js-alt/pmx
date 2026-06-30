import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button } from '../common/ui';
import { Project } from '../../services/projectService';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import displayStyles from '../common/ui/DataDisplay.module.css';

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  onSetActive: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isActive, onSetActive }) => {
  const navigate = useNavigate();

  const statusKey = project.status.toLowerCase();

  const handleCardClick = () => {
    if (!isActive) {
      onSetActive(project.id);
    }
  };

  return (
    <div 
      style={{ 
        boxShadow: isActive ? '0 0 0 2px var(--color-primary)' : 'none',
        borderRadius: 'var(--border-radius-base)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: isActive ? 'default' : 'pointer',
      }}
      onClick={handleCardClick}
    >
      <Card className="project-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-2)' }}>
          <div style={{ minWidth: 0 }}>
            <span 
              style={{ 
                fontSize: 'var(--font-size-xs)', 
                color: 'var(--color-neutral-500)', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '2px'
              }}
            >
              {project.key}
            </span>
            <h3 
              style={{ 
                margin: 0, 
                fontSize: 'var(--font-size-base)', 
                fontWeight: 600, 
                color: 'var(--color-neutral-900)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={project.name}
            >
              {project.name}
            </h3>
          </div>
          <span 
            className={clsx(displayStyles.tag, displayStyles[statusKey])}
            style={{ flexShrink: 0 }}
          >
            {project.status}
          </span>
        </CardHeader>

        <CardBody style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 'var(--spacing-3)' }}>
          {project.description ? (
            <p 
              style={{
                margin: '0 0 var(--spacing-4) 0',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-neutral-600)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.4,
                minHeight: '2.8em', // Ensures alignment across cards
              }}
              title={project.description}
            >
              {project.description}
            </p>
          ) : (
            <p 
              style={{
                margin: '0 0 var(--spacing-4) 0',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-neutral-400)',
                fontStyle: 'italic',
                lineHeight: 1.4,
                minHeight: '2.8em',
              }}
            >
              No description provided.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-neutral-500)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minWidth: '46px',
                }}
              >
                Owner
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-neutral-50)',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  border: '1px solid var(--color-neutral-200)',
                  minWidth: 0,
                }}
              >
                <Avatar
                  name={project.po ? `${project.po.firstName} ${project.po.lastName}` : 'Unassigned'}
                  size={18}
                />
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 500,
                    color: 'var(--color-neutral-800)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {project.po ? `${project.po.firstName} ${project.po.lastName}` : 'Unassigned'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-neutral-500)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minWidth: '46px',
                }}
              >
                Team
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-neutral-50)',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  border: '1px solid var(--color-neutral-200)',
                }}
              >
                {project.team && project.team.length > 0 ? (
                  <>
                    {project.team.slice(0, 3).map(member => (
                      <Avatar
                        key={member.id}
                        name={`${member.firstName} ${member.lastName}`}
                        size={18}
                      />
                    ))}
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 500,
                        color: 'var(--color-neutral-800)',
                        marginLeft: '2px',
                      }}
                    >
                      {project.team.length} member{project.team.length !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)', fontStyle: 'italic' }}>
                    No members
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-neutral-100)' }}>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${project.id}`);
            }}
          >
            Details
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
