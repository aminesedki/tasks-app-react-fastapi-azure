import api from "../axios";
import { PROJECTS_BASE_PATH } from "../../constants/projects"; // reuse yours
import {
    type TaskOut,
    type TaskCreatePayload,
    type TaskUpdatePayload,
    type TaskStatus,
    type TaskPriority,
    type TaskListResponse
} from "../../shared-types/tasks";

// GET /api/v1/projects/{project_id}/tasks
export async function get_project_tasks(
    projectId: number,
    params?: {
        status?: TaskStatus;
        priority?: TaskPriority;
        assigned_to?: number;
        tag_id?: number;
        search?: string;
        limit?: number;
        offset?: number;
    }
): Promise<TaskListResponse> {
    const response = await api.get(`${PROJECTS_BASE_PATH}/${projectId}/tasks`, { params });
    return response.data;
}

// GET /api/v1/projects/{project_id}/tasks/{task_id}
export async function get_project_task_by_id(
    projectId: number,
    taskId: number
): Promise<TaskOut> {
    const response = await api.get(`${PROJECTS_BASE_PATH}/${projectId}/tasks/${taskId}`);
    return response.data;
}

// POST /api/v1/projects/{project_id}/tasks
export async function create_project_task(
    projectId: number,
    payload: TaskCreatePayload
): Promise<TaskOut> {
    const response = await api.post(`${PROJECTS_BASE_PATH}/${projectId}/tasks`, payload);
    return response.data;
}

// PATCH /api/v1/projects/{project_id}/tasks/{task_id}
export async function update_project_task(
    projectId: number,
    taskId: number,
    payload: TaskUpdatePayload
): Promise<TaskOut> {
    const response = await api.patch(`${PROJECTS_BASE_PATH}/${projectId}/tasks/${taskId}`, payload);
    return response.data;
}

// PATCH /api/v1/projects/{project_id}/tasks/{task_id}/status
export async function set_project_task_status(
    projectId: number,
    taskId: number,
    status: TaskStatus
): Promise<TaskOut> {
    const response = await api.patch(
        `${PROJECTS_BASE_PATH}/${projectId}/tasks/${taskId}/status`,
        { status }
    );

    return response.data;
}
// PATCH /api/v1/projects/{project_id}/tasks/{task_id}/priority
export async function set_project_task_priority(
    projectId: number,
    taskId: number,
    priority: TaskPriority
): Promise<TaskOut> {
    const response = await api.patch(
        `${PROJECTS_BASE_PATH}/${projectId}/tasks/${taskId}/priority`,
        { priority }
    );

    return response.data;
}

// DELETE /api/v1/projects/{project_id}/tasks/{task_id}
export async function delete_project_task_by_id(
    projectId: number,
    taskId: number
): Promise<void> {
    await api.delete(`${PROJECTS_BASE_PATH}/${projectId}/tasks/${taskId}`);
}