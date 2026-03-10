export type Project = {
    id: number;
    name: string;
    owner_id: number;
    created_at: string; // ISO date string
};

export type ProjectRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export type ProjectCreate = {

    name: string;
}


export type ProjectWithRole = {
    id: number;
    name: string;
    owner_id: number;
    role: ProjectRole;
    created_at: string; // ISO date string
};


export type ProjectMember = {
    user_id: number;
    email: string;
    role: ProjectRole;
};

export type ProjectMemberCreatePayload = {
    email: string;
    role: ProjectRole;
};

export type ProjectMemberRoleUpdatePayload = {
    role: ProjectRole;
};

export type UserSearchResult = {
    id: number;
    email: string;
};