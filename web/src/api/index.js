const API_BASE = '/api/v1';

export async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  const trimmed = text.trim();
  if (!trimmed) return null;
  try { return JSON.parse(trimmed); } catch { return null; }
}

// Projects
export async function getProjects() {
  return api('/projects');
}

export async function getProject(id) {
  return api(`/projects/${id}`);
}

export async function createProject(data) {
  return api('/projects', 'POST', data);
}

export async function updateProject(id, data) {
  return api(`/projects/${id}`, 'PUT', data);
}

export async function deleteProject(id) {
  return api(`/projects/${id}`, 'DELETE');
}

// Environments
export async function getEnvironments(projectId) {
  return api(`/projects/${projectId}/environments`);
}

export async function createEnvironment(projectId, data) {
  return api(`/projects/${projectId}/environments`, 'POST', data);
}

export async function updateEnvironment(projectId, id, data) {
  return api(`/projects/${projectId}/environments/${id}`, 'PUT', data);
}

export async function deleteEnvironment(projectId, id) {
  return api(`/projects/${projectId}/environments/${id}`, 'DELETE');
}

// Contexts
export async function getContexts(projectId) {
  return api(`/projects/${projectId}/contexts`);
}

export async function createContext(projectId, data) {
  return api(`/projects/${projectId}/contexts`, 'POST', data);
}

export async function updateContext(projectId, id, data) {
  return api(`/projects/${projectId}/contexts/${id}`, 'PUT', data);
}

export async function deleteContext(projectId, id) {
  return api(`/projects/${projectId}/contexts/${id}`, 'DELETE');
}

// Tags
export async function getTags(projectId) {
  return api(`/projects/${projectId}/tags`);
}

export async function createTag(projectId, data) {
  return api(`/projects/${projectId}/tags`, 'POST', data);
}

export async function updateTag(projectId, id, data) {
  return api(`/projects/${projectId}/tags/${id}`, 'PUT', data);
}

export async function deleteTag(projectId, id) {
  return api(`/projects/${projectId}/tags/${id}`, 'DELETE');
}

// Segments
export async function getSegments(projectId) {
  return api(`/projects/${projectId}/segments`);
}

export async function createSegment(projectId, data) {
  return api(`/projects/${projectId}/segments`, 'POST', data);
}

export async function updateSegment(projectId, id, data) {
  return api(`/projects/${projectId}/segments/${id}`, 'PUT', data);
}

export async function deleteSegment(projectId, id) {
  return api(`/projects/${projectId}/segments/${id}`, 'DELETE');
}

// Flags
export async function getFlags(projectId, environmentId) {
    return api(`/projects/${projectId}/flags${environmentId ? `?environmentId=${environmentId}` : ''}`);
}

export async function getFlag(projectId, id) {
  return api(`/projects/${projectId}/flags/${id}`);
}

export async function createFlag(projectId, data) {
  return api(`/projects/${projectId}/flags`, 'POST', data);
}

export async function updateFlag(projectId, id, data) {
  return api(`/projects/${projectId}/flags/${id}`, 'PUT', data);
}

export async function deleteFlag(projectId, id) {
  return api(`/projects/${projectId}/flags/${id}`, 'DELETE');
}

// Strategies
export async function getStrategies(flagId) {
  return api(`/flags/${flagId}/strategies`);
}

export async function createStrategy(flagId, data) {
  return api(`/flags/${flagId}/strategies`, 'POST', data);
}

export async function updateStrategy(flagId, strategyId, data) {
  return api(`/flags/${flagId}/strategies/${strategyId}`, 'PUT', data);
}

export async function upsertStrategy(flagId, data) {
  return api(`/flags/${flagId}/strategies`, 'PUT', data);
}

export async function deleteStrategy(flagId, strategyId) {
  return api(`/flags/${flagId}/strategies/${strategyId}`, 'DELETE');
}

// API Keys
export async function getApiKeys(projectId) {
  return api(`/projects/${projectId}/api-keys`);
}

export async function createApiKey(projectId, data) {
  return api(`/projects/${projectId}/api-keys`, 'POST', data);
}

export async function updateApiKey(projectId, id, data) {
  return api(`/projects/${projectId}/api-keys/${id}`, 'PUT', data);
}

export async function deleteApiKey(projectId, id) {
  return api(`/projects/${projectId}/api-keys/${id}`, 'DELETE');
}