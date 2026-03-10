import { useEffect, useState } from "react";
import {
    add_project_member,
    get_project_members,
    remove_project_member,
    update_project_member_role,
} from "../../api/services/projects";
import { search_users_by_email } from "../../api/services/users";
import {
    type ProjectMember,
    type ProjectRole,
    type UserSearchResult,
} from "../../shared-types/projects";
import { toast } from "react-toastify";

type Props = {
    modalId: string;
    projectId: number;
    projectName: string;
    projectRole: ProjectRole | null;
    onCancel: () => void;
};

const ROLE_OPTIONS: ProjectRole[] = ["ADMIN", "MEMBER", "VIEWER"];

export default function ProjectMembersModal({
    modalId,
    projectId,
    projectName,
    projectRole,
    onCancel,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [membersFilter, setMembersFilter] = useState("");

    const [userSearch, setUserSearch] = useState("");
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);

    const [roleSelections, setRoleSelections] = useState<Record<number, ProjectRole>>({});
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [error, setError] = useState("");

    const canManageMembers = projectRole === "OWNER" || projectRole === "ADMIN";

    const canAssignRole = (role: ProjectRole) => {
        if (projectRole === "OWNER") {
            return role === "ADMIN" || role === "MEMBER" || role === "VIEWER";
        }

        if (projectRole === "ADMIN") {
            return role === "MEMBER" || role === "VIEWER";
        }

        return false;
    };

    const canEditTarget = (targetRole: ProjectRole) => {
        if (projectRole === "OWNER") return targetRole !== "OWNER";
        if (projectRole === "ADMIN") {
            return targetRole === "MEMBER" || targetRole === "VIEWER";
        }
        return false;
    };

    const getSelectedRole = (userId: number): ProjectRole =>
        roleSelections[userId] ?? "MEMBER";

    const setSelectedRoleForUser = (userId: number, role: ProjectRole) => {
        setRoleSelections((prev) => ({
            ...prev,
            [userId]: role,
        }));
    };

    useEffect(() => {
        const el = document.getElementById(modalId);
        if (!el) return;

        const handleHidden = () => {
            setMembers([]);
            setMembersFilter("");
            setUserSearch("");
            setSearchResults([]);
            setRoleSelections({});
            setLoading(false);
            setActionLoading(null);
            setError("");
            onCancel();
        };

        el.addEventListener("hidden.bs.modal", handleHidden);
        return () => el.removeEventListener("hidden.bs.modal", handleHidden);
    }, [modalId, onCancel]);

    useEffect(() => {
        if (!projectId) return;

        (async () => {
            try {
                setLoading(true);
                setError("");
                const data = await get_project_members(projectId);
                setMembers(data);
            } catch {
                setError("Failed to load members.");
            } finally {
                setLoading(false);
            }
        })();
    }, [projectId]);

    useEffect(() => {
        const q = userSearch.trim();

        const timer = setTimeout(async () => {
            try {
                setSearchingUsers(true);
                setError("");

                const results = await search_users_by_email(q || undefined);
                setSearchResults(results);
            } catch {
                setError("Failed to search users.");
            } finally {
                setSearchingUsers(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [userSearch]);

    const filteredMembers = members.filter((m) =>
        m.email.toLowerCase().includes(membersFilter.toLowerCase())
    );

    const nonMembers = searchResults.filter(
        (user) => !members.some((member) => member.user_id === user.id)
    );

    const handleAddMember = async (user: UserSearchResult) => {
        const role = getSelectedRole(user.id);

        try {
            setActionLoading(user.id);
            setError("");

            const created = await add_project_member(projectId, {
                email: user.email,
                role,
            });

            setMembers((prev) => [...prev, created]);
            toast.success("Member added successfully");
        } catch (e: any) {
            const detail = e?.response?.data?.detail;
            setError(detail || "Failed to add member.");
            toast.error(detail || "Failed to add member.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateRole = async (memberUserId: number, nextRole: ProjectRole) => {
        try {
            setActionLoading(memberUserId);
            setError("");

            const updated = await update_project_member_role(projectId, memberUserId, {
                role: nextRole,
            });

            setMembers((prev) =>
                prev.map((m) => (m.user_id === memberUserId ? updated : m))
            );

            toast.success("Member role updated");
        } catch (e: any) {
            const detail = e?.response?.data?.detail;
            setError(detail || "Failed to update role.");
            toast.error(detail || "Failed to update role.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveMember = async (memberUserId: number) => {
        try {
            setActionLoading(memberUserId);
            setError("");

            await remove_project_member(projectId, memberUserId);

            setMembers((prev) => prev.filter((m) => m.user_id !== memberUserId));
            toast.success("Member removed");
        } catch (e: any) {
            const detail = e?.response?.data?.detail;
            setError(detail || "Failed to remove member.");
            toast.error(detail || "Failed to remove member.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="modal fade" id={modalId} tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title mb-0">Project Members ({projectRole})</h5>
                            <div className="small text-muted">{projectName}</div>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" />
                    </div>

                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {canManageMembers && (
                            <div className="card shadow-sm mb-4">
                                <div className="card-body">
                                    <h6 className="mb-3">Add members</h6>

                                    <div className="mb-3">
                                        <input
                                            className="form-control"
                                            placeholder="Search users by email"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                        />
                                    </div>

                                    {searchingUsers && (
                                        <div className="small text-muted">Searching users...</div>
                                    )}

                                    {!searchingUsers && nonMembers.length === 0 && (
                                        <div className="small text-muted">No users available to add.</div>
                                    )}

                                    <div className="d-flex flex-column gap-2">
                                        {nonMembers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="border rounded p-2 d-flex justify-content-between align-items-center gap-3"
                                            >
                                                <div className="flex-grow-1">{user.email}</div>

                                                <div style={{ width: 160 }}>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={getSelectedRole(user.id)}
                                                        onChange={(e) =>
                                                            setSelectedRoleForUser(user.id, e.target.value as ProjectRole)
                                                        }
                                                    >
                                                        {ROLE_OPTIONS.filter(canAssignRole).map((role) => (
                                                            <option key={role} value={role}>
                                                                {role}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <button
                                                    className="btn btn-sm btn-dark"
                                                    onClick={() => handleAddMember(user)}
                                                    disabled={actionLoading === user.id}
                                                >
                                                    {actionLoading === user.id ? "Adding..." : "Add"}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0">Current members</h6>
                                    <div style={{ maxWidth: 320, width: "100%" }}>
                                        <input
                                            className="form-control form-control-sm"
                                            placeholder="Filter members by email"
                                            value={membersFilter}
                                            onChange={(e) => setMembersFilter(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="text-muted small">Loading members...</div>
                                ) : filteredMembers.length === 0 ? (
                                    <div className="text-muted small">No members found.</div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Email</th>
                                                    <th style={{ width: 180 }}>Role</th>
                                                    <th style={{ width: 160 }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredMembers.map((member) => (
                                                    <tr key={member.user_id}>
                                                        <td>{member.email}</td>
                                                        <td>
                                                            {canEditTarget(member.role) ? (
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={member.role}
                                                                    onChange={(e) =>
                                                                        handleUpdateRole(
                                                                            member.user_id,
                                                                            e.target.value as ProjectRole
                                                                        )
                                                                    }
                                                                    disabled={actionLoading === member.user_id}
                                                                >
                                                                    {ROLE_OPTIONS.filter(canAssignRole).map((role) => (
                                                                        <option key={role} value={role}>
                                                                            {role}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <span className="badge bg-secondary">{member.role}</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {canEditTarget(member.role) ? (
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleRemoveMember(member.user_id)}
                                                                    disabled={actionLoading === member.user_id}
                                                                >
                                                                    {actionLoading === member.user_id ? "Working..." : "Remove"}
                                                                </button>
                                                            ) : (
                                                                <span className="text-muted small">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-outline-secondary" data-bs-dismiss="modal">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}