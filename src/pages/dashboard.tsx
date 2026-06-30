import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchDashboardSummary, selectDashboardSummary, selectDashboardStatus } from '../redux/slices/dashboardSlice';
import { selectActiveProject } from '../redux/slices/projectSlice';
import { Card, Alert, Button, Spinner } from '../components/common';
import { LayoutDashboard, Target, BookOpen, CheckSquare, Bug, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const dispatch       = useAppDispatch();
  const activeProject  = useAppSelector(selectActiveProject);
  const activeProjectId = activeProject?.id;
  const summary        = useAppSelector(selectDashboardSummary);
  const loadStatus     = useAppSelector(selectDashboardStatus);

  useEffect(() => {
    if (activeProjectId) {
      dispatch(fetchDashboardSummary(activeProjectId));
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

  if (loadStatus === 'loading' || !summary) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <Spinner size={22} />
          <span>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (loadStatus === 'failed') {
    return (
      <div className="page-container">
        <Alert severity="error" message="Failed to load dashboard data. Please try refreshing the page." />
      </div>
    );
  }

  const { totalEpics, activeEpics, totalStories, totalTasks, openBugs, criticalBugs,
          unassignedBacklog, workDistribution, epicProgress } = summary;

  const totalWork   = workDistribution.todo + workDistribution.inProgress + workDistribution.done;
  const todoPct     = totalWork > 0 ? (workDistribution.todo      / totalWork) * 100 : 0;
  const ipPct       = totalWork > 0 ? (workDistribution.inProgress / totalWork) * 100 : 0;
  const donePct     = totalWork > 0 ? (workDistribution.done       / totalWork) * 100 : 0;

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
                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem' }}>{totalEpics}</h2>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#eef2ff', borderRadius: '8px', color: '#4f46e5' }}>
                <Target size={24} />
              </div>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{activeEpics} active</p>
          </Card>

          <Card style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>User Stories</p>
                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem' }}>{totalStories}</h2>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#e3fcef', borderRadius: '8px', color: '#006644' }}>
                <BookOpen size={24} />
              </div>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>From {totalEpics} epics</p>
          </Card>

          <Card style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Tasks</p>
                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem' }}>{totalTasks}</h2>
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
                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem' }}>{openBugs}</h2>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#ffebe6', borderRadius: '8px', color: '#de350b' }}>
                <Bug size={24} />
              </div>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{criticalBugs} high priority</p>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* 2. Work Distribution */}
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutDashboard size={20} style={{ color: 'var(--color-primary)' }} /> Work Distribution
              </h3>

              {totalWork === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-panel)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>No active work items to display.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    <span>Total Items: <strong>{totalWork}</strong></span>
                  </div>

                  <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                    <div style={{ width: `${todoPct}%`, backgroundColor: '#dfe1e6', transition: 'width 0.3s ease' }} title={`To Do: ${workDistribution.todo}`} />
                    <div style={{ width: `${ipPct}%`,   backgroundColor: '#0052cc', transition: 'width 0.3s ease' }} title={`In Progress / In Review: ${workDistribution.inProgress}`} />
                    <div style={{ width: `${donePct}%`, backgroundColor: '#00875a', transition: 'width 0.3s ease' }} title={`Done: ${workDistribution.done}`} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { label: 'To Do / New',           count: workDistribution.todo,        pct: todoPct,  color: '#dfe1e6' },
                      { label: 'In Progress / Review',  count: workDistribution.inProgress,  pct: ipPct,    color: '#0052cc' },
                      { label: 'Done / Closed',         count: workDistribution.done,        pct: donePct,  color: '#00875a' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: row.color }} />
                          <span style={{ fontSize: '0.9rem' }}>{row.label}</span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{row.count} ({row.pct.toFixed(0)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 3. Execution Health */}
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} style={{ color: '#d97706' }} /> Execution Health
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: criticalBugs > 0 ? '#fff1f0' : '#f6ffed',
                  border: `1px solid ${criticalBugs > 0 ? '#ffa39e' : '#b7eb8f'}`,
                  borderRadius: '8px',
                  display: 'flex', gap: '1rem', alignItems: 'center',
                }}>
                  <div style={{ color: criticalBugs > 0 ? '#f5222d' : '#52c41a' }}>
                    {criticalBugs > 0 ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text-primary)' }}>Bug Quality</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {criticalBugs > 0
                        ? `${criticalBugs} Critical/High priority bug${criticalBugs > 1 ? 's' : ''} need immediate attention.`
                        : 'No critical bugs currently open. Quality is stable.'}
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: unassignedBacklog > 5 ? '#fffbe6' : '#f6ffed',
                  border: `1px solid ${unassignedBacklog > 5 ? '#ffe58f' : '#b7eb8f'}`,
                  borderRadius: '8px',
                  display: 'flex', gap: '1rem', alignItems: 'center',
                }}>
                  <div style={{ color: unassignedBacklog > 5 ? '#faad14' : '#52c41a' }}>
                    {unassignedBacklog > 5 ? <Clock size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text-primary)' }}>Backlog Readiness</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {unassignedBacklog > 0
                        ? `${unassignedBacklog} item${unassignedBacklog > 1 ? 's' : ''} in the backlog lack an assignee.`
                        : 'Backlog items are well assigned and planned.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 4. Epic Progress */}
        <Card>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} style={{ color: 'var(--color-primary)' }} /> Active Epic Progress
            </h3>

            {epicProgress.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-panel)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>No active epics in progress.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {epicProgress.map(epic => (
                  <div key={epic.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{epic.name}</span>
                        {epic.owner && (
                          <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            Owner: {epic.owner.firstName} {epic.owner.lastName}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        {epic.completionPercentage}%
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-neutral-200)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${epic.completionPercentage}%`,
                          backgroundColor: epic.completionPercentage === 100 ? '#00875a' : '#0052cc',
                          transition: 'width 0.5s ease-out',
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
