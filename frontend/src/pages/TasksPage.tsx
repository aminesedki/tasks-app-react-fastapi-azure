import { useState, useEffect } from "react";
import { useParams } from "react-router";
import Modal from "bootstrap/js/dist/modal";
import { toast } from "react-toastify";

import TaskRowCard from "../components/tasks/TaskRowCard";
import TaskCreateModal from "../components/tasks/TaskCreateModal";
import DeleteModal from "../components/shared/DeleteModal";

import {
  get_project_tasks,
  delete_project_task_by_id,
  create_project_task,
} from "../api/services/tasks";

import {
  type TaskOut,
  type TaskListResponse,
  type TaskStatus,
  type TaskPriority
} from "../shared-types/tasks";

import { type ProjectRole } from "../shared-types/projects"

const TasksPage = () => {
  const { projectId } = useParams();
  const pid = Number(projectId);

  const [tasks, setTasks] = useState<TaskOut[]>([]);
  const [role, setRole] = useState<ProjectRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskOut | null>(null);

  const createModalId = "createTaskModal";
  const deleteModalId = "deleteTaskModal";

  // =============================
  // Modal helpers
  // =============================

  const openModal = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    Modal.getOrCreateInstance(el).show();
  };

  const closeModal = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    Modal.getOrCreateInstance(el).hide();
  };

  // =============================
  // Fetch Tasks
  // =============================

  useEffect(() => {
    if (!pid) return;

    (async () => {
      const data: TaskListResponse = await get_project_tasks(pid);
      setRole(data.role);
      setTasks(data.items);
    })();
  }, [pid]);

  // =============================
  // Create
  // =============================

  const onCreated = async (payload: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string | null
  }): Promise<void> => {

    try {

      console.log('task payload : ', payload)
      const task = await create_project_task(pid, payload);

      toast.success("Task created successfully");

      closeModal(createModalId);

      setTasks((prev) => [task, ...prev]);

      return

    } catch (error) {
      toast.error("Error while creating the task!");
      return;
    }
  };

  // =============================
  // Delete
  // =============================

  const handleDeleteClick = (task: TaskOut): void => {
    setDeleteTarget(task);

    queueMicrotask(() => {
      openModal(deleteModalId);
    });
  };

  const onDelete = async (): Promise<void> => {
    if (!deleteTarget) return;

    try {
      await delete_project_task_by_id(pid, deleteTarget.id);
      toast.success("Task deleted successfully");
    } catch {
      toast.error("Error while deleting the task!");
      return;
    }

    closeModal(deleteModalId);

    setTasks((prev) =>
      prev.filter((t) => t.id !== deleteTarget.id)
    );

    setDeleteTarget(null);
  };

  const onDeleteCancel = () => {
    closeModal(deleteModalId);
    setDeleteTarget(null);
  };

  // =============================
  // Role-Based Permissions
  // =============================

  const canCreate =
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "MEMBER";

  // =============================
  // Render
  // =============================

  return (
    <>
      {/* Create Button */}
      {canCreate && (
        <button
          className="btn btn-dark"
          onClick={() => openModal(createModalId)}
        >
          <i className="bi bi-plus-lg"></i> Create task
        </button>
      )}

      {/* Create Modal */}
      <TaskCreateModal
        modalId={createModalId}
        onCreate={onCreated}
        onCancel={() => closeModal(createModalId)}
      />

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          modalId={deleteModalId}
          title="Delete task?"
          text={`You are about to delete "${deleteTarget.title}". This action cannot be undone.`}
          confirmLabel="Delete task"
          onDelete={onDelete}
          onCancel={onDeleteCancel}
        />
      )}

      {/* Task List */}
      <div className="container mt-4">
        {tasks.map((task) => (
          <TaskRowCard
            key={task.id}
            task={task}
            projectId={pid}
            role={role} // pass role here
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>
    </>
  );
};

export default TasksPage;