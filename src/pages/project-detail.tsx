import React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectOverview } from '../components/projects';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>Invalid Project ID</div>;

  return (
    <div className="page-container">
      <ProjectOverview projectId={id} />
    </div>
  );
};

export default ProjectDetailPage;
