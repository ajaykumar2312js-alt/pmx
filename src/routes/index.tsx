import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import { RoutePaths } from './routePaths';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Role } from '../common/enums';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/login'));
const MicrosoftCallbackPage = lazy(() => import('../pages/auth/microsoft-callback'));
const DashboardPage = lazy(() => import('../pages/dashboard'));
const UsersPage = lazy(() => import('../pages/users'));
const AuditLogsPage = lazy(() => import('../pages/audit-logs'));
const ProjectsPage = lazy(() => import('../pages/projects'));
const ProjectDetailPage = lazy(() => import('../pages/project-detail'));
const BacklogPage = lazy(() => import('../pages/backlog'));
const EpicsPage = lazy(() => import('../pages/epics'));
const EpicDetailPage = lazy(() => import('../pages/epic-detail'));
const StoriesPage = lazy(() => import('../pages/stories'));
const StoryDetailPage = lazy(() => import('../pages/story-detail'));
const TasksPage = lazy(() => import('../pages/tasks'));
const TaskDetailPage = lazy(() => import('../pages/task-detail'));
const BugsPage = lazy(() => import('../pages/bugs'));
const BugDetailPage = lazy(() => import('../pages/bug-detail'));
const ListPage = lazy(() => import('../pages/list'));
const SprintsPage = lazy(() => import('../pages/sprints'));
const KanbanPage = lazy(() => import('../pages/kanban'));
const NotFoundPage = lazy(() => import('../pages/404'));
const ForbiddenPage = lazy(() => import('../pages/403'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AuthLayout />}>
        <Route path={RoutePaths.LOGIN} element={<Suspense fallback={<div>Loading...</div>}><LoginPage /></Suspense>} />
        <Route path="/auth/microsoft-callback" element={<Suspense fallback={<div>Loading...</div>}><MicrosoftCallbackPage /></Suspense>} />
      </Route>

      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path={RoutePaths.HOME} element={<Navigate to={RoutePaths.DASHBOARD} replace />} />
        <Route path={RoutePaths.DASHBOARD} element={<Suspense fallback={<div>Loading...</div>}><DashboardPage /></Suspense>} />
        
        {/* Project Routes */}
        <Route path="/projects" element={<Suspense fallback={<div>Loading...</div>}><ProjectsPage /></Suspense>} />
        <Route path="/projects/:id" element={<Suspense fallback={<div>Loading...</div>}><ProjectDetailPage /></Suspense>} />
        <Route path="/backlog" element={<Suspense fallback={<div>Loading...</div>}><BacklogPage /></Suspense>} />
        <Route path="/epics" element={<Suspense fallback={<div>Loading...</div>}><EpicsPage /></Suspense>} />
        <Route path="/epics/:id" element={<Suspense fallback={<div>Loading...</div>}><EpicDetailPage /></Suspense>} />
        <Route path="/stories" element={<Suspense fallback={<div>Loading...</div>}><StoriesPage /></Suspense>} />
        <Route path="/stories/:id" element={<Suspense fallback={<div>Loading...</div>}><StoryDetailPage /></Suspense>} />
        <Route path="/tasks" element={<Suspense fallback={<div>Loading...</div>}><TasksPage /></Suspense>} />
        <Route path="/tasks/:id" element={<Suspense fallback={<div>Loading...</div>}><TaskDetailPage /></Suspense>} />
        <Route path="/bugs" element={<Suspense fallback={<div>Loading...</div>}><BugsPage /></Suspense>} />
        <Route path="/bugs/:id" element={<Suspense fallback={<div>Loading...</div>}><BugDetailPage /></Suspense>} />
        <Route path="/sprints" element={<Suspense fallback={<div>Loading...</div>}><SprintsPage /></Suspense>} />
        <Route path="/list" element={<Suspense fallback={<div>Loading...</div>}><ListPage /></Suspense>} />
        <Route path={RoutePaths.KANBAN} element={<Suspense fallback={<div>Loading...</div>}><KanbanPage /></Suspense>} />
        
        {/* Admin Routes */}
        <Route path="/users" element={
          <ProtectedRoute requireRoles={[Role.ADMIN]}>
            <Suspense fallback={<div>Loading...</div>}><UsersPage /></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/audit-logs" element={
          <ProtectedRoute requireRoles={[Role.ADMIN]}>
            <Suspense fallback={<div>Loading...</div>}><AuditLogsPage /></Suspense>
          </ProtectedRoute>
        } />
      </Route>

      {/* Error Routes */}
      <Route path="/403" element={<Suspense fallback={<div>Loading...</div>}><ForbiddenPage /></Suspense>} />
      <Route path="*" element={<Suspense fallback={<div>Loading...</div>}><NotFoundPage /></Suspense>} />
    </>
  )
);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
