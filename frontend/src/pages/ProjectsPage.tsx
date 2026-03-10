import { useState, useEffect } from "react"
import ProjectCreateModal from "../components/projects/ProjectCreateModal"
import ProjectRowCard from "../components/projects/ProjectRowCard";
import DeleteProjectModal from "../components/projects/ProjectDeleteModal";
import ProjectEditModal from "../components/projects/ProjectEditModal";
import ProjectMembersModal from "../components/projects/ProjectMembersModal";
import { get_projects, delete_project_by_id, create_project, update_project } from "../api/services/projects";
import { type ProjectWithRole, type Project } from "../shared-types/projects";

import Modal from "bootstrap/js/dist/modal";
import { toast } from "react-toastify";

const ProjectsPage = () => {
    const [projects, setProjects] = useState<ProjectWithRole[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<ProjectWithRole | null>(null);
    const [membersTarget, setMembersTarget] = useState<ProjectWithRole | null>(null);
    const [editTarget, setEditTarget] = useState<ProjectWithRole | null>(null);

    const createModalId = "createProjectModal"
    const deleteModalId = "deleteProjectModal"
    const membersModalId = "projectMembersModal";
    const editModalId = "editProjectModal";

    // modal commun functions
    const openModal = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        Modal.getOrCreateInstance(el).show();
    }

    const closeModal = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        Modal.getOrCreateInstance(el).hide();
    }

    // handle create action at modal creation level
    const onCreated = async (name: string): Promise<ProjectWithRole | null> => {

        let project: ProjectWithRole | null = null

        try {
            project = await create_project(name);
            toast.success("Project created successfully")

        } catch (error: any) {
            toast.error("Error while creating the project !")
            return null
        }

        closeModal(createModalId)

        const newProjects: ProjectWithRole[] = [...projects, project]
        setProjects(newProjects)

        return project
    }

    // handle delete btn click on project row
    const handleDelete = (project: ProjectWithRole): void => {

        setDeleteTarget(project);
        // wait React renders the modal
        queueMicrotask(() => {
            openModal(deleteModalId);
        });

    }

    // handle delete action at modal delete level
    const onDelete = async (): Promise<void> => {
        if (!deleteTarget) return
        try {
            await delete_project_by_id(deleteTarget.id);
            toast.success("Project deleted successfully")

        } catch (error: any) {
            toast.error("Error while try deleting the project !")
            return
        }

        closeModal(deleteModalId)

        const filtredProjects = projects.filter((p: ProjectWithRole) => p.id !== deleteTarget.id)

        setProjects(filtredProjects)
        setDeleteTarget(null);
    }

    // handle cancel action at modal delete level
    const onDeleteCancel = () => {
        closeModal(deleteModalId);
        setDeleteTarget(null)

    };

    function handleMembersClick(project: ProjectWithRole) {
        setMembersTarget(project);

        queueMicrotask(() => {
            openModal(membersModalId);
        });
    }

    const handleEdit = (project: ProjectWithRole) => {
        setEditTarget(project);

        queueMicrotask(() => {
            openModal(editModalId);
        });
    };

    const onUpdateProject = async (id: number, name: string): Promise<Project | null> => {
        try {
            const updated = await update_project(id, name);

            setProjects((prev) =>
                prev.map((p) =>
                    p.id === id
                        ? { ...p, name: updated.name }
                        : p
                )
            );

            toast.success("Project updated successfully");
            closeModal(editModalId);

            return updated;
        } catch {
            toast.error("Error while updating the project!");
            return null;
        }
    };
    useEffect(() => {
        (async () => {

            const data: ProjectWithRole[] = await get_projects();
            setProjects(data);

        })();
    }, []);

    return <>
        <button
            className="btn btn-dark"
            data-bs-toggle="modal"
            data-bs-target={`#${createModalId}`}
        >
            <i className="bi bi-plus-lg"></i> Create project
        </button>
        <ProjectCreateModal
            modalId={createModalId}
            onCreated={onCreated}
            onCancel={() => closeModal(createModalId)}
        />
        {deleteTarget && (
            <DeleteProjectModal
                modalId={deleteModalId}
                title="Delete project?"
                text={`You are about to delete "${deleteTarget.name}". This action cannot be undone.`}
                confirmLabel="Delete project"
                onDelete={onDelete}
                onCancel={onDeleteCancel}
            />
        )}
        {membersTarget && (
            <ProjectMembersModal
                modalId={membersModalId}
                projectId={membersTarget.id}
                projectName={membersTarget.name}
                projectRole={membersTarget.role}
                onCancel={() => {
                    closeModal(membersModalId);
                    setMembersTarget(null);
                }}
            />
        )}
        {editTarget && (
            <ProjectEditModal
                modalId={editModalId}
                project={editTarget}
                onUpdate={onUpdateProject}
                onCancel={() => {
                    closeModal(editModalId);
                    setEditTarget(null);
                }}
            />
        )}

        <div className="container mt-4">
            {projects.map((p) => <ProjectRowCard
                key={p.id}
                project={p}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onMembers={handleMembersClick}

            />)}
        </div>
    </>
}

export default ProjectsPage