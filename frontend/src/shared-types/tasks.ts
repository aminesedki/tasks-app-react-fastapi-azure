import { type ProjectRole } from "./projects";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = 1 | 2 | 3 | 4;

export type TagOut = {
    id: number;
    name: string;
};

export type TaskOut = {
    id: number;
    project_id: number;
    title: string;
    description?: string | null;
    due_date?: string | null;        // ISO string from API
    assigned_to?: number | null;
    created_by: number;

    status: TaskStatus;
    priority: TaskPriority;

    created_at: string;              // ISO string
    updated_at?: string | null;       // ISO string

};

export type TaskListResponse = {
    role: ProjectRole;
    items: TaskOut[];
};

export type TaskCreatePayload = {
    title: string;
    description?: string | null;
    due_date?: string | null;
    assigned_to?: number | null;
    status?: TaskStatus;             // optional if backend defaults
    priority?: TaskPriority;         // optional if backend defaults
};

export type TaskUpdatePayload = {
    title?: string;
    description?: string | null;
    due_date?: string | null;
    assigned_to?: number | null;
    status?: TaskStatus;
    priority?: TaskPriority;
};