import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Layers, 
  Compass, 
  FileText, 
  Calendar, 
  Columns, 
  BarChart3, 
  Users, 
  LogOut,
  CheckSquare,
  Bug 
} from 'lucide-react';
import { RoutePaths } from '../../routes/routePaths';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectCurrentUser, clearSession, hasRole } from '../../redux/slices/authSlice';
import { authService } from '../../services/authService';
import { Avatar } from '../../components/common/ui';
import { Role } from '../../common/enums';
import { 
  selectProjects, 
  fetchProjects 
} from '../../redux/slices/projectSlice';
import { setActiveProject } from '../../redux/slices/uiSlice';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const user = useAppSelector(selectCurrentUser);
  const authState = useAppSelector(state => state.auth);
  const projects = useAppSelector(selectProjects);
  const activeProjectId = useAppSelector(state => state.ui.activeProjectId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = hasRole({ auth: authState }, Role.ADMIN);

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects({ page: 1, limit: 100 }));
    }
  }, [dispatch, projects.length]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignored
    }
    dispatch(clearSession());
    navigate('/login', { replace: true });
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    dispatch(setActiveProject(value || null));
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className={styles.sidebar} aria-label="Sidebar Navigation">
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>P</div>
        <span className={styles.appName}>PMX Suite</span>
      </div>

      <div className={styles.projectSelector}>
        <label htmlFor="sidebar-project-select" className={styles.selectorLabel}>
          Active Project
        </label>
        <select
          id="sidebar-project-select"
          className={styles.selectInput}
          value={activeProjectId || ''}
          onChange={handleProjectChange}
        >
          <option value="">-- No Active Project --</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.name} ({proj.key})
            </option>
          ))}
        </select>
      </div>

      <div className={styles.divider} />

      <nav className={styles.navSection} aria-label="Main Navigation">
        <Link
          to={RoutePaths.PROJECTS}
          className={`${styles.navItem} ${isActive(RoutePaths.PROJECTS) ? styles.navItemActive : ''}`}
        >
          <Briefcase className={styles.navIcon} />
          <span>Projects</span>
        </Link>

        <Link
          to={RoutePaths.DASHBOARD}
          className={`${styles.navItem} ${isActive(RoutePaths.DASHBOARD) ? styles.navItemActive : ''} ${!activeProjectId ? styles.navItemDisabled : ''}`}
          title={!activeProjectId ? 'Select a project to access dashboard' : undefined}
        >
          <LayoutDashboard className={styles.navIcon} />
          <span>Dashboard</span>
        </Link>

        <Link
          to={RoutePaths.BACKLOG}
          className={`${styles.navItem} ${isActive(RoutePaths.BACKLOG) ? styles.navItemActive : ''} ${!activeProjectId ? styles.navItemDisabled : ''}`}
          title={!activeProjectId ? 'Select a project to access backlog' : undefined}
        >
          <Layers className={styles.navIcon} />
          <span>Backlog</span>
        </Link>

        <Link
          to={RoutePaths.EPICS}
          className={`${styles.navItem} ${isActive(RoutePaths.EPICS) ? styles.navItemActive : ''} ${!activeProjectId ? styles.navItemDisabled : ''}`}
          title={!activeProjectId ? 'Select a project to access epics' : undefined}
        >
          <Compass className={styles.navIcon} />
          <span>Epics</span>
        </Link>

        <Link
          to={RoutePaths.STORIES}
          className={`${styles.navItem} ${isActive(RoutePaths.STORIES) ? styles.navItemActive : ''} ${!activeProjectId ? styles.navItemDisabled : ''}`}
          title={!activeProjectId ? 'Select a project to access stories' : undefined}
        >
          <FileText className={styles.navIcon} />
          <span>Stories</span>
        </Link>

        <Link
          to={RoutePaths.TASKS}
          className={`${styles.navItem} ${isActive(RoutePaths.TASKS) ? styles.navItemActive : ''} ${!activeProjectId ? styles.navItemDisabled : ''}`}
          title={!activeProjectId ? 'Select a project to access tasks' : undefined}
        >
          <CheckSquare className={styles.navIcon} />
          <span>Tasks</span>
        </Link>

        <Link
          to={RoutePaths.BUGS}
          className={`${styles.navItem} ${isActive(RoutePaths.BUGS) ? styles.navItemActive : ''} ${!activeProjectId ? styles.navItemDisabled : ''}`}
          title={!activeProjectId ? 'Select a project to access bugs' : undefined}
        >
          <Bug className={styles.navIcon} />
          <span>Bugs</span>
        </Link>

        <Link
          to={RoutePaths.SPRINTS}
          className={`${styles.navItem} ${isActive(RoutePaths.SPRINTS) ? styles.navItemActive : ''} ${!activeProjectId ? styles.navItemDisabled : ''}`}
          title={!activeProjectId ? 'Select a project to access sprints' : undefined}
        >
          <Calendar className={styles.navIcon} />
          <span>Sprints</span>
        </Link>

        <Link
          to={RoutePaths.KANBAN}
          className={`${styles.navItem} ${isActive(RoutePaths.KANBAN) ? styles.navItemActive : ''} ${!activeProjectId ? styles.navItemDisabled : ''}`}
          title={!activeProjectId ? 'Select a project to access kanban board' : undefined}
        >
          <Columns className={styles.navIcon} />
          <span>Kanban</span>
        </Link>

        <Link
          to={RoutePaths.LIST}
          className={`${styles.navItem} ${isActive(RoutePaths.LIST) ? styles.navItemActive : ''} ${!activeProjectId ? styles.navItemDisabled : ''}`}
          title={!activeProjectId ? 'Select a project to access list' : undefined}
        >
          <BarChart3 className={styles.navIcon} />
          <span>List</span>
        </Link>

        {isAdmin && (
          <>
            <div className={styles.divider} />
            <div className={styles.adminLabel}>Administration</div>
            <Link
              to={RoutePaths.USERS}
              className={`${styles.navItem} ${isActive(RoutePaths.USERS) ? styles.navItemActive : ''}`}
            >
              <Users className={styles.navIcon} />
              <span>Users</span>
            </Link>
          </>
        )}
      </nav>

      <footer className={styles.footer}>
        <div className={styles.userInfo}>
          <Avatar 
            name={user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'} 
            size={36} 
          />
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className={styles.signOutButton}
          aria-label="Sign out"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </footer>
    </aside>
  );
};
