import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchEpics, selectEpics } from '../redux/slices/epicSlice';
import { fetchStories, selectStories } from '../redux/slices/storySlice';
import { fetchTasks, selectTasks } from '../redux/slices/taskSlice';
import { fetchBugs, selectBugs } from '../redux/slices/bugSlice';
import { fetchBacklogItems, selectBacklogItems } from '../redux/slices/backlogSlice';
import { selectActiveProject } from '../redux/slices/projectSlice';
import { Card, Alert, Button } from '../components/common';
import { LayoutDashboard, Target, BookOpen, CheckSquare, Bug, AlertTriangle, CheckCircle, Clock } from 'lucide-react';


const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(selectActiveProject);
  const activeProjectId = activeProject?.id;

  const epics = useAppSelector(selectEpics);
  const stories = useAppSelector(selectStories);
  const tasks = useAppSelector(selectTasks);
  const bugs = useAppSelector(selectBugs);
  const backlogItems = useAppSelector(selectBacklogItems);

  useEffect(() => {
    if (activeProjectId) {
      dispatch(fetchEpics({ projectId: activeProjectId, params: { limit: 100 } }));
      dispatch(fetchStories({ projectId: activeProjectId, params: { limit: 100 } }));
      dispatch(fetchTasks({ projectId: activeProjectId, params: { limit: 100 } }));
      dispatch(fetchBugs({ projectId: activeProjectId, params: { limit: 100 } }));
      dispatch(fetchBacklogItems({ projectId: activeProjectId, limit: 100 }));
    }
  }, [dispatch, activeProjectId]);

  if (!activeProjectId) {
    return (
      <div className="page-container">
        <Alert severity="warning" message="Please select an active project from the sidebar to view the dashboard." />
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={() => window.location.href = '/projects'}>Go to Projects</Button>
        </div>
      </div>
    );
  }

  // --- Calculate Work Item Distribution ---
  let todoCount = 0;
  let inProgressCount = 0;
  let doneCount = 0;

  stories.forEach(s => {
    if (s.status === 'TODO') todoCount++;
    else if (s.status === 'IN_PROGRESS' || s.status === 'IN_REVIEW') inProgressCount++;
    else if (s.status === 'DONE') doneCount++;
  });

  tasks.forEach(t => {
    if (t.status === 'TODO') todoCount++;
    else if (t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW') inProgressCount++;
    else if (t.status === 'DONE') doneCount++;
  });

  bugs.forEach(b => {
    if (b.status === 'TODO') todoCount++;
    else if (b.status === 'IN_PROGRESS' || b.status === 'IN_REVIEW') inProgressCount++;
    else if (b.status === 'DONE') doneCount++;
  });

  const totalWorkItems = todoCount + inProgressCount + doneCount;
  const todoPct = totalWorkItems > 0 ? (todoCount / totalWorkItems) * 100 : 0;
  const inProgressPct = totalWorkItems > 0 ? (inProgressCount / totalWorkItems) * 100 : 0;
  const donePct = totalWorkItems > 0 ? (doneCount / totalWorkItems) * 100 : 0;

  // --- Calculate Health & Risk ---
  const criticalBugs = bugs.filter(b => b.status !== 'DONE' && (b.priority === 'CRITICAL' || b.priority === 'HIGH'));
  const unassignedBacklog = backlogItems.filter(b => !b.assigneeId && b.status !== 'Closed');
  const activeEpics = epics.filter(e => e.status !== 'Done' && e.status !== 'Cancelled');

  return (
    <div className="page-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={28} /> Dashboard
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Execution overview and health metrics for <strong>{activeProject.name}</strong>.
            </p>
          </div>
        </div>

        {/* 1. Status Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Card style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Epics</p>
                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem' }}>{epics.length}</h2>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#eef2ff', borderRadius: '8px', color: '#4f46e5' }}>
                <Target size={24} />
              </div>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{activeEpics.length} active</p>
          </Card>

          <Card style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>User Stories</p>
                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem' }}>{stories.length}</h2>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#e3fcef', borderRadius: '8px', color: '#006644' }}>
                <BookOpen size={24} />
              </div>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>From {epics.length} epics</p>
          </Card>

          <Card style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Tasks</p>
                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem' }}>{tasks.length}</h2>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#e6f4ff', borderRadius: '8px', color: '#0052cc' }}>
                <CheckSquare size={24} />
              </div>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Across all stories</p>
          </Card>

          <Card style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Open Bugs</p>
                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem' }}>{bugs.filter(b => b.status !== 'DONE').length}</h2>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#ffebe6', borderRadius: '8px', color: '#de350b' }}>
                <Bug size={24} />
              </div>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{criticalBugs.length} high priority</p>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* 2. Work Item Distribution */}
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutDashboard size={20} style={{ color: 'var(--color-primary)' }} /> Work Distribution
              </h3>

              {totalWorkItems === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-panel)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>No active work items to display.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    <span>Total Items: <strong>{totalWorkItems}</strong></span>
                  </div>

                  {/* Visual Bar */}
                  <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                    <div style={{ width: `${todoPct}%`, backgroundColor: '#dfe1e6', transition: 'width 0.3s ease' }} title={`To Do: ${todoCount}`} />
                    <div style={{ width: `${inProgressPct}%`, backgroundColor: '#0052cc', transition: 'width 0.3s ease' }} title={`In Progress: ${inProgressCount}`} />
                    <div style={{ width: `${donePct}%`, backgroundColor: '#00875a', transition: 'width 0.3s ease' }} title={`Done: ${doneCount}`} />
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#dfe1e6' }} />
                        <span style={{ fontSize: '0.9rem' }}>To Do / New</span>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{todoCount} ({todoPct.toFixed(0)}%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#0052cc' }} />
                        <span style={{ fontSize: '0.9rem' }}>In Progress / Review</span>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{inProgressCount} ({inProgressPct.toFixed(0)}%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#00875a' }} />
                        <span style={{ fontSize: '0.9rem' }}>Done / Closed</span>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doneCount} ({donePct.toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 4. Overall Execution Health */}
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} style={{ color: '#d97706' }} /> Execution Health
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem 1.25rem', backgroundColor: criticalBugs.length > 0 ? '#fff1f0' : '#f6ffed', border: `1px solid ${criticalBugs.length > 0 ? '#ffa39e' : '#b7eb8f'}`, borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ color: criticalBugs.length > 0 ? '#f5222d' : '#52c41a' }}>
                    {criticalBugs.length > 0 ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text-primary)' }}>Bug</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {criticalBugs.length > 0
                        ? `${criticalBugs.length} Critical/High priority bugs need immediate attention.`
                        : 'No critical bugs currently open. Quality is stable.'}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '1rem 1.25rem', backgroundColor: unassignedBacklog.length > 5 ? '#fffbe6' : '#f6ffed', border: `1px solid ${unassignedBacklog.length > 5 ? '#ffe58f' : '#b7eb8f'}`, borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ color: unassignedBacklog.length > 5 ? '#faad14' : '#52c41a' }}>
                    {unassignedBacklog.length > 5 ? <Clock size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text-primary)' }}>Backlog Readiness</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {unassignedBacklog.length > 0
                        ? `${unassignedBacklog.length} items in the backlog lack an assignee.`
                        : 'Backlog items are well assigned and planned.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 3. Epic Progress */}
        <Card>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} style={{ color: 'var(--color-primary)' }} /> Active Epic Progress
            </h3>

            {activeEpics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-panel)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>No active epics in progress.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {activeEpics.map(epic => (
                  <div key={epic.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{epic.name}</span>
                        {epic.owner && <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Owner: {epic.owner.firstName} {epic.owner.lastName}</span>}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{epic.completionPercentage || 0}%</span>
                    </div>

                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-neutral-200)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${epic.completionPercentage || 0}%`,
                          backgroundColor: (epic.completionPercentage || 0) === 100 ? '#00875a' : '#0052cc',
                          transition: 'width 0.5s ease-out'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default DashboardPage;
