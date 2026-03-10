import { useEffect, useRef, useState } from "react";
import { type TaskStatus, type TaskPriority } from "../../shared-types/tasks";

type Props = {
    modalId: string; // WITHOUT '#'
    onCreate: (payload: {
        title: string;
        description?: string;
        status: TaskStatus;
        priority: TaskPriority;
        due_date?: string | null;
        tag_ids?: number[];
    }) => Promise<void>;

    onCancel: () => void;

    availableTags?: { id: number; name: string }[];
};

export default function TaskCreateModal({
    modalId,
    onCreate,
    onCancel
}: Props) {
    const modalRef = useRef<HTMLDivElement | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TaskStatus>("TODO");
    const [priority, setPriority] = useState<TaskPriority>(2); // MEDIUM
    const [dueDate, setDueDate] = useState<string | null>(null);


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Reset state when modal closes
    useEffect(() => {
        const el = document.getElementById(modalId);
        if (!el) return;

        const handleHidden = () => {
            setTitle("");
            setDescription("");
            setStatus("TODO");
            setPriority(2);
            setDueDate(null);
            setError("");
            setLoading(false);
            onCancel();
        };

        el.addEventListener("hidden.bs.modal", handleHidden);
        return () => el.removeEventListener("hidden.bs.modal", handleHidden);
    }, [modalId, onCancel]);

    const handleSubmit = async () => {
        if (title.trim().length < 3) {
            setError("Title must be at least 3 characters.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await onCreate({
                title,
                description,
                status,
                priority,
                due_date: dueDate || null, // dueDate ? new Date(dueDate).toISOString() : null
            });
        } catch (e: any) {
            setError(e?.message || "Failed to create task.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div
            ref={modalRef}
            className="modal fade"
            id={modalId}
            tabIndex={-1}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">Create Task</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" />
                    </div>

                    <div className="modal-body">

                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}

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
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="row">
                            {/* Status */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                >
                                    <option value="TODO">TODO</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="DONE">DONE</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div className="col-md-6 mb-3">
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
                        </div>

                        {/* Due date */}
                        <div className="mb-3">
                            <label className="form-label">Due Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dueDate ?? ""}
                                onChange={(e) => setDueDate(e.target.value || null)}
                            />
                        </div>

                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            className="btn btn-dark"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Task"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}