import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
    get_project_task_by_id,
    update_project_task,
} from "../api/services/tasks";
import { type TaskOut, type TaskStatus, type TaskPriority } from "../shared-types/tasks";

export default function TaskEditPage() {
    const navigate = useNavigate();
    const { projectId, taskId } = useParams();

    const pid = Number(projectId);
    const tid = Number(taskId);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [task, setTask] = useState<TaskOut | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TaskStatus>("TODO");
    const [priority, setPriority] = useState<TaskPriority>(2); // MEDIUM
    const [dueDate, setDueDate] = useState<string>(""); // yyyy-mm-dd
    const [assignedTo, setAssignedTo] = useState<string>(""); // keep string for input

    useEffect(() => {
        if (!pid || !tid || Number.isNaN(pid) || Number.isNaN(tid)) {
            navigate("/projects");
            return;
        }

        (async () => {
            setLoading(true);
            setError("");

            try {
                const t = await get_project_task_by_id(pid, tid);
                setTask(t);

                // hydrate form from task
                setTitle(t.title ?? "");
                setDescription(t.description ?? "");
                setStatus(t.status);
                setPriority(t.priority);
                setDueDate(t.due_date ? t.due_date.slice(0, 10) : ""); // ISO -> yyyy-mm-dd
                setAssignedTo(t.assigned_to ? String(t.assigned_to) : "");

                // TODO: load tags list for this project


            } catch (e: any) {
                setError(e?.response?.data?.detail || "Failed to load task.");
            } finally {
                setLoading(false);
            }
        })();
    }, [pid, tid, navigate]);



    const handleSave = async () => {
        if (title.trim().length < 3) {
            setError("Title must be at least 3 characters.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload = {
                title: title.trim(),
                description: description || null,
                status,
                priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                assigned_to: assignedTo ? Number(assignedTo) : null
            };

            const updated = await update_project_task(pid, tid, payload);
            setTask(updated);

            // go back to project tasks list or task detail
            navigate(`/projects/${pid}/tasks`); // adjust to your page
        } catch (e: any) {
            setError(e?.response?.data?.detail || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="container my-4 text-muted">Loading...</div>;
    }

    if (error && !task) {
        return (
            <div className="container my-4">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
        );
    }

    return (
        <div className="container my-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h3 className="mb-0">Edit Task</h3>
                    <div className="text-muted small">Project #{pid} • Task #{tid}</div>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => navigate(-1)} disabled={saving}>
                        Cancel
                    </button>
                    <button className="btn btn-dark" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-body">
                    {/* Title */}
                    <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="row">
                        {/* Status */}
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                            >
                                <option value="TODO">TODO</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="DONE">DONE</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Priority</label>
                            <select
                                className="form-select"
                                value={priority}
                                onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
                            >
                                <option value={1}>LOW</option>
                                <option value={2}>MEDIUM</option>
                                <option value={3}>HIGH</option>
                                <option value={4}>URGENT</option>
                            </select>
                        </div>

                        {/* Due date */}
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Due Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Assigned to */}
                    <div className="mb-3">
                        <label className="form-label">Assigned to (user id)</label>
                        <input
                            className="form-control"
                            inputMode="numeric"
                            placeholder="Optional user id"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        />
                        <div className="form-text">
                            Later you can replace this with a members dropdown.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}