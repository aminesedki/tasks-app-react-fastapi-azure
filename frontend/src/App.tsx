import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider
} from "react-router";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import TaskDetailsPage from "./pages/TaskDetailsPage";
import TaskEditPage from "./pages/TaskEditPage";
import { useAuthStore } from "./stores/authStore";



const App = () => {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId/tasks" element={<TasksPage />} />
          <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetailsPage />} />
          <Route path="/projects/:projectId/tasks/:taskId/edit" element={<TaskEditPage />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Route>
      </>
    )
  )

  if (!isAuthReady) return null
  return <>
    <RouterProvider router={router} />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      theme="light"
    />
  </>
}

export default App
