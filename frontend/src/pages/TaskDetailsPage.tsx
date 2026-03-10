import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
    get_project_task_by_id,
    set_project_task_status,
    set_project_task_priority,
} from "../api/services/tasks";

import { type TaskOut, type TaskStatus, type TaskPriority } from "../shared-types/tasks";

export default function TaskDetailsPage() {
    const navigate = useNavigate();
    const { projectId, taskId } = useParams();

    const pid = Number(projectId);
    const tid = Number(taskId);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [task, setTask] = useState<TaskOut | null>(null);

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingPriority, setUpdatingPriority] = useState(false);

    const dueLabel = useMemo(() => {
        if (!task?.due_date) return "—";
        return new Date(task.due_date).toLocaleDateString();
    }, [task?.due_date]);

    useEffect(() => {
        if (!pid || !tid) {
            navigate("/projects");
            return;
        }

        (async () => {
            setLoading(true);
            setError("");

            try {
                const t = await get_project_task_by_id(pid, tid);
                setTask(t);
            } catch (e: any) {
                setError(e?.response?.data?.detail || "Failed to load task.");
            } finally {
                setLoading(false);
            }
        })();
    }, [pid, tid, navigate]);

    const handleChangeStatus = async (next: TaskStatus) => {
        if (!task || task.status === next) return;

        setUpdatingStatus(true);
        setError("");

        try {
            const updated = await set_project_task_status(pid, tid, next);
            setTask(updated);
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Failed to update status.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleChangePriority = async (next: TaskPriority) => {
        if (!task || task.priority === next) return;

        setUpdatingPriority(true);
        setError("");

        try {
            const updated = await set_project_task_priority(pid, tid, next);
            setTask(updated);
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Failed to update priority.");
        } finally {
            setUpdatingPriority(false);
        }
    };

    if (loading) {
        return <div className="container my-4 text-muted">Loading...</div>;
    }

    if (!task) {
        return (
            <div className="container my-4">
                <div className="alert alert-danger">{error || "Task not found"}</div>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
        );
    }

    return (
        <div className="container my-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h3 className="mb-1">{task.title}</h3>
                    <div className="text-muted small">
                        Project #{pid} • Task #{tid}
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>

                    <button
                        className="btn btn-dark"
                        onClick={() => navigate(`/projects/${pid}/tasks/${tid}/edit`)}
                    >
                        Edit
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">

                {/* LEFT */}
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-body">

                            <h6 className="text-muted mb-2">Description</h6>
                            {task.description ? (
                                <div style={{ whiteSpace: "pre-wrap" }}>
                                    {task.description}
                                </div>
                            ) : (
                                <div className="text-muted">No description</div>
                            )}

                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="col-lg-4">
                    <div className="card shadow-sm mb-3">
                        <div className="card-body">

                            <h6 className="text-muted mb-3">Quick Actions</h6>

                            {/* Status */}
                            <div className="mb-3">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={task.status}
                                    onChange={(e) =>
                                        handleChangeStatus(e.target.value as TaskStatus)
                                    }
                                    disabled={updatingStatus}
                                >
                                    <option value="TODO">TODO</option>
                                    <option value="IN_PROGRESS">IN PROGRESS</option>
                                    <option value="DONE">DONE</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="form-label">Priority</label>
                                <select
                                    className="form-select"
                                    value={task.priority}
                                    onChange={(e) =>
                                        handleChangePriority(Number(e.target.value) as TaskPriority)
                                    }
                                    disabled={updatingPriority}
                                >
                                    <option value={1}>LOW</option>
                                    <option value={2}>MEDIUM</option>
                                    <option value={3}>HIGH</option>
                                    <option value={4}>URGENT</option>
                                </select>

                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h6 className="text-muted mb-3">Info</h6>

                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Due date</span>
                                <span>{dueLabel}</span>
                            </div>

                            <div className="d-flex justify-content-between mt-2">
                                <span className="text-muted">Assigned to</span>
                                <span>{task.assigned_to ?? "—"}</span>
                            </div>

                            <div className="d-flex justify-content-between mt-2">
                                <span className="text-muted">Created at</span>
                                <span>
                                    {new Date(task.created_at).toLocaleString()}
                                </span>
                            </div>

                            {task.updated_at && (
                                <div className="d-flex justify-content-between mt-2">
                                    <span className="text-muted">Updated at</span>
                                    <span>
                                        {new Date(task.updated_at).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}