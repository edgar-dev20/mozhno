import { createBrowserRouter, Navigate } from "react-router";
import { Auth } from "./pages/Auth";
import { DashboardLayout } from "./components/DashboardLayout";
import { Flags } from "./pages/Flags";
import { Segments } from "./pages/Segments";
import { Constraints } from "./pages/Constraints";
import { Strategies } from "./pages/Strategies";
import { ApiKeys } from "./pages/ApiKeys";
import { Tags } from "./pages/Tags";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Auth,
  },
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
      { path: "apikeys", Component: ApiKeys },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);