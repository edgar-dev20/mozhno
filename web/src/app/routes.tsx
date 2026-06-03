import { createHashRouter, Navigate } from "react-router";
import { Auth } from "./components/Auth";
import { DashboardLayout } from "./components/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Flags } from "./components/Flags";
import { Segments } from "./components/Segments";
import { Strategies } from "./components/Strategies";
import { ApiKeys } from "./components/ApiKeys";
import { Constraints } from "./components/Constraints";
import { Tags } from "./components/Tags";
import { Users } from "./components/Users";
import { AuditLog } from "./components/AuditLog";
import { Integrations } from "./components/Integrations";
import { Settings } from "./components/Settings";

export const router = createHashRouter([
  {
    path: "/login",
    Component: Auth,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        Component: DashboardLayout,
        children: [
          { index: true, element: <Navigate to="/flags" replace /> },
          { path: "flags", Component: Flags },
          { path: "segments", Component: Segments },
          { path: "constraints", Component: Constraints },
          { path: "strategies", Component: Strategies },
          { path: "tags", Component: Tags },
          { path: "users", Component: Users },
          { path: "audit", Component: AuditLog },
          { path: "integrations", Component: Integrations },
          { path: "apikeys", Component: ApiKeys },
          { path: "settings", Component: Settings },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);