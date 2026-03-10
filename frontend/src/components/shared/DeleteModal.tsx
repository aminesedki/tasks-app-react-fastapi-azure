import { useEffect, useRef, useState } from "react";
type Props = {
    modalId: string; // WITHOUT '#'
    title: string;
    text: string;
    confirmLabel?: string;
    onDelete: () => Promise<void> | void;
    onCancel: () => void;

};

export default function DeleteModal({
    modalId,
    title,
    text,
    confirmLabel = "Delete",
    onDelete,
    onCancel
}: Props) {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const el = document.getElementById(modalId)
        if (!el) return;

        const handleHidden = () => {
            setError("");
            setLoading(false);
            onCancel();
        };

        el.addEventListener("hidden.bs.modal", handleHidden);
        return () => el.removeEventListener("hidden.bs.modal", handleHidden);
    }, [onCancel]);

    const handleConfirm = async () => {
        setLoading(true);
        setError("");

        try {
            await onDelete();
        } catch (e: any) {
            setError(e?.message || "Delete failed. Please try again.");
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
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" />
                    </div>

                    <div className="modal-body">
                        <div className="text-muted">{text}</div>

                        {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
                            Cancel
                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={handleConfirm}
                            disabled={loading}>
                            {loading ? "Deleting..." : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}