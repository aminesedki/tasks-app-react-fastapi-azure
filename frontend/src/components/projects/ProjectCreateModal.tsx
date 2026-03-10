import { useRef, useState } from "react";
import { type ProjectWithRole } from "../../shared-types/projects";
type Props = {
    modalId: string;          // WITHOUT '#'
    onCreated: (name: string) => Promise<ProjectWithRole | null>;
    onCancel: () => void
};

export default function ProjectMembersModal({ modalId, onCreated, onCancel }: Props) {
    const modalRef = useRef<HTMLDivElement | null>(null);

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleCancel = () => {

        onCancel()
        setName("")

    }
    async function handleSubmit() {
        const trimmed = name.trim();
        if (trimmed.length < 3) {
            setError("Project name must be at least 3 characters.");
            return;
        }

        setLoading(true);
        setError("");

        // reset form immediately
        setName("");

        // add poject to projects list 
        await onCreated(trimmed)

        setLoading(false);

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
                        <h5 className="modal-title">Create Project</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" />
                    </div>

                    <div className="modal-body">
                        {error && <div className="alert alert-danger py-2">{error}</div>}

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
                        <button className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                            Cancel
                        </button>
                        <button className="btn btn-dark" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}