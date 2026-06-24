import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';
import { selectActiveProject } from '../../redux/slices/projectSlice';
import { RoutePaths } from '../../routes/routePaths';
import { NotificationDropdown } from '../../components/common/ui';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const activeProject = useAppSelector(selectActiveProject);

  return (
    <header className={styles.topBar} role="banner">
      <div className={styles.leftSection}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link to={RoutePaths.PROJECTS} className={styles.breadcrumbLink}>
            Projects
          </Link>
          <ChevronRight size={14} className={styles.separator} />
          {activeProject ? (
            <span className={styles.activeContext}>{activeProject.name}</span>
          ) : (
            <span className={styles.activeContext} style={{ fontStyle: 'italic', fontWeight: 400 }}>
              No Active Project
            </span>
          )}
        </nav>
        {activeProject && (
          <span className={styles.projectBadge} title="Project Key">
            {activeProject.key}
          </span>
        )}
      </div>

      <div className={styles.rightSection}>
        <div className={styles.notificationSlot} aria-label="Notifications">
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
};
