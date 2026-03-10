import { useEffect, useRef, useState } from "react";
import { type Project } from "../../shared-types/projects";

type Props = {
    modalId: string;          // WITHOUT '#'
    project: Project | null;
    onUpdate: (id: number, name: string) => Promise<Project | null>;
    onCancel: () => void;
};

export default function ProjectEditModal({
    modalId,
    project,
    onUpdate,
    onCancel,
}: Props) {

    const modalRef = useRef<HTMLDivElement | null>(null);

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // When project changes, populate input
    useEffect(() => {
        if (project) {
            setName(project.name);
        }
    }, [project]);

    const handleCancel = () => {
        setError("");
        setName(project?.name ?? "");
        onCancel();
    };

    async function handleSubmit() {
        const trimmed = name.trim();

        if (trimmed.length < 3) {
            setError("Project name must be at least 3 characters.");
            return;
        }

        if (!project) return;

        setLoading(true);
        setError("");

        const updated = await onUpdate(project.id, trimmed);

        setLoading(false);

        if (!updated) {
            setError("Failed to update project.");
        }
    }

    return (
        <div
            ref={modalRef}
            className="modal fade"
            id={modalId}
            tabIndex={-1}
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">Edit Project</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" />
                    </div>

                    <div className="modal-body">

                        {error && (
                            <div className="alert alert-danger py-2">
                                {error}
                            </div>
                        )}

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Project name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />

                    </div>

                    <div className="modal-footer">

                        <button
                            className="btn btn-secondary"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            className="btn btn-dark"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update"}
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}