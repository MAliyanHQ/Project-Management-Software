
export enum Role {
  ADMIN = 'Admin',
  PROJECT_MANAGER = 'Project Manager',
  MEMBER = 'Member',
}

export enum Status {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, never store plain text!
  role: Role;
  fullName: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string[]; // Array of User IDs
  priority: Priority;
  status: Status;
  startDate: string;
  endDate: string;
  comments: Comment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  managerId: string;
  members: string[]; // User IDs
  createdAt: string;
}

export interface Log {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  performedBy: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

// Custom Report Types
export interface CustomColumn {
  id: string;
  name: string;
  width?: number;
}

export interface CustomRow {
  id: string;
  data: Record<string, string>; // Key is column ID, value is cell content
}

export interface CustomReport {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  columns: CustomColumn[];
  rows: CustomRow[];
}

export interface AppState {
  users: User[];
  projects: Project[];
  tasks: Task[];
  currentUser: User | null;
  logs: Log[];
  customReports: CustomReport[];
  announcements: Announcement[];
}
