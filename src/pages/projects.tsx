import React, { useState } from 'react';
import { ProjectList, ProjectForm } from '../components/projects';
import { hasRole } from '../redux/slices/authSlice';
import { useAppSelector } from '../redux/hooks';
import { Role } from '../common/enums';

const ProjectsPage: React.FC = () => {
  const authState = useAppSelector(state => state.auth);
  const isPOOrAdmin = hasRole({ auth: authState }, Role.PO) || hasRole({ auth: authState }, Role.ADMIN);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="page-container">
      <ProjectList 
        canCreate={isPOOrAdmin} 
        onCreateClick={() => setShowCreateModal(true)} 
      />
      
      {showCreateModal && (
        <ProjectForm onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default ProjectsPage;
