import { useNavigate } from "react-router";
import { type ProjectWithRole } from "../../shared-types/projects"

type Props = {
  project: ProjectWithRole
  onDelete: (project: ProjectWithRole) => void
  onEdit: (project: ProjectWithRole) => void
  onMembers: (project: ProjectWithRole) => void;
}


export default function ProjectRowCard({ project, onDelete, onEdit, onMembers }: Props) {


  const roleBadgeClass = {
    OWNER: "bg-dark",
    ADMIN: "bg-primary",
    MEMBER: "bg-info text-dark",
    VIEWER: "bg-secondary",
  }[project.role]

  const navigate = useNavigate();

  const canManageMembers = project.role === "OWNER" || project.role === "ADMIN";

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">

        {/* Header Row */}
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title mb-1">{project.name}</h5>
            <span className={`badge ${roleBadgeClass}`}>
              {project.role}
            </span>
          </div>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                className="dropdown-item"
                onClick={() => navigate(`/projects/${project.id}/tasks/`)}
              >
                Open
              </button>
            </li>

            {project.role !== "VIEWER" && (
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => onEdit(project)}
                >
                  Edit
                </button>
              </li>
            )}

            {project.role === "OWNER" && (
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => onDelete(project)}
                >
                  Delete
                </button>
              </li>
            )}
            {canManageMembers && (
              <li>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => onMembers(project)}
                >
                  Members
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-3">
          <button
            className="btn btn-sm btn-dark me-2"
            onClick={() => navigate(`/projects/${project.id}/tasks/`)}
          >
            Open
          </button>

          {project.role !== "VIEWER" && (
            <button
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => onEdit(project)}
            >
              Edit
            </button>
          )}

          {project.role === "OWNER" && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(project)}
            >
              Delete
            </button>
          )}
          {canManageMembers && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => onMembers(project)}
            >
              Members
            </button>
          )}
        </div>
      </div>
    </div>
  )
}