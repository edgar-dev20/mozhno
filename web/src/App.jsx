import { Routes, Route, Navigate } from 'react-router'
import { DashboardLayout } from './components/DashboardLayout'
import { Flags } from './pages/Flags'
import { Segments } from './pages/Segments'
import { Constraints } from './pages/Constraints'
import { Strategies } from './pages/Strategies'
import { ApiKeys } from './pages/ApiKeys'
import { Auth } from './pages/Auth'
import { ProjectProvider } from './context/ProjectContext'

export default function App() {
  return (
    <ProjectProvider>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/flags" replace />} />
          <Route path="flags" element={<Flags />} />
          <Route path="segments" element={<Segments />} />
          <Route path="constraints" element={<Constraints />} />
          <Route path="strategies" element={<Strategies />} />
          <Route path="apikeys" element={<ApiKeys />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProjectProvider>
  )
}