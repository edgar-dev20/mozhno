import { createContext, useContext, useState, useCallback } from 'react'
import { getProjects, getEnvironments, getContexts, getTags, getSegments, getFlags, getApiKeys } from '../api'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectData, setProjectData] = useState({
    environments: [],
    contexts: [],
    tags: [],
    segments: [],
    flags: [],
    apiKeys: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data || [])
      if (data && data.length > 0 && !currentProject) {
        await selectProject(data[0].id)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const selectProject = useCallback(async (projectId) => {
    try {
      setLoading(true)
      const project = await getProjects().then(p => p.find(x => x.id === projectId))
      setCurrentProject(project)

      const [environments, contexts, tags, segments, flags, apiKeys] = await Promise.all([
        getEnvironments(projectId),
        getContexts(projectId),
        getTags(projectId),
        getSegments(projectId),
        getFlags(projectId),
        getApiKeys(projectId)
      ])

      setProjectData({
        environments: environments || [],
        contexts: contexts || [],
        tags: tags || [],
        segments: segments || [],
        flags: flags || [],
        apiKeys: apiKeys || []
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshProjectData = useCallback(async () => {
    if (!currentProject?.id) return
    try {
      const [environments, contexts, tags, segments, flags, apiKeys] = await Promise.all([
        getEnvironments(currentProject.id),
        getContexts(currentProject.id),
        getTags(currentProject.id),
        getSegments(currentProject.id),
        getFlags(currentProject.id),
        getApiKeys(currentProject.id)
      ])

      setProjectData({
        environments: environments || [],
        contexts: contexts || [],
        tags: tags || [],
        segments: segments || [],
        flags: flags || [],
        apiKeys: apiKeys || []
      })
    } catch (e) {
      setError(e.message)
    }
  }, [currentProject?.id])

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      projectData,
      loading,
      error,
      loadProjects,
      selectProject,
      refreshProjectData,
      setCurrentProject
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}