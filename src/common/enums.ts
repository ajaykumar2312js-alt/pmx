export enum WorkItemType {
  EPIC = 'EPIC',
  STORY = 'STORY',
  TASK = 'TASK',
  BUG = 'BUG',
}

/** Built-in child item types available when creating a child under any work item. */
export enum ChildItemType {
  SUBTASK = 'SUBTASK',
  STORY   = 'STORY',
  TASK    = 'TASK',
  BUG     = 'BUG',
  CUSTOM  = 'CUSTOM',
}


export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum Role {
  VIEWER = 'viewer',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  DEVOPS = 'devops',
  SCRUM_MASTER = 'scrum_master',
  PO = 'po',
  ADMIN = 'admin',
}

export enum SprintStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export enum DeploymentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
