import { useNavigate } from "react-router";
import {
  type TaskOut,
} from "../../shared-types/tasks";
import {
  type ProjectRole,
} from "../../shared-types/projects";
type Props = {
  task: TaskOut;
  projectId: number;
  role: ProjectRole | null;
  onDeleteClick: (task: TaskOut) => void;
};

export default function TaskRowCard({
  task,
  projectId,
  role,
  onDeleteClick,
}: Props) {
  const navigate = useNavigate();

  const PRIORITY = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  } as const;

  // Role-based permissions
  const canEdit =
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "MEMBER";

  const canDelete =
    role === "OWNER" ||
    role === "ADMIN";


  // Priority badge styling
  const priorityClass =
    task.priority === PRIORITY.HIGH
      ? "bg-danger"
      : task.priority === PRIORITY.MEDIUM
        ? "bg-warning text-dark"
        : "bg-info text-dark";

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">

        <div className="row align-items-center">

          {/* LEFT SIDE */}
          <div className="col-md-6">

            <div className="d-flex align-items-center gap-2 flex-wrap">

              <h5 className="mb-0">{task.title}</h5>

              <span className="badge bg-secondary">
                {task.status}
              </span>

              <span className={`badge ${priorityClass}`}>
                {task.priority}
              </span>

            </div>

            {task.description && (
              <div className="text-muted small mt-1">
                {task.description.length > 120
                  ? task.description.slice(0, 120) + "..."
                  : task.description}
              </div>
            )}

          </div>

          {/* RIGHT SIDE */}
          <div className="col-md-6 text-md-end mt-3 mt-md-0">

            <div className="d-flex justify-content-md-end gap-2 flex-wrap">

              {/* Details */}
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() =>
                  navigate(`/projects/${projectId}/tasks/${task.id}`)
                }
              >
                Details
              </button>

              {/* Edit */}
              {canEdit && (
                <button
                  className="btn btn-outline-dark btn-sm"
                  onClick={() =>
                    navigate(`/projects/${projectId}/tasks/${task.id}/edit`)
                  }
                >
                  Edit
                </button>
              )}

              {/* Delete */}
              {canDelete && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onDeleteClick(task)}
                >
                  Delete
                </button>
              )}

            </div>

          </div>
        </div>

        {/* Footer meta */}
        <div className="d-flex justify-content-between text-muted small mt-3">
          <div>
            Due:{" "}
            {task.due_date
              ? new Date(task.due_date).toLocaleDateString()
              : "—"}
          </div>

          <div>
            Assigned: {task.assigned_to ?? "—"}
          </div>
        </div>

      </div>
    </div>
  );
}