import api from "../axios";
import { PROJECTS_BASE_PATH } from "../../constants/projects";
import {
    type Project,
    type ProjectWithRole,
    type ProjectMember,
    type ProjectMemberCreatePayload,
    type ProjectMemberRoleUpdatePayload,

} from "../../shared-types/projects";



export async function get_projects(): Promise<ProjectWithRole[]> {

    const response = await api.get(PROJECTS_BASE_PATH)
    return response.data

}


export async function get_project_by_id(id: number): Promise<Project> {

    const response = await api.get(`${PROJECTS_BASE_PATH}/${id}`)
    return response.data

}

export async function create_project(name: string): Promise<ProjectWithRole> {
    const payload = { name };
    const response = await api.post(PROJECTS_BASE_PATH, payload);
    return response.data

}

export async function update_project(id: number, name: string): Promise<Project> {
    const payload = { name };
    const response = await api.patch(`${PROJECTS_BASE_PATH}/${id}`, payload);
    return response.data

}

export async function delete_project_by_id(id: number): Promise<void> {

    await api.delete(`${PROJECTS_BASE_PATH}/${id}`);
    // return response.data

}


export async function get_project_members(
    projectId: number
): Promise<ProjectMember[]> {
    const response = await api.get(`${PROJECTS_BASE_PATH}/${projectId}/members`);
    return response.data;
}

export async function add_project_member(
    projectId: number,
    payload: ProjectMemberCreatePayload
): Promise<ProjectMember> {
    const response = await api.post(`${PROJECTS_BASE_PATH}/${projectId}/members`, payload);
    return response.data;
}

export async function update_project_member_role(
    projectId: number,
    memberUserId: number,
    payload: ProjectMemberRoleUpdatePayload
): Promise<ProjectMember> {
    const response = await api.patch(
        `${PROJECTS_BASE_PATH}/${projectId}/members/${memberUserId}`,
        payload
    );
    return response.data;
}

export async function remove_project_member(
    projectId: number,
    memberUserId: number
): Promise<void> {
    await api.delete(`${PROJECTS_BASE_PATH}/${projectId}/members/${memberUserId}`);
}