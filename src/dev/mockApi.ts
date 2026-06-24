/**
 * mockApi.ts — Development-only axios mock adapter.
 *
 * Intercepts every API request and returns realistic seed data so the
 * entire frontend workflow can be verified without a running backend.
 *
 * Activated automatically when VITE_BYPASS_AUTH=true (set in .env.local).
 * This file is never imported in production builds.
 */

import MockAdapter from 'axios-mock-adapter';
import type { AxiosRequestConfig } from 'axios';
import apiClient from '../services/apiClient';
import { v4 as uuidv4 } from 'uuid';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const USERS = [
  { id: 'usr-001', firstName: 'Priya',   lastName: 'Sharma',   email: 'priya@pmx.dev',   status: 'Active',   roles: ['admin'] },
  { id: 'usr-002', firstName: 'Arjun',   lastName: 'Mehta',    email: 'arjun@pmx.dev',   status: 'Active',   roles: ['po'] },
  { id: 'usr-003', firstName: 'Sneha',   lastName: 'Iyer',     email: 'sneha@pmx.dev',   status: 'Active',   roles: ['developer'] },
  { id: 'usr-004', firstName: 'Rahul',   lastName: 'Verma',    email: 'rahul@pmx.dev',   status: 'Active',   roles: ['developer'] },
  { id: 'usr-005', firstName: 'Divya',   lastName: 'Nair',     email: 'divya@pmx.dev',   status: 'Inactive', roles: ['viewer'] },
  { id: 'usr-006', firstName: 'Karan',   lastName: 'Singh',    email: 'karan@pmx.dev',   status: 'Active',   roles: ['developer'] },
];

const NOTIFICATIONS: any[] = [];
const COMMENTS: Record<string, any[]> = {};

const createNotification = (title: string, message: string, type: string, relatedItemId?: string, relatedItemType?: string) => {
  NOTIFICATIONS.unshift({
    id: `notif-${Date.now()}-${Math.random()}`,
    title,
    message,
    read: false,
    timestamp: new Date().toISOString(),
    type,
    relatedItemId,
    relatedItemType,
  });
};

const DEFAULT_WORKFLOW_STATUSES = [
  { id: 'TODO', label: 'To Do', category: 'TODO', color: '#dfe1e6', order: 1 },
  { id: 'IN_PROGRESS', label: 'In Progress', category: 'IN_PROGRESS', color: '#deebff', order: 2 },
  { id: 'IN_REVIEW', label: 'In Review', category: 'IN_PROGRESS', color: '#fffae6', order: 3 },
  { id: 'DONE', label: 'Done', category: 'DONE', color: '#e3fcef', order: 4 }
];

const PROJECTS = [
  {
    id: 'proj-001', name: 'PMX Platform', key: 'PMX',
    description: 'Core product management platform for internal teams.',
    status: 'Active', startDate: '2025-01-15T00:00:00.000Z', endDate: '2025-12-31T00:00:00.000Z',
    poId: 'usr-002', po: USERS[1], teamIds: ['usr-001', 'usr-003', 'usr-004'], team: [USERS[0], USERS[2], USERS[3]],
    workflowStatuses: [...DEFAULT_WORKFLOW_STATUSES],
    createdAt: '2025-01-10T09:00:00.000Z', updatedAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'proj-002', name: 'Mobile App Redesign', key: 'MAR',
    description: 'Complete redesign of the mobile consumer app.',
    status: 'Active', startDate: '2025-03-01T00:00:00.000Z', endDate: '2026-03-31T00:00:00.000Z',
    poId: 'usr-002', po: USERS[1], teamIds: ['usr-003', 'usr-006'], team: [USERS[2], USERS[5]],
    workflowStatuses: [...DEFAULT_WORKFLOW_STATUSES],
    createdAt: '2025-02-20T09:00:00.000Z', updatedAt: '2026-05-15T14:00:00.000Z',
  },
  {
    id: 'proj-003', name: 'API Gateway v2', key: 'APIG',
    description: 'Next-gen API gateway with rate limiting and telemetry.',
    status: 'Archived', startDate: '2024-06-01T00:00:00.000Z', endDate: '2025-01-31T00:00:00.000Z',
    poId: 'usr-001', po: USERS[0], teamIds: ['usr-004'], team: [USERS[3]],
    workflowStatuses: [...DEFAULT_WORKFLOW_STATUSES],
    createdAt: '2024-05-10T09:00:00.000Z', updatedAt: '2025-02-01T09:00:00.000Z',
  },
];

const EPICS = [
  {
    id: 'epic-001', projectId: 'proj-001',
    name: 'User Authentication & Session',
    description: 'Implement SSO login, token refresh, and session management.',
    ownerId: 'usr-002', owner: USERS[1], targetRelease: '2025-04-30T00:00:00.000Z',
    status: 'Done', completionPercentage: 100,
    createdAt: '2025-01-16T09:00:00.000Z', updatedAt: '2025-04-28T09:00:00.000Z',
  },
  {
    id: 'epic-002', projectId: 'proj-001',
    name: 'Product Backlog Management',
    description: 'Full backlog CRUD with drag-and-drop prioritisation and bulk actions.',
    ownerId: 'usr-002', owner: USERS[1], targetRelease: '2025-07-31T00:00:00.000Z',
    status: 'In Progress', completionPercentage: 62,
    createdAt: '2025-02-10T09:00:00.000Z', updatedAt: '2026-06-10T11:00:00.000Z',
  },
  {
    id: 'epic-003', projectId: 'proj-001',
    name: 'Sprint & Kanban Board',
    description: 'Sprint planning, active kanban board with WIP limits.',
    ownerId: 'usr-003', owner: USERS[2], targetRelease: '2025-10-31T00:00:00.000Z',
    status: 'Open', completionPercentage: 8,
    createdAt: '2025-03-01T09:00:00.000Z', updatedAt: '2026-05-20T09:00:00.000Z',
  },
  {
    id: 'epic-004', projectId: 'proj-002',
    name: 'Mobile Navigation Overhaul',
    description: 'Redesign app navigation with bottom tabs and gesture support.',
    ownerId: 'usr-006', owner: USERS[5], targetRelease: '2025-08-31T00:00:00.000Z',
    status: 'In Progress', completionPercentage: 35,
    createdAt: '2025-03-15T09:00:00.000Z', updatedAt: '2026-06-01T10:00:00.000Z',
  },
];

const EPIC_CHILDREN: Record<string, object[]> = {
  'epic-001': [
    { id: 'ch-001', title: 'Microsoft OAuth login flow',        type: 'STORY', status: 'DONE',        priority: 'HIGH',     owner: USERS[2] },
    { id: 'ch-002', title: 'Access token refresh interceptor',  type: 'TASK',  status: 'DONE',        priority: 'HIGH',     owner: USERS[3] },
    { id: 'ch-003', title: 'Session expiry banner',             type: 'STORY', status: 'DONE',        priority: 'MEDIUM',   owner: USERS[2] },
    { id: 'ch-004', title: 'Logout clears in-memory token',     type: 'BUG',   status: 'DONE',        priority: 'CRITICAL', owner: USERS[3] },
    { id: 'ch-005', title: 'Role-based route guards',           type: 'STORY', status: 'DONE',        priority: 'HIGH',     owner: USERS[0] },
  ],
  'epic-002': [
    { id: 'ch-006', title: 'Backlog list with cursor pagination', type: 'STORY', status: 'IN_PROGRESS', priority: 'HIGH',   owner: USERS[2] },
    { id: 'ch-007', title: 'Create backlog item modal',           type: 'STORY', status: 'DONE',        priority: 'HIGH',   owner: USERS[3] },
    { id: 'ch-008', title: 'Drag-and-drop reorder',              type: 'STORY', status: 'IN_PROGRESS', priority: 'MEDIUM', owner: USERS[2] },
    { id: 'ch-009', title: 'Bulk priority update',               type: 'TASK',  status: 'TODO',        priority: 'MEDIUM', owner: USERS[3] },
    { id: 'ch-010', title: 'Backlog filter toolbar',             type: 'STORY', status: 'TODO',        priority: 'LOW',    owner: USERS[2] },
  ],
  'epic-003': [
    { id: 'ch-011', title: 'Sprint creation wizard',         type: 'STORY', status: 'TODO', priority: 'HIGH', owner: USERS[3] },
    { id: 'ch-012', title: 'Kanban board with WIP limits',   type: 'STORY', status: 'TODO', priority: 'HIGH', owner: USERS[2] },
  ],
  'epic-004': [
    { id: 'ch-013', title: 'Bottom tab navigation',           type: 'STORY', status: 'IN_PROGRESS', priority: 'HIGH',   owner: USERS[5] },
    { id: 'ch-014', title: 'Gesture-based stack navigation',  type: 'STORY', status: 'TODO',        priority: 'MEDIUM', owner: USERS[5] },
  ],
};

const BACKLOG_ITEMS = [
  { id: 'bli-001', projectId: 'proj-001', title: 'Setup CI/CD pipeline for frontend',                order: 1, type: 'TASK',  status: 'Ready',   priority: 'HIGH',     epicId: 'epic-001', createdAt: '2025-01-20T09:00:00.000Z', updatedAt: '2025-01-20T09:00:00.000Z' },
  { id: 'bli-002', projectId: 'proj-001', title: 'Implement cursor-based pagination for all APIs',   order: 2, type: 'STORY', status: 'Refined',  priority: 'HIGH',     epicId: 'epic-002', createdAt: '2025-01-22T09:00:00.000Z', updatedAt: '2025-02-01T09:00:00.000Z' },
  { id: 'bli-003', projectId: 'proj-001', title: 'Backlog drag-and-drop reordering',                 order: 3, type: 'STORY', status: 'Ready',    priority: 'MEDIUM',   epicId: 'epic-002', createdAt: '2025-01-25T09:00:00.000Z', updatedAt: '2025-02-10T09:00:00.000Z' },
  { id: 'bli-004', projectId: 'proj-001', title: 'Fix token expiry not clearing session correctly',  order: 4, type: 'BUG',   status: 'New',      priority: 'CRITICAL', epicId: null,       createdAt: '2025-02-10T09:00:00.000Z', updatedAt: '2025-02-12T09:00:00.000Z' },
  { id: 'bli-005', projectId: 'proj-001', title: 'Epic management: create and link epics',           order: 5, type: 'STORY', status: 'Refined',  priority: 'HIGH',     epicId: 'epic-003', createdAt: '2025-02-15T09:00:00.000Z', updatedAt: '2025-03-01T09:00:00.000Z' },
  { id: 'bli-006', projectId: 'proj-001', title: 'User story G/W/T acceptance criteria editor',     order: 6, type: 'STORY', status: 'New',      priority: 'MEDIUM',   epicId: 'epic-002', createdAt: '2025-02-20T09:00:00.000Z', updatedAt: '2025-02-20T09:00:00.000Z' },
  { id: 'bli-007', projectId: 'proj-001', title: 'Audit log viewer with date-range filter',          order: 7, type: 'TASK',  status: 'Ready',    priority: 'LOW',      epicId: null,       createdAt: '2025-03-01T09:00:00.000Z', updatedAt: '2025-03-01T09:00:00.000Z' },
  { id: 'bli-008', projectId: 'proj-001', title: 'Bulk-assign sprint to multiple backlog items',     order: 8, type: 'STORY', status: 'New',      priority: 'MEDIUM',   epicId: 'epic-002', createdAt: '2025-03-05T09:00:00.000Z', updatedAt: '2025-03-05T09:00:00.000Z' },
];

const STORIES = [
  { id: 'str-001', projectId: 'proj-001', epicId: 'epic-002', sprintId: null, title: 'Backlog list with cursor pagination', asA: 'Product Owner', iWant: 'a paginated list of backlog items', soThat: 'I can review large backlogs efficiently', acceptanceCriteria: [{ id: 's1-ac1', given: 'I am on the backlog page', when: 'more than 20 items exist', then: 'I see a Next Page control' }], priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: 'usr-003', assignee: USERS[2], createdAt: '2025-02-15T09:00:00.000Z', updatedAt: '2026-06-01T09:00:00.000Z' },
  { id: 'str-002', projectId: 'proj-001', epicId: 'epic-002', sprintId: null, title: 'Create backlog item modal', asA: 'Product Owner', iWant: 'a quick-create modal for backlog items', soThat: 'I can capture ideas fast without leaving the page', acceptanceCriteria: [], priority: 'HIGH', status: 'DONE', assigneeId: 'usr-004', assignee: USERS[3], createdAt: '2025-02-20T09:00:00.000Z', updatedAt: '2026-05-10T09:00:00.000Z' },
  { id: 'str-003', projectId: 'proj-001', epicId: 'epic-003', sprintId: null, title: 'Sprint creation wizard', asA: 'Scrum Master', iWant: 'a wizard to define sprint dates and capacity', soThat: 'I can plan sprints in a structured way', acceptanceCriteria: [{ id: 's3-ac1', given: 'I open the sprint wizard', when: 'I set start and end dates', then: 'capacity is calculated automatically' }], priority: 'HIGH', status: 'TODO', assigneeId: null, assignee: null, createdAt: '2025-03-01T09:00:00.000Z', updatedAt: '2025-03-01T09:00:00.000Z' },
  { id: 'str-004', projectId: 'proj-002', epicId: 'epic-004', sprintId: null, title: 'Bottom tab navigation redesign', asA: 'Mobile user', iWant: 'a bottom tab bar for primary navigation', soThat: 'I can reach key screens with one thumb', acceptanceCriteria: [], priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: 'usr-006', assignee: USERS[5], createdAt: '2025-03-20T09:00:00.000Z', updatedAt: '2026-04-01T09:00:00.000Z' },
];

const TASKS = [
  { id: 'tsk-001', projectId: 'proj-001', epicId: 'epic-002', title: 'Implement frontend data models', status: 'IN_PROGRESS', assigneeId: 'usr-003', assignee: USERS[2], estimatedHours: 8, actualHours: 4, createdAt: '2025-02-15T09:00:00.000Z', updatedAt: '2025-02-15T09:00:00.000Z' },
  { id: 'tsk-002', projectId: 'proj-001', epicId: 'epic-002', title: 'Write unit tests for pagination', status: 'TODO', assigneeId: 'usr-004', assignee: USERS[3], estimatedHours: 4, actualHours: 0, createdAt: '2025-02-16T09:00:00.000Z', updatedAt: '2025-02-16T09:00:00.000Z' },
];

const BUGS = [
  { id: 'bug-001', projectId: 'proj-001', title: 'Pagination next cursor is null on last page', stepsToReproduce: '1. Go to page 2\n2. Click next', severity: 'HIGH', priority: 'HIGH', status: 'TODO', reporterId: 'usr-002', reporter: USERS[1], assigneeId: null, createdAt: '2025-02-20T09:00:00.000Z', updatedAt: '2025-02-20T09:00:00.000Z' },
];

const SUBTASKS: any[] = [
  { id: 'st-001', parentId: 'str-001', parentType: 'STORY', childItemType: 'SUBTASK', title: 'Create UI component',             status: 'DONE',        assignee: USERS[2], estimatedHours: 2 },
  { id: 'st-002', parentId: 'str-001', parentType: 'STORY', childItemType: 'TASK',    title: 'Integrate pagination API',         status: 'IN_PROGRESS', assignee: USERS[2], estimatedHours: 4 },
  { id: 'st-003', parentId: 'str-001', parentType: 'STORY', childItemType: 'STORY',   title: 'Write story-level acceptance test', status: 'TODO',        assignee: null,     asA: 'Developer', iWant: 'to verify pagination', soThat: 'regressions are caught' },
  { id: 'st-004', parentId: 'str-001', parentType: 'STORY', childItemType: 'BUG',     title: 'Cursor is null on last page',      status: 'TODO',        assignee: USERS[3], severity: 'HIGH' },
  { id: 'st-005', parentId: 'str-001', parentType: 'STORY', childItemType: 'CUSTOM',  customTypeName: 'Design Review', title: 'Review Figma mockups with UX', status: 'TODO', assignee: null },
];

const SPRINTS: any[] = [
  {
    id: 'sprint-001',
    projectId: 'proj-001',
    name: 'Sprint 1 - Authentication MVP',
    goal: 'Complete User Authentication and User Management features.',
    startDate: '2025-01-15T00:00:00.000Z',
    endDate: '2025-01-29T00:00:00.000Z',
    status: 'ACTIVE',
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  }
];


// ─── Response helpers ──────────────────────────────────────────────────────────

type MockReply = [number, unknown];

const ok = (data: unknown, meta: unknown = null): MockReply =>
  [200, { success: true, data, meta }];

const notFound = (msg = 'Not found'): MockReply =>
  [404, { success: false, message: msg }];

const noContent = (): MockReply =>
  [204, { success: true }];

const paginatedMeta = (total: number, limit = 20) => ({
  total,
  limit,
  nextCursor: total > limit ? 'next-page-cursor' : null,
  prevCursor: null,
  hasMore: total > limit,
});

const parse = (config: AxiosRequestConfig) =>
  JSON.parse(config.data as string) as Record<string, unknown>;

const urlSegment = (config: AxiosRequestConfig, index: number) =>
  config.url?.split('/')[index] ?? '';

// ─── Install the mock adapter ──────────────────────────────────────────────────

export function installMockApi() {
  const mock = new MockAdapter(apiClient, { delayResponse: 350, onNoMatch: 'passthrough' });

  // ── Auth ────────────────────────────────────────────────────────────────────
  mock.onGet('/api/v1/auth/me').reply(() =>
    ok({
      user: { id: 'usr-001', email: 'dev@pmx.local', firstName: 'Dev', lastName: 'User', status: 'Active' },
      roles: ['admin', 'po', 'developer'],
      permissions: ['*'],
    })
  );

  // ── Notifications ───────────────────────────────────────────────────────────
  mock.onGet('/api/v1/notifications').reply(() => ok(NOTIFICATIONS));
  
  mock.onPatch(/\/api\/v1\/notifications\/.+\/read/).reply((config) => {
    const id = urlSegment(config, 4);
    const notif = NOTIFICATIONS.find(n => n.id === id);
    if (notif) notif.read = true;
    return notif ? ok(notif) : notFound();
  });

  mock.onPatch('/api/v1/notifications/read-all').reply(() => {
    NOTIFICATIONS.forEach(n => n.read = true);
    return ok(null);
  });

  // ── Users ───────────────────────────────────────────────────────────────────
  mock.onGet('/api/v1/users').reply(() =>
    ok(USERS, paginatedMeta(USERS.length))
  );

  mock.onPost('/api/v1/users').reply((config) => {
    const body = parse(config);
    const newUser = { id: uuidv4(), ...body, status: 'Active' };
    USERS.push(newUser as typeof USERS[0]);
    return ok(newUser);
  });

  mock.onPost(/\/api\/v1\/users\/.+\/deactivate/).reply((config) => {
    const id = urlSegment(config, 4);
    const user = USERS.find(u => u.id === id);
    if (user) user.status = 'Inactive';
    return user ? ok(user) : notFound();
  });

  mock.onPatch(/\/api\/v1\/users\/.+\/roles/).reply((config) => {
    const id = urlSegment(config, 4);
    const user = USERS.find(u => u.id === id);
    if (user) (user as Record<string, unknown>).roles = (parse(config).roles as string[]);
    return user ? ok(user) : notFound();
  });

  // ── Projects ─────────────────────────────────────────────────────────────────
  mock.onGet('/api/v1/projects').reply(() =>
    ok(PROJECTS, paginatedMeta(PROJECTS.length))
  );

  mock.onGet(/\/api\/v1\/projects\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const project = PROJECTS.find(p => p.id === id);
    return project ? ok(project) : notFound('Project not found');
  });

  mock.onPost('/api/v1/projects').reply((config) => {
    const body = parse(config);
    const now = new Date().toISOString();
    const newProject = {
      id: uuidv4(), ...body,
      po: USERS.find(u => u.id === body.poId),
      team: USERS.filter(u => (body.teamIds as string[])?.includes(u.id)),
      workflowStatuses: body.workflowStatuses || [...DEFAULT_WORKFLOW_STATUSES],
      createdAt: now, updatedAt: now,
    };
    PROJECTS.push(newProject as typeof PROJECTS[0]);
    return ok(newProject);
  });

  mock.onPatch(/\/api\/v1\/projects\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const body = parse(config);
    const idx = PROJECTS.findIndex(p => p.id === id);
    if (idx === -1) return notFound();
    
    const updated = { ...PROJECTS[idx], ...body, updatedAt: new Date().toISOString() };
    if (body.teamIds) {
      updated.team = USERS.filter(u => (body.teamIds as string[]).includes(u.id));
    }
    if (body.poId) {
      updated.po = USERS.find(u => u.id === body.poId);
    }
    PROJECTS[idx] = updated;
    return ok(PROJECTS[idx]);
  });

  mock.onPost(/\/api\/v1\/projects\/.+\/archive/).reply((config) => {
    const id = urlSegment(config, 4);
    const project = PROJECTS.find(p => p.id === id);
    if (project) project.status = 'Archived';
    return project ? ok(project) : notFound();
  });

  mock.onDelete(/\/api\/v1\/projects\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const idx = PROJECTS.findIndex(p => p.id === id);
    if (idx !== -1) PROJECTS.splice(idx, 1);
    return noContent();
  });

  // ── Epics ────────────────────────────────────────────────────────────────────
  mock.onGet(/\/api\/v1\/projects\/.+\/epics/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const items = EPICS.filter(e => e.projectId === projectId);
    return ok(items, paginatedMeta(items.length));
  });

  mock.onGet(/\/api\/v1\/epics\/[^/]+\/children/).reply((config) => {
    const epicId = urlSegment(config, 4);
    const children = EPIC_CHILDREN[epicId] ?? [];
    return ok(children, paginatedMeta(children.length));
  });

  mock.onGet(/\/api\/v1\/epics\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const epic = EPICS.find(e => e.id === id);
    return epic ? ok(epic) : notFound('Epic not found');
  });

  mock.onPost(/\/api\/v1\/projects\/.+\/epics/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const body = parse(config);
    const now = new Date().toISOString();
    const newEpic = {
      id: uuidv4(), projectId, ...body,
      owner: USERS.find(u => u.id === body.ownerId),
      completionPercentage: 0,
      createdAt: now, updatedAt: now,
    };
    EPICS.push(newEpic as typeof EPICS[0]);
    return ok(newEpic);
  });

  mock.onPatch(/\/api\/v1\/epics\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const body = parse(config);
    const idx = EPICS.findIndex(e => e.id === id);
    if (idx === -1) return notFound();
    EPICS[idx] = { ...EPICS[idx], ...body, updatedAt: new Date().toISOString() };
    return ok(EPICS[idx]);
  });

  // ── Backlog ──────────────────────────────────────────────────────────────────
  mock.onGet(/\/api\/v1\/projects\/.+\/backlog-items/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const items = BACKLOG_ITEMS
      .filter(b => b.projectId === projectId)
      .sort((a, b) => a.order - b.order);
    return ok(items, paginatedMeta(items.length));
  });

  mock.onPost(/\/api\/v1\/projects\/.+\/backlog-items$/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const body = parse(config);
    const now = new Date().toISOString();
    const newItem = {
      id: uuidv4(), projectId, ...body,
      status: 'New',
      order: BACKLOG_ITEMS.filter(b => b.projectId === projectId).length + 1,
      createdAt: now, updatedAt: now,
    };
    BACKLOG_ITEMS.unshift(newItem as typeof BACKLOG_ITEMS[0]);
    return ok(newItem);
  });

  mock.onPatch(/\/api\/v1\/projects\/.+\/backlog-items\/reorder/).reply(() =>
    noContent()
  );

  mock.onPatch(/\/api\/v1\/projects\/.+\/backlog-items\/bulk/).reply((config) => {
    const body = parse(config);
    let updatedCount = 0;
    (body.itemIds as string[]).forEach((id) => {
      const item = BACKLOG_ITEMS.find(b => b.id === id) as any;
      if (item) {
        if (body.priority) item.priority = body.priority as string;
        if (body.sprintId !== undefined) item.sprintId = body.sprintId === null ? undefined : (body.sprintId as string);
        if (body.assigneeId !== undefined) {
          item.assigneeId = body.assigneeId === null ? undefined : (body.assigneeId as string);
          item.assignee = body.assigneeId === null ? undefined : USERS.find(u => u.id === body.assigneeId);
        }
        updatedCount++;
      }
    });
    return ok({ updatedCount });
  });

  mock.onPost(/\/api\/v1\/backlog-items\/.+\/refine/).reply((config) => {
    const itemId = urlSegment(config, 4);
    return ok({ message: 'Item refined successfully', newId: uuidv4(), originalId: itemId });
  });

  // ── Stories ──────────────────────────────────────────────────────────────────
  mock.onGet(/\/api\/v1\/projects\/.+\/stories/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const items = STORIES.filter(s => s.projectId === projectId);
    return ok(items, paginatedMeta(items.length));
  });

  mock.onGet(/\/api\/v1\/stories\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const story = STORIES.find(s => s.id === id);
    return story ? ok(story) : notFound('Story not found');
  });

  mock.onPost(/\/api\/v1\/projects\/.+\/stories$/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const body = parse(config);
    const now = new Date().toISOString();
    const newStory = { id: `str-${Date.now()}`, projectId, ...body, status: 'TODO', assignee: USERS.find(u => u.id === body.assigneeId) ?? null, createdAt: now, updatedAt: now };
    STORIES.push(newStory as typeof STORIES[0]);
    return ok(newStory);
  });

  mock.onPatch(/\/api\/v1\/stories\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const body = parse(config);
    const idx = STORIES.findIndex(s => s.id === id);
    if (idx === -1) return notFound();
    
    const oldStory = STORIES[idx];
    STORIES[idx] = { ...oldStory, ...body, updatedAt: new Date().toISOString() };
    
    if (body.assigneeId !== undefined && body.assigneeId !== oldStory.assigneeId) {
      if (body.assigneeId) {
        const user = USERS.find(u => u.id === body.assigneeId);
        createNotification('Story Assigned', `Story "${oldStory.title}" has been assigned to ${user?.firstName}.`, 'ASSIGNMENT', oldStory.id, 'stories');
      } else {
        createNotification('Story Unassigned', `Story "${oldStory.title}" has been unassigned.`, 'ASSIGNMENT', oldStory.id, 'stories');
      }
    }
    if (body.status && body.status !== oldStory.status) {
      createNotification('Status Updated', `Story "${oldStory.title}" moved to ${body.status}.`, 'STATUS_CHANGE', oldStory.id, 'stories');
    }

    return ok(STORIES[idx]);
  });

  mock.onPost(/\/api\/v1\/stories\/.+\/status/).reply((config) => {
    const id = urlSegment(config, 4);
    const { status: newStatus } = parse(config);
    const story = STORIES.find(s => s.id === id);
    if (story) {
      const oldStatus = story.status;
      (story as Record<string, unknown>).status = newStatus;
      if (oldStatus !== newStatus) {
        createNotification('Status Updated', `Story "${story.title}" moved to ${newStatus}.`, 'STATUS_CHANGE', story.id, 'stories');
      }
    }
    return story ? ok(story) : notFound();
  });

  mock.onPost(/\/api\/v1\/stories\/.+\/split/).reply((config) => {
    const id = urlSegment(config, 4);
    const parent = STORIES.find(s => s.id === id);
    const { children: childDefs } = parse(config) as { children: { title: string }[] };
    if (!parent) return notFound();
    const now = new Date().toISOString();
    const childStories = childDefs.map(c => ({
      id: `str-child-${Date.now()}-${Math.random()}`,
      projectId: parent.projectId,
      epicId: parent.epicId,
      sprintId: null,
      parentStoryId: parent.id,
      title: c.title,
      asA: '', iWant: '', soThat: '',
      acceptanceCriteria: [],
      priority: parent.priority,
      status: 'TODO' as const,
      assigneeId: null, assignee: null,
      createdAt: now, updatedAt: now,
    }));
    childStories.forEach(c => STORIES.unshift(c as typeof STORIES[0]));
    const updatedParent = { ...parent, childStories, updatedAt: now };
    const idx = STORIES.findIndex(s => s.id === id);
    if (idx !== -1) STORIES[idx] = updatedParent as typeof STORIES[0];
    return ok({ parentStory: updatedParent, childStories });
  });

  // ── Tasks ───────────────────────────────────────────────────────────────────
  mock.onGet(/\/api\/v1\/projects\/.+\/tasks/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const items = TASKS.filter(s => s.projectId === projectId);
    return ok(items, paginatedMeta(items.length));
  });

  mock.onGet(/\/api\/v1\/tasks\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const task = TASKS.find(s => s.id === id);
    return task ? ok(task) : notFound('Task not found');
  });

  mock.onPost(/\/api\/v1\/projects\/.+\/tasks$/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const body = parse(config);
    const now = new Date().toISOString();
    const newTask = { id: `tsk-${Date.now()}`, projectId, ...body, status: 'TODO', assignee: USERS.find(u => u.id === body.assigneeId) ?? null, createdAt: now, updatedAt: now };
    TASKS.push(newTask as typeof TASKS[0]);
    return ok(newTask);
  });

  mock.onPatch(/\/api\/v1\/tasks\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const body = parse(config);
    const idx = TASKS.findIndex(s => s.id === id);
    if (idx === -1) return notFound();
    
    const oldTask = TASKS[idx];
    TASKS[idx] = { ...oldTask, ...body, updatedAt: new Date().toISOString() };

    if (body.assigneeId !== undefined && body.assigneeId !== oldTask.assigneeId) {
      if (body.assigneeId) {
        const user = USERS.find(u => u.id === body.assigneeId);
        createNotification('Task Assigned', `Task "${oldTask.title}" has been assigned to ${user?.firstName}.`, 'ASSIGNMENT', oldTask.id, 'tasks');
      } else {
        createNotification('Task Unassigned', `Task "${oldTask.title}" has been unassigned.`, 'ASSIGNMENT', oldTask.id, 'tasks');
      }
    }
    if (body.status && body.status !== oldTask.status) {
      createNotification('Status Updated', `Task "${oldTask.title}" moved to ${body.status}.`, 'STATUS_CHANGE', oldTask.id, 'tasks');
    }

    return ok(TASKS[idx]);
  });

  mock.onPost(/\/api\/v1\/tasks\/.+\/status/).reply((config) => {
    const id = urlSegment(config, 4);
    const { status: newStatus } = parse(config);
    const task = TASKS.find(s => s.id === id);
    if (task) {
      const oldStatus = task.status;
      (task as Record<string, unknown>).status = newStatus;
      if (oldStatus !== newStatus) {
        createNotification('Status Updated', `Task "${task.title}" moved to ${newStatus}.`, 'STATUS_CHANGE', task.id, 'tasks');
      }
    }
    return task ? ok(task) : notFound();
  });

  // ── Bugs ────────────────────────────────────────────────────────────────────
  mock.onGet(/\/api\/v1\/projects\/.+\/bugs/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const items = BUGS.filter(s => s.projectId === projectId);
    return ok(items, paginatedMeta(items.length));
  });

  mock.onGet(/\/api\/v1\/bugs\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const bug = BUGS.find(s => s.id === id) as any;
    if (bug && bug.parentId && bug.parentType && !bug.parent) {
      if (bug.parentType === 'EPIC') {
        const epic = EPICS.find(e => e.id === bug.parentId);
        if (epic) bug.parent = { id: epic.id, title: epic.name, type: 'EPIC' };
      } else if (bug.parentType === 'STORY') {
        const story = STORIES.find(s => s.id === bug.parentId);
        if (story) bug.parent = { id: story.id, title: story.title, type: 'STORY' };
      } else if (bug.parentType === 'TASK') {
        const task = TASKS.find(t => t.id === bug.parentId);
        if (task) bug.parent = { id: task.id, title: task.title, type: 'TASK' };
      }
    }
    return bug ? ok(bug) : notFound('Bug not found');
  });

  mock.onPost(/\/api\/v1\/projects\/.+\/bugs$/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const body = parse(config);
    const now = new Date().toISOString();
    const newBug = { id: `bug-${Date.now()}`, projectId, ...body, status: 'TODO', reporterId: 'usr-001', reporter: USERS[0], assignee: USERS.find(u => u.id === body.assigneeId) ?? null, createdAt: now, updatedAt: now };
    BUGS.push(newBug as any);
    return ok(newBug);
  });

  mock.onPatch(/\/api\/v1\/bugs\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const body = parse(config);
    const idx = BUGS.findIndex(s => s.id === id);
    if (idx === -1) return notFound();

    const oldBug = BUGS[idx];
    BUGS[idx] = { ...oldBug, ...body, updatedAt: new Date().toISOString() };

    if (body.assigneeId !== undefined && body.assigneeId !== oldBug.assigneeId) {
      if (body.assigneeId) {
        const user = USERS.find(u => u.id === body.assigneeId);
        createNotification('Bug Assigned', `Bug "${oldBug.title}" has been assigned to ${user?.firstName}.`, 'ASSIGNMENT', oldBug.id, 'bugs');
      } else {
        createNotification('Bug Unassigned', `Bug "${oldBug.title}" has been unassigned.`, 'ASSIGNMENT', oldBug.id, 'bugs');
      }
    }
    if (body.status && body.status !== oldBug.status) {
      createNotification('Status Updated', `Bug "${oldBug.title}" moved to ${body.status}.`, 'STATUS_CHANGE', oldBug.id, 'bugs');
    }

    return ok(BUGS[idx]);
  });

  mock.onPost(/\/api\/v1\/bugs\/.+\/transition/).reply((config) => {
    const id = urlSegment(config, 4);
    const { action } = parse(config);
    const bug = BUGS.find(s => s.id === id);
    if (!bug) return notFound();
    
    let nextStatus = bug.status;
    if (action === 'TRIAGE') nextStatus = 'TRIAGE';
    if (action === 'START') nextStatus = 'IN_PROGRESS';
    if (action === 'FIX') nextStatus = 'IN_REVIEW';
    if (action === 'VERIFY') nextStatus = 'DONE';
    if (action === 'REJECT') nextStatus = 'IN_PROGRESS';
    if (action === 'REOPEN') nextStatus = 'IN_PROGRESS';
    
    if (bug.status !== nextStatus) {
      createNotification('Status Updated', `Bug "${bug.title}" moved to ${nextStatus}.`, 'STATUS_CHANGE', bug.id, 'bugs');
    }

    (bug as Record<string, unknown>).status = nextStatus;
    return ok(bug);
  });

  // ── Comments ────────────────────────────────────────────────────────────────
  mock.onGet(/\/api\/v1\/(tasks|bugs|stories)\/.+\/comments/).reply((config) => {
    const parts = config.url?.split('/') || [];
    const parentType = parts[3];
    const parentId = parts[4];
    const key = `${parentType}-${parentId}`;
    const items = COMMENTS[key] || [];
    return ok(items, paginatedMeta(items.length));
  });

  mock.onPost(/\/api\/v1\/(tasks|bugs|stories)\/.+\/comments/).reply((config) => {
    const parts = config.url?.split('/') || [];
    const parentType = parts[3];
    const parentId = parts[4];
    const key = `${parentType}-${parentId}`;
    const body = parse(config);
    
    const newComment = {
      id: `comment-${Date.now()}`,
      body: body.body,
      authorId: 'usr-001',
      author: USERS[0],
      createdAt: new Date().toISOString()
    };
    
    if (!COMMENTS[key]) COMMENTS[key] = [];
    COMMENTS[key].push(newComment);

    createNotification('New Comment', `Someone commented on your ${parentType.slice(0, -1)}.`, 'COMMENT', parentId, parentType as any);

    if (body.mentions && Array.isArray(body.mentions) && body.mentions.includes('usr-001')) {
      createNotification('You were mentioned', `You were mentioned in a comment on a ${parentType.slice(0, -1)}.`, 'MENTION', parentId, parentType as any);
    }

    return ok(newComment);
  });

  // ── Subtasks ────────────────────────────────────────────────────────────────
  mock.onGet(/\/api\/v1\/(stories|tasks|bugs)\/.+\/subtasks/).reply((config) => {
    const parts = config.url?.split('/') ?? [];
    // URL shape: /api/v1/{parentType}/{parentId}/subtasks
    const parentType = parts[3]; // 'stories' | 'tasks' | 'bugs'
    const parentId   = parts[4];
    const items = SUBTASKS.filter(s => s.parentId === parentId && s.parentType?.toLowerCase() === parentType.slice(0, -1).toLowerCase()
      || s.parentId === parentId);
    return ok(items, paginatedMeta(items.length));
  });


  mock.onPost(/\/api\/v1\/subtasks$/).reply((config) => {
    const body = parse(config);
    const now = new Date().toISOString();
    const newSubtask = {
      id: `st-${Date.now()}`,
      ...body,
      status: body.status ?? 'TODO',
      childItemType: body.childItemType ?? 'SUBTASK',
      assignee: USERS.find(u => u.id === body.assigneeId) ?? null,
      createdAt: now,
      updatedAt: now,
    };
    SUBTASKS.push(newSubtask);
    return ok(newSubtask);
  });

  mock.onPatch(/\/api\/v1\/subtasks\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const body = parse(config);
    const idx = SUBTASKS.findIndex(s => s.id === id);
    if (idx === -1) return notFound();
    SUBTASKS[idx] = { ...SUBTASKS[idx], ...body, updatedAt: new Date().toISOString() };
    if (body.assigneeId !== undefined) {
      SUBTASKS[idx].assignee = body.assigneeId
        ? USERS.find(u => u.id === body.assigneeId) ?? null
        : null;
    }
    return ok(SUBTASKS[idx]);
  });

  // ── Sprints ──────────────────────────────────────────────────────────────────
  mock.onGet(/\/api\/v1\/projects\/.+\/sprints/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const items = SPRINTS.filter(s => s.projectId === projectId);
    return ok(items);
  });

  mock.onPost(/\/api\/v1\/projects\/.+\/sprints/).reply((config) => {
    const projectId = urlSegment(config, 4);
    const body = parse(config);
    const now = new Date().toISOString();
    const assignee = body.assigneeId ? USERS.find(u => u.id === body.assigneeId) : null;
    const newSprint = {
      id: `sprint-${Date.now()}`,
      projectId,
      ...body,
      assignee: assignee ? { id: assignee.id, firstName: assignee.firstName, lastName: assignee.lastName } : undefined,
      status: 'PLANNED',
      createdAt: now,
      updatedAt: now,
    };
    SPRINTS.push(newSprint as any);
    return ok(newSprint);
  });

  mock.onPatch(/\/api\/v1\/sprints\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const body = parse(config);
    const idx = SPRINTS.findIndex(s => s.id === id);
    if (idx === -1) return notFound();
    const assignee = body.assigneeId ? USERS.find(u => u.id === body.assigneeId) : null;
    const updatedFields: any = { ...body };
    if (body.assigneeId !== undefined) {
      updatedFields.assignee = assignee ? { id: assignee.id, firstName: assignee.firstName, lastName: assignee.lastName } : null;
    }
    SPRINTS[idx] = { ...SPRINTS[idx], ...updatedFields, updatedAt: new Date().toISOString() };
    return ok(SPRINTS[idx]);
  });

  mock.onPost(/\/api\/v1\/sprints\/.+\/start/).reply((config) => {
    const id = urlSegment(config, 4);
    const idx = SPRINTS.findIndex(s => s.id === id);
    if (idx === -1) return notFound();
    SPRINTS[idx].status = 'ACTIVE';
    SPRINTS[idx].updatedAt = new Date().toISOString();
    return ok(SPRINTS[idx]);
  });


  console.info('[MockAPI] 🟢 Active — all API requests are intercepted with mock data.');
  return mock;
}
