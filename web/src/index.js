const API_BASE = '/api/v1';

let currentView = 'projects';
let currentProjectId = null;
let currentFlagId = null;
let editingEnvId = null;
let editingCtxId = null;
let editingTagId = null;
let editingSegmentId = null;
let editingApiKeyId = null;
let currentApiKeyId = null;

const state = { currentView, currentProjectId, currentFlagId };

function setState(view, projectId, flagId) {
    state.currentView = view;
    state.currentProjectId = projectId;
    state.currentFlagId = flagId;
}

async function api(path, method = 'GET', body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    const trimmed = text.trim();
    if (!trimmed) return null;
    try { return JSON.parse(trimmed); } catch { return null; }
}

function render() {
    const app = document.getElementById('app');
    if (state.currentView === 'projects') {
        renderProjects(app);
    } else if (state.currentView === 'project') {
        renderProject(app);
    } else if (state.currentView === 'flag') {
        renderFlag(app);
    }
}

async function renderProjects(container) {
    let projects = [];
    try { projects = await api('/projects'); } catch(e) {}

    container.innerHTML = `
        <div class="page projects-page">
            <header class="page-header">
                <h1>Projects</h1>
                <button class="btn-primary" id="btnCreateProject">+ New Project</button>
            </header>
            <div class="projects-grid">
                ${projects.length === 0 ? '<p class="empty">No projects yet</p>' :
                projects.map(p => `
                    <div class="project-card" data-id="${p.id}">
                        <div class="project-avatar">${(p.name || 'P')[0].toUpperCase()}</div>
                        <div class="project-info">
                            <h3>${escapeHtml(p.name)}</h3>
                            <p>${escapeHtml(p.description || 'No description')}</p>
                        </div>
                        <button class="btn-icon btn-delete-project" data-id="${p.id}">✕</button>
                    </div>
                `).join('')}
            </div>
            <div id="modal" class="modal hidden"></div>
        </div>
    `;

    document.getElementById('btnCreateProject').onclick = showCreateProject;
    document.querySelectorAll('.project-card').forEach(card => {
        card.onclick = (e) => { if (!e.target.classList.contains('btn-icon')) openProject(parseInt(card.dataset.id)); };
    });
    document.querySelectorAll('.btn-delete-project').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); deleteProject(parseInt(btn.dataset.id)); };
    });
}

async function renderProject(container) {
    let project, environments, contexts, flags, tags, segments, apiKeys, allStrategies = {};
    try {
        project = await api(`/projects/${state.currentProjectId}`);
        environments = await api(`/projects/${state.currentProjectId}/environments`);
        contexts = await api(`/projects/${state.currentProjectId}/contexts`);
        flags = await api(`/projects/${state.currentProjectId}/flags`);
        tags = await api(`/projects/${state.currentProjectId}/tags`);
        segments = await api(`/projects/${state.currentProjectId}/segments`);
        apiKeys = await api(`/projects/${state.currentProjectId}/api-keys`);
        for (const f of flags) {
            allStrategies[f.id] = await api(`/flags/${f.id}/strategies`);
        }
    } catch(e) { console.error(e); }

    container.innerHTML = `
        <div class="page project-page">
            <header class="page-header">
                <button class="btn-back" id="btnBack">← Back</button>
                <h1>${escapeHtml(project?.name || 'Project')}</h1>
                <button class="btn-secondary" id="btnEditProject">Edit</button>
            </header>
            <div class="project-layout">
                <aside class="sidebar">
                    <nav class="sidebar-nav">
                        <div class="nav-section">
                            <h4>Environments</h4>
                            ${environments?.map((e, i) => `
                                <div class="nav-item${editingEnvId === e.id ? ' editing' : ''}" data-env="${e.id}">
                                    ${editingEnvId === e.id ? `
                                        <span class="nav-icon">🌍</span>
                                        <input type="text" id="editEnvName" value="${escapeHtml(e.name)}" class="inline-edit-input">
                                        <input type="text" id="editEnvDesc" value="${escapeHtml(e.description || '')}" class="inline-edit-input" placeholder="Description">
                                        <button class="btn-icon btn-save-env" data-id="${e.id}">✓</button>
                                        <button class="btn-icon btn-cancel-edit">✕</button>
                                    ` : `
                                        <span class="nav-icon">🌍</span>
                                        <span class="nav-item-text">${escapeHtml(e.name)}</span>
                                        <button class="btn-icon btn-delete-env" data-id="${e.id}">✕</button>
                                    `}
                                </div>
                            `).join('') || ''}
                            ${!editingEnvId ? `<button class="btn-link" id="btnAddEnv">+ Add Environment</button>` : ''}
                        </div>
                        <div class="nav-section">
                            <h4>Contexts</h4>
                            ${contexts?.map((c, i) => `
                                <div class="nav-item${editingCtxId === c.id ? ' editing' : ''}" data-ctx="${c.id}">
                                    ${editingCtxId === c.id ? `
                                        <span class="nav-icon">📋</span>
                                        <input type="text" id="editCtxName" value="${escapeHtml(c.name)}" class="inline-edit-input">
                                        <input type="text" id="editCtxDesc" value="${escapeHtml(c.description || '')}" class="inline-edit-input" placeholder="Description">
                                        <button class="btn-icon btn-save-ctx" data-id="${c.id}">✓</button>
                                        <button class="btn-icon btn-cancel-edit">✕</button>
                                    ` : `
                                        <span class="nav-icon">📋</span>
                                        <span class="nav-item-text">${escapeHtml(c.name)}</span>
                                        <button class="btn-icon btn-delete-ctx" data-id="${c.id}">✕</button>
                                    `}
                                </div>
                            `).join('') || ''}
                            ${!editingCtxId ? `<button class="btn-link" id="btnAddCtx">+ Add Context</button>` : ''}
                        </div>
<div class="nav-section">
                             <h4>Tags</h4>
                             ${tags?.map(t => `
                                 <div class="nav-item${editingTagId === t.id ? ' editing' : ''}" data-tag="${t.id}">
                                     ${editingTagId === t.id ? `
                                         <span class="tag-color-dot" style="background:${t.color}"></span>
                                         <input type="text" id="editTagName" value="${escapeHtml(t.name)}" class="inline-edit-input">
                                         <input type="text" id="editTagDesc" value="${escapeHtml(t.description || '')}" class="inline-edit-input" placeholder="Description">
                                         <input type="color" id="editTagColor" value="${t.color}" class="inline-edit-color">
                                         <button class="btn-icon btn-save-tag" data-id="${t.id}">✓</button>
                                         <button class="btn-icon btn-cancel-edit">✕</button>
                                     ` : `
                                         <span class="tag-color-dot" style="background:${t.color}"></span>
                                         <span class="nav-item-text">${escapeHtml(t.name)}</span>
                                         <button class="btn-icon btn-delete-tag" data-id="${t.id}">✕</button>
                                     `}
                                 </div>
                             `).join('') || ''}
                             ${!editingTagId ? `<button class="btn-link" id="btnAddTag">+ Add Tag</button>` : ''}
                         </div>
<div class="nav-section">
                              <h4>Segments</h4>
                              ${segments?.map(seg => `
                                  <div class="nav-item" data-segment="${seg.id}">
                                      <span class="nav-icon">🎯</span>
                                      <span class="nav-item-text">${escapeHtml(seg.name)}</span>
                                      <button class="btn-icon btn-delete-segment" data-id="${seg.id}">✕</button>
                                  </div>
                              `).join('') || ''}
                              <button class="btn-link" id="btnAddSegment">+ Add Segment</button>
                          </div>
                          <div class="nav-section">
                              <h4>API Keys</h4>
                              <div class="nav-item" data-apikey-section="true" id="navApiKeys">
                                  <span class="nav-icon">🔑</span>
                                  <span class="nav-item-text">Manage API Keys</span>
                              </div>
                          </div>
                    </nav>
                </aside>
                <main class="content" id="mainContent">
                    <div class="content-header">
                        <h2>Feature Flags</h2>
                        <button class="btn-primary" id="btnAddFlag">+ New Flag</button>
                    </div>
                    <div class="flags-list">
                        ${!flags || flags.length === 0 ? '<p class="empty">No flags yet</p>' :
                        flags.map(f => {
                            const strategies = allStrategies[f.id] || [];
                            const flagTags = (f.tags || []).map(t => tags.find(tag => tag.id === t.id || tag.id === t || tag.id === t.tagId)).filter(Boolean);
                            return `
                            <div class="flag-card" data-id="${f.id}">
                                <div class="flag-info">
                                    <h3>${escapeHtml(f.name)} <span class="flag-type-badge ${(f.flagType || 'RELEASE').toLowerCase()}">${escapeHtml(f.flagType || 'RELEASE')}</span></h3>
                                    <code>${escapeHtml(f.key)}</code>
                                    ${flagTags.length > 0 ? `<div class="flag-tags">${flagTags.map(t => `<span class="flag-tag" style="background:${t.color}20; color:${t.color}; border:1px solid ${t.color}">${escapeHtml(t.name)}</span>`).join('')}</div>` : ''}
                                </div>
                                <div class="flag-env-toggles">
                                    ${environments.map(env => {
                                        const strat = strategies.find(s => s.environmentId === env.id);
                                        const enabled = strat?.enabled || false;
                                        return `
                                            <div class="env-toggle-item" title="${env.name}">
                                                <span class="env-toggle-label">${env.name.substring(0,3)}</span>
                                                <label class="toggle" onclick="event.stopPropagation()">
                                                    <input type="checkbox" class="flag-env-toggle" data-flag="${f.id}" data-env="${env.id}" ${enabled ? 'checked' : ''}>
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                <button class="btn-icon btn-delete-flag" data-id="${f.id}" onclick="event.stopPropagation()">✕</button>
                            </div>
                        `;}).join('')}
                    </div>
                </main>
            </div>
            <div id="modal" class="modal hidden"></div>
        </div>
    `;

    document.getElementById('btnBack').onclick = () => { setState('projects', null, null); render(); };
    document.getElementById('btnEditProject').onclick = () => editProject(state.currentProjectId);
    if (document.getElementById('btnAddEnv')) document.getElementById('btnAddEnv').onclick = showCreateEnvironment;
    if (document.getElementById('btnAddCtx')) document.getElementById('btnAddCtx').onclick = showCreateContext;
    if (document.getElementById('btnAddTag')) document.getElementById('btnAddTag').onclick = showCreateTag;
    document.getElementById('btnAddFlag').onclick = showCreateFlag;
    document.querySelectorAll('.flag-card').forEach(card => {
        card.onclick = (e) => { if (!e.target.classList.contains('btn-icon') && !e.target.closest('.btn-icon')) openFlag(parseInt(card.dataset.id)); };
    });
    document.querySelectorAll('.flag-env-toggle').forEach(toggle => {
        toggle.addEventListener('change', async (e) => {
            const flagId = parseInt(e.target.dataset.flag);
            const envId = parseInt(e.target.dataset.env);
            const enabled = e.target.checked;
            await toggleFlagEnv(flagId, envId, enabled);
        });
    });
    document.querySelectorAll('.btn-delete-flag').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); deleteFlag(parseInt(btn.dataset.id)); };
    });
    document.querySelectorAll('.btn-delete-env').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); deleteEnvironment(parseInt(btn.dataset.id)); };
    });
    document.querySelectorAll('.btn-delete-ctx').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); deleteContext(parseInt(btn.dataset.id)); };
    });
    document.querySelectorAll('.btn-delete-tag').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); deleteTag(parseInt(btn.dataset.id)); };
    });
    document.querySelectorAll('.nav-item:not(.editing)').forEach(item => {
        if (item.dataset.env) {
            item.onclick = (e) => { if (!e.target.classList.contains('btn-icon')) { editingEnvId = parseInt(item.dataset.env); editingCtxId = null; editingTagId = null; editingApiKeyId = null; currentApiKeyId = null; render(); } };
        } else if (item.dataset.ctx) {
            item.onclick = (e) => { if (!e.target.classList.contains('btn-icon')) { editingCtxId = parseInt(item.dataset.ctx); editingEnvId = null; editingTagId = null; editingApiKeyId = null; currentApiKeyId = null; render(); } };
        } else if (item.dataset.tag) {
            item.onclick = (e) => { if (!e.target.classList.contains('btn-icon')) { editingTagId = parseInt(item.dataset.tag); editingEnvId = null; editingCtxId = null; editingApiKeyId = null; currentApiKeyId = null; render(); } };
        }
    });
    document.getElementById('navApiKeys')?.addEventListener('click', () => { currentApiKeyId = null; renderApiKeysScreen(); });
    document.querySelectorAll('.btn-save-env').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const name = document.getElementById('editEnvName').value.trim();
            const description = document.getElementById('editEnvDesc')?.value.trim() || '';
            if (!name) return;
            await api(`/projects/${state.currentProjectId}/environments/${btn.dataset.id}`, 'PUT', { name, description });
            editingEnvId = null;
            render();
        };
    });
    document.querySelectorAll('.btn-save-ctx').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const name = document.getElementById('editCtxName').value.trim();
            const description = document.getElementById('editCtxDesc')?.value.trim() || '';
            if (!name) return;
            await api(`/projects/${state.currentProjectId}/contexts/${btn.dataset.id}`, 'PUT', { name, description });
            editingCtxId = null;
            render();
        };
    });
document.querySelectorAll('.btn-save-tag').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const name = document.getElementById('editTagName').value.trim();
            const description = document.getElementById('editTagDesc').value.trim();
            const color = document.getElementById('editTagColor').value;
            if (!name) return;
            await api(`/projects/${state.currentProjectId}/tags/${btn.dataset.id}`, 'PUT', { name, description, color });
            editingTagId = null;
            render();
        };
    });
    document.querySelectorAll('.btn-save-apikey').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const name = document.getElementById('editApiKeyName').value.trim();
            const environmentId = document.getElementById('editApiKeyEnv').value || null;
            const description = document.getElementById('editApiKeyDesc').value.trim();
            if (!name) return;
            await api(`/projects/${state.currentProjectId}/api-keys/${btn.dataset.id}`, 'PUT', {
                name,
                environmentId: environmentId ? parseInt(environmentId) : null,
                description
            });
            editingApiKeyId = null;
            render();
        };
    });
    document.querySelectorAll('.btn-cancel-edit').forEach(btn => {
        btn.onclick = () => { editingEnvId = null; editingCtxId = null; editingTagId = null; render(); };
    });
    document.querySelectorAll('.btn-cancel-edit-apikey').forEach(btn => {
        btn.onclick = () => { editingApiKeyId = null; render(); };
    });
    if (document.getElementById('btnAddSegment')) document.getElementById('btnAddSegment').onclick = () => showCreateSegment();
    document.querySelectorAll('.btn-delete-segment').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); deleteSegment(parseInt(btn.dataset.id)); };
    });
    document.querySelectorAll('.nav-item[data-segment]').forEach(item => {
        item.onclick = (e) => {
            if (!e.target.classList.contains('btn-icon')) showEditSegment(parseInt(item.dataset.segment));
        };
    });
    if (document.getElementById('btnAddApiKey')) document.getElementById('btnAddApiKey').onclick = () => showCreateApiKey();
    document.querySelectorAll('.btn-delete-apikey').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); deleteApiKey(parseInt(btn.dataset.id)); };
    });
    document.querySelectorAll('#btnCopyApiKey').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const keyVal = document.getElementById('editApiKeyValue').textContent;
            navigator.clipboard.writeText(keyVal).then(function() {
                btn.textContent = 'Copied!';
                setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
            });
        };
    });
}

async function renderApiKeysScreen() {
    let apiKeys = [], environments = [];
    try {
        apiKeys = await api(`/projects/${state.currentProjectId}/api-keys`);
        environments = await api(`/projects/${state.currentProjectId}/environments`);
    } catch(e) { console.error(e); }

    const selectedKey = currentApiKeyId ? apiKeys.find(k => k.id === currentApiKeyId) : null;

    document.getElementById('mainContent').innerHTML = `
        <div class="page api-keys-page">
            <header class="page-header">
                <button class="btn-back" id="btnBackApiKeys">← Back</button>
                <h1>API Keys</h1>
                <button class="btn-primary" id="btnAddApiKey">+ New API Key</button>
            </header>
            <div class="api-keys-layout">
                <div class="api-keys-table-container">
                    <table class="api-keys-table-bordered">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Environment</th>
                                <th>API Key</th>
                                <th>Description</th>
                                <th>Created</th>
                                <th>Last Used</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${apiKeys.map(k => `
                                <tr class="${currentApiKeyId === k.id ? 'selected' : ''}" data-id="${k.id}">
                                    <td><strong>${escapeHtml(k.name)}</strong></td>
                                    <td><span class="env-tag">${escapeHtml(k.environmentId ? (environments.find(e => e.id === k.environmentId)?.name || 'env') : 'All')}</span></td>
                                    <td><code class="api-key-cell">${escapeHtml(k.apiKey)}</code></td>
                                    <td>${escapeHtml(k.description || '—')}</td>
                                    <td>${new Date(k.createdAt).toLocaleDateString()}</td>
                                    <td>${k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${selectedKey ? `
                <div class="api-key-edit-panel">
                    <h2>Edit: ${escapeHtml(selectedKey.name)}</h2>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="editApiKeyName" value="${escapeHtml(selectedKey.name)}">
                    </div>
                    <div class="form-group">
                        <label>Environment</label>
                        <select id="editApiKeyEnv">
                            <option value="">All environments</option>
                            ${environments.map(e => `<option value="${e.id}" ${e.id === selectedKey.environmentId ? 'selected' : ''}>${escapeHtml(e.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="editApiKeyDesc">${escapeHtml(selectedKey.description || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label>API Key</label>
                        <div class="api-key-value-row">
                            <code class="api-key-display">${escapeHtml(selectedKey.apiKey)}</code>
                            <button class="btn-secondary" id="btnCopyKey">Copy</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Created</label>
                        <span class="readonly-field">${new Date(selectedKey.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="form-group">
                        <label>Last Used</label>
                        <span class="readonly-field">${selectedKey.lastUsedAt ? new Date(selectedKey.lastUsedAt).toLocaleString() : 'Never'}</span>
                    </div>
                    <div class="form-actions">
                        <button class="btn-primary" id="btnSaveApiKey">Save</button>
                        <button class="btn-secondary" id="btnCancelEditApiKey">Cancel</button>
                        <button class="btn-danger" id="btnDeleteApiKey">Delete</button>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('btnBackApiKeys').onclick = () => { currentApiKeyId = null; render(); };
    document.getElementById('btnAddApiKey')?.addEventListener('click', showCreateApiKey);

    document.querySelectorAll('.api-keys-table-bordered tbody tr').forEach(row => {
        row.onclick = () => {
            currentApiKeyId = parseInt(row.dataset.id);
            renderApiKeysScreen();
        };
    });

    if (selectedKey) {
        document.getElementById('btnCopyKey')?.addEventListener('click', () => {
            navigator.clipboard.writeText(selectedKey.apiKey).then(() => {
                document.getElementById('btnCopyKey').textContent = 'Copied!';
                setTimeout(() => { document.getElementById('btnCopyKey').textContent = 'Copy'; }, 2000);
            });
        });
        document.getElementById('btnCancelEditApiKey')?.addEventListener('click', () => { currentApiKeyId = null; renderApiKeysScreen(); });
        document.getElementById('btnSaveApiKey')?.addEventListener('click', async () => {
            const name = document.getElementById('editApiKeyName').value.trim();
            const environmentId = document.getElementById('editApiKeyEnv').value || null;
            const description = document.getElementById('editApiKeyDesc').value.trim();
            if (!name) return alert('Name required');
            try {
                await api(`/projects/${state.currentProjectId}/api-keys/${currentApiKeyId}`, 'PUT', {
                    name, environmentId: environmentId ? parseInt(environmentId) : null, description
                });
                renderApiKeysScreen();
            } catch(e) { alert(e.message); }
        });
        document.getElementById('btnDeleteApiKey')?.addEventListener('click', async () => {
            if (!confirm('Delete API key?')) return;
            try {
                await api(`/projects/${state.currentProjectId}/api-keys/${currentApiKeyId}`, 'DELETE');
                currentApiKeyId = null;
                renderApiKeysScreen();
            } catch(e) { alert(e.message); }
        });
    }
}

async function renderFlag(container) {
    let flag = null, environments = [], strategies = [], tags = [], segments = [];
    try {
        const flags = await api(`/projects/${state.currentProjectId}/flags`);
        flag = flags.find(f => f.id === state.currentFlagId);
        environments = await api(`/projects/${state.currentProjectId}/environments`);
        strategies = await api(`/flags/${state.currentFlagId}/strategies`);
        tags = await api(`/projects/${state.currentProjectId}/tags`);
        segments = await api(`/projects/${state.currentProjectId}/segments`);
    } catch(e) { console.error('Error loading flag data:', e); }

    const isEditing = window.editingFlagId === state.currentFlagId;

    container.innerHTML = `
        <div class="page flag-page">
            <header class="page-header">
                <button class="btn-back" id="btnBack">← Back to Project</button>
                ${isEditing ? `
                    <input type="text" id="editFlagName" value="${escapeHtml(flag?.name || '')}" class="header-edit-input">
                    <input type="text" id="editFlagKey" value="${escapeHtml(flag?.key || '')}" class="header-edit-input">
                    <select id="editFlagType" class="header-edit-input">
                        <option value="RELEASE" ${flag?.flagType === 'RELEASE' ? 'selected' : ''}>Release</option>
                        <option value="KILLSWITCH" ${flag?.flagType === 'KILLSWITCH' ? 'selected' : ''}>Killswitch</option>
                    </select>
                    <button class="btn-primary btn-sm" onclick="saveFlagEdit()">Save</button>
                    <button class="btn-secondary btn-sm" onclick="cancelFlagEdit()">Cancel</button>
                ` : `
                    <h1>${escapeHtml(flag?.name || 'Flag')} <span class="flag-type-badge ${(flag?.flagType || 'RELEASE').toLowerCase()}">${escapeHtml(flag?.flagType || 'RELEASE')}</span></h1>
                    <code class="flag-key-badge">${escapeHtml(flag?.key || '')}</code>
                    <button class="btn-secondary" id="btnEditFlag">Edit</button>
                `}
            </header>
            <div class="flag-layout">
                <aside class="flag-sidebar">
                    <div class="sidebar-section">
                        <h4>Environments</h4>
                        ${environments.map(env => {
                            const strategy = strategies.find(s => s.environmentId === env.id);
                            const isEnabled = strategy?.enabled || false;
                            const type = strategy?.strategyType;
                            return `
                                <div class="env-strategy-item">
                                    <div class="env-row">
                                        <span class="env-name">${escapeHtml(env.name)}</span>
                                        <label class="toggle toggle-sm">
                                            <input type="checkbox" data-env="${env.id}" class="env-toggle" ${isEnabled ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div class="strategy-row">
                                        ${strategy 
                                            ? `<span class="strategy-badge ${type?.toLowerCase()}">${type}</span>`
                                            : `<span class="no-strategy-badge">No strategy</span>`}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="sidebar-divider"></div>
                    <div class="strategy-types">
                        <h4>Strategy Types</h4>
                        <div class="strategy-type-card server">
                            <span class="strategy-icon">⚡</span>
                            <span class="strategy-name">Server</span>
                            <span class="strategy-desc">On/Off toggle</span>
                        </div>
                        <div class="strategy-type-card gradual">
                            <span class="strategy-icon">📈</span>
                            <span class="strategy-name">Gradual</span>
                            <span class="strategy-desc">Percentage rollout</span>
                        </div>
                        <div class="strategy-type-card targeting">
                            <span class="strategy-icon">🎯</span>
                            <span class="strategy-name">Targeting</span>
                            <span class="strategy-desc">Context-based</span>
                        </div>
                    </div>
                </aside>
                <main class="flag-main">
                    ${isEditing ? `
                        <textarea id="editFlagDesc" placeholder="Description" class="flag-desc-edit">${escapeHtml(flag?.description || '')}</textarea>
                        <div class="form-group">
                            <label>Tags with values</label>
                            <div class="tag-values-list">${tags.length === 0 ? '<span class="empty-hint">No tags</span>' :
                                tags.slice(0, 10).map(t => {
                                    const existingTag = flag?.tags?.find(ft => ft.tagId === t.id);
                                    const isEnabled = !!existingTag;
                                    const existingValue = existingTag?.value || '';
                                    return `
                                        <div class="tag-value-row" data-tag-id="${t.id}">
                                            <span class="tag-color-dot" style="background:${t.color}"></span>
                                            <span class="tag-name">${escapeHtml(t.name)}</span>
                                            <input type="text" class="tag-value-input" placeholder="Value" value="${escapeHtml(existingValue)}">
                                            <label class="toggle-small">
                                                <input type="checkbox" class="tag-enabled-check" ${isEnabled ? 'checked' : ''}>
                                                <span class="toggle-slider-small"></span>
                                            </label>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : `
                        <p class="flag-description">${escapeHtml(flag?.description || 'No description')}</p>
                        ${flag?.tags?.length > 0 ? `<div class="flag-tag-values">${flag.tags.map(t => `<span class="flag-tag-value" style="background:${t.tagColor}20; color:${t.tagColor}; border:1px solid ${t.tagColor}">${escapeHtml(t.tagName)}: ${escapeHtml(t.value)}</span>`).join('')}</div>` : ''}
                    `}
                    <h3>Environment Strategies</h3>
                    <div class="environment-strategies">
                        ${environments.map(env => {
                            const strategy = strategies.find(s => s.environmentId === env.id);
                            const type = strategy?.strategyType;
                            const isEnabled = strategy?.enabled || false;

                            return `
                                <div class="env-card">
                                    <div class="env-card-header">
                                        <span class="env-title">${escapeHtml(env.name)}</span>
                                        <label class="toggle">
                                            <input type="checkbox" data-env="${env.id}" ${isEnabled ? 'checked' : ''} class="env-toggle">
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div class="env-card-body">
                                        ${strategy ? `
                                            <div class="strategy-info">
                                                <span class="strategy-type ${type?.toLowerCase() || 'server'}">${type || 'SERVER'}</span>
                                                ${type === 'GRADUAL' ? `<span class="strategy-detail">${strategy.percentage}% rollout</span>` : ''}
                                                ${type === 'TARGETING' ? `<span class="strategy-detail">${strategy.rolloutPercentage}% for ${strategy.segmentId ? `segment "${(segments.find(s => s.id === strategy.segmentId)||{}).name || '#'+strategy.segmentId}"` : `context #${strategy.contextDefinitionId}`}</span>` : ''}
                                            </div>
                                            <button class="btn-secondary btn-sm" data-env="${env.id}" onclick="openStrategyConfig(${env.id}); event.stopPropagation()">Configure</button>
                                            <button class="btn-icon btn-delete-strategy" data-env="${env.id}" onclick="event.stopPropagation()">✕</button>
                                        ` : `
                                            <span class="no-strategy">No strategy configured</span>
                                            <button class="btn-primary btn-sm" data-env="${env.id}" onclick="openStrategyConfig(${env.id})">Add Strategy</button>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </main>
            </div>
            <div id="modal" class="modal hidden"></div>
        </div>
    `;

document.getElementById('btnBack').onclick = () => { setState('project', state.currentProjectId, null); render(); };
    if (document.getElementById('btnEditFlag')) {
        document.getElementById('btnEditFlag').onclick = () => { window.editingFlagId = state.currentFlagId; render(); };
    }

    document.querySelectorAll('.env-toggle').forEach(toggle => {
        toggle.addEventListener('change', async (e) => {
            const envId = parseInt(e.target.dataset.env);
            const enabled = e.target.checked;
            await toggleStrategy(envId, enabled);
        });
    });
    document.querySelectorAll('.btn-delete-strategy').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const envId = parseInt(btn.dataset.env);
            await deleteStrategyForEnv(envId);
        };
    });
}

window.saveFlagEdit = async function() {
    const name = document.getElementById('editFlagName').value.trim();
    const key = document.getElementById('editFlagKey').value.trim();
    const description = document.getElementById('editFlagDesc')?.value.trim() || '';
    const flagType = document.getElementById('editFlagType')?.value || 'RELEASE';
    const tagIds = [...document.querySelectorAll('.flag-tag-check:checked')].map(c => parseInt(c.value));
    if (!name || !key) return alert('Name and key required');
    try {
        await api(`/projects/${state.currentProjectId}/flags/${state.currentFlagId}`, 'PUT', { name, key, description, flagType, tagIds });
        window.editingFlagId = null;
        render();
    } catch(e) { alert(e.message); }
};

window.cancelFlagEdit = function() {
    window.editingFlagId = null;
    render();
};

async function deleteStrategyForEnv(envId) {
    if (!confirm('Delete strategy for this environment?')) return;
    try {
        const strategies = await api(`/flags/${state.currentFlagId}/strategies`);
        const existing = strategies.find(s => s.environmentId === envId);
        if (existing) {
            await api(`/flags/${state.currentFlagId}/strategies/${existing.id}`, 'DELETE');
            render();
        }
    } catch(e) { alert(e.message); }
}

function buildTargetingOptions(contexts, segments, selectedSegmentId, selectedCtxId, ctxValuesJson, rolloutPct) {
    return `
        <div class="strategy-targeting-section">
            <div class="targeting-mode-select">
                <label>
                    <input type="radio" name="targetingMode" value="context" ${!selectedSegmentId ? 'checked' : ''}>
                    Use context fields
                </label>
                <label>
                    <input type="radio" name="targetingMode" value="segment" ${selectedSegmentId ? 'checked' : ''}>
                    Use segment
                </label>
            </div>
            <div class="targeting-mode-body" id="targetingContextBody" ${selectedSegmentId ? 'style="display:none"' : ''}>
                <select id="strCtx"><option value="">Select context</option>${contexts.map(c => `<option value="${c.id}" ${c.id == selectedCtxId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select>
                ${renderChipsBlock(ctxValuesJson)}
                <div class="slider-group">
                    <input type="range" id="strPct" min="0" max="100" value="${rolloutPct}">
                    <span class="slider-value">${rolloutPct}%</span>
                </div>
            </div>
            <div class="targeting-mode-body" id="targetingSegmentBody" ${!selectedSegmentId ? 'style="display:none"' : ''}>
                <select id="strSegment"><option value="">Select segment</option>${segments.map(s => `<option value="${s.id}" ${s.id == selectedSegmentId ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('')}</select>
                <div class="slider-group">
                    <input type="range" id="strPct" min="0" max="100" value="${rolloutPct}">
                    <span class="slider-value">${rolloutPct}%</span>
                </div>
            </div>
        </div>
    `;
}

window.openStrategyConfig = async function(envId) {
    let strategies = [];
    try { strategies = await api(`/flags/${state.currentFlagId}/strategies`); } catch(e) {}

    const existing = strategies.find(s => s.environmentId === envId);
    const type = existing?.strategyType || 'SERVER';
    const percentage = existing?.percentage || 50;
    const rolloutPercentage = existing?.rolloutPercentage || 100;
    const contextDefinitionId = existing?.contextDefinitionId || '';
    const contextValuesJson = existing?.contextValuesJson || '[]';
    const segmentId = existing?.segmentId || '';

    let contexts = [];
    let segments = [];
    try { contexts = await api(`/projects/${state.currentProjectId}/contexts`); } catch(e) {}
    try { segments = await api(`/projects/${state.currentProjectId}/segments`); } catch(e) {}

    document.getElementById('modal').innerHTML = `
        <div class="modal-content">
            <h2>Strategy for Environment #${envId}</h2>
            <div class="form-group">
                <label>Type</label>
                <select id="strType">
                    <option value="SERVER" ${type === 'SERVER' ? 'selected' : ''}>Server (On/Off)</option>
                    <option value="GRADUAL" ${type === 'GRADUAL' ? 'selected' : ''}>Gradual Rollout</option>
                    <option value="TARGETING" ${type === 'TARGETING' ? 'selected' : ''}>Targeting</option>
                </select>
            </div>
            <div id="strOptions">
                ${type === 'GRADUAL' ? `
                    <div class="slider-group">
                        <input type="range" id="strPct" min="0" max="100" value="${percentage}">
                        <span class="slider-value">${percentage}%</span>
                    </div>
                ` : ''}
                ${type === 'TARGETING' ? buildTargetingOptions(contexts, segments, segmentId, contextDefinitionId, contextValuesJson, rolloutPercentage) : ''}
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="saveStrategy(${envId})">Save</button>
            </div>
        </div>
    `;

    document.getElementById('strType').addEventListener('change', () => {
        const t = document.getElementById('strType').value;
        const opts = document.getElementById('strOptions');
        if (t === 'GRADUAL') opts.innerHTML = `
            <div class="slider-group">
                <input type="range" id="strPct" min="0" max="100" value="50">
                <span class="slider-value">50%</span>
            </div>
        `;
        else if (t === 'TARGETING') opts.innerHTML = buildTargetingOptions(contexts, segments, null, null, '[]', 100);
        else opts.innerHTML = '';
        setupSliderListeners();
        setupTargetingModeSwitch();
        setupAllChipsBlocks();
    });

    setupTargetingModeSwitch();

    document.getElementById('modal').classList.remove('hidden');
    setupSliderListeners();
    setupAllChipsBlocks();
};

function setupSliderListeners() {
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const valueSpan = e.target.nextElementSibling;
            if (valueSpan && valueSpan.classList.contains('slider-value')) {
                valueSpan.textContent = e.target.value + '%';
            }
        });
    });
}

function setupTargetingModeSwitch() {
    document.querySelectorAll('input[name="targetingMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const ctxBody = document.getElementById('targetingContextBody');
            const segBody = document.getElementById('targetingSegmentBody');
            if (e.target.value === 'segment') {
                if (ctxBody) ctxBody.style.display = 'none';
                if (segBody) segBody.style.display = 'block';
            } else {
                if (ctxBody) ctxBody.style.display = 'block';
                if (segBody) segBody.style.display = 'none';
            }
        });
    });
}

function setupAllChipsBlocks() {
    document.querySelectorAll('.values-chips-area').forEach(area => setupChipsBlock(area));
}

window.saveStrategy = async function(envId) {
    const type = document.getElementById('strType').value;
    const body = {
        flagId: state.currentFlagId,
        environmentId: envId,
        type,
        enabled: true
    };

    if (type === 'GRADUAL') body.percentage = parseFloat(document.getElementById('strPct').value);
    if (type === 'TARGETING') {
        const modeInput = document.querySelector('input[name="targetingMode"]:checked');
        const useSegment = modeInput?.value === 'segment';
        if (useSegment) {
            body.segmentId = parseInt(document.getElementById('strSegment').value) || null;
        } else {
            body.contextDefinitionId = parseInt(document.getElementById('strCtx').value) || null;
            const chipsArea = document.getElementById('targetingContextBody').querySelector('.values-chips-area');
            body.contextValuesJson = chipsArea ? JSON.stringify(getChipValues(chipsArea)) : '[]';
        }
        body.rolloutPercentage = parseFloat(document.getElementById('strPct').value);
    }

    try {
        const strategies = await api(`/flags/${state.currentFlagId}/strategies`);
        const existing = strategies.find(s => s.environmentId === envId);
        if (existing) {
            await api(`/flags/${state.currentFlagId}/strategies/${existing.id}`, 'PUT', body);
        } else {
            await api(`/flags/${state.currentFlagId}/strategies`, 'POST', body);
        }
        closeModal();
        render();
    } catch(e) { alert('Error: ' + e.message); }
};

async function toggleFlagEnv(flagId, envId, enabled) {
    try {
        const strategies = await api(`/flags/${flagId}/strategies`);
        const existing = strategies.find(s => s.environmentId === envId);
        if (existing) {
            await api(`/flags/${flagId}/strategies/${existing.id}`, 'PUT', { enabled });
        } else {
            await api(`/flags/${flagId}/strategies`, 'POST', {
                flagId, environmentId: envId, type: 'SERVER', enabled
            });
        }
    } catch(e) { alert(e.message); }
}

async function toggleStrategy(envId, enabled) {
    try {
        const strategies = await api(`/flags/${state.currentFlagId}/strategies`);
        const existing = strategies.find(s => s.environmentId === envId);
        if (existing) {
            await api(`/flags/${flagId}/strategies/${existing.id}`, 'PUT', { enabled });
        } else {
            await api(`/flags/${state.currentFlagId}/strategies`, 'POST', {
                flagId: state.currentFlagId,
                environmentId: envId,
                type: 'SERVER',
                enabled
            });
        }
        render();
    } catch(e) { alert(e.message); }
}

function showCreateProject() {
    document.getElementById('modal').innerHTML = `
        <div class="modal-content">
            <h2>Create Project</h2>
            <input type="text" id="projName" placeholder="Project name">
            <textarea id="projDesc" placeholder="Description"></textarea>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" id="btnSubmitProject">Create</button>
            </div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('btnSubmitProject').onclick = createProject;
}

async function createProject() {
    const name = document.getElementById('projName').value.trim();
    const description = document.getElementById('projDesc').value.trim();
    if (!name) return alert('Name required');
    try {
        await api('/projects', 'POST', { name, description });
        window.closeModal();
        render();
    } catch(e) { alert(e.message); }
}

async function deleteProject(id) {
    if (!confirm('Delete project?')) return;
    try { await api(`/projects/${id}`, 'DELETE'); render(); } catch(e) { alert(e.message); }
}

window.editProject = function(id) {
    api(`/projects/${id}`).then(p => {
        document.getElementById('modal').innerHTML = `
            <div class="modal-content">
                <h2>Edit Project</h2>
                <input type="text" id="projName" value="${escapeHtml(p.name)}">
                <textarea id="projDesc">${escapeHtml(p.description || '')}</textarea>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="updateProject(${id})">Save</button>
                </div>
            </div>
        `;
        document.getElementById('modal').classList.remove('hidden');
    }).catch(e => alert(e.message));
}

async function updateProject(id) {
    const name = document.getElementById('projName').value.trim();
    const description = document.getElementById('projDesc').value.trim();
    if (!name) return alert('Name required');
    try { await api(`/projects/${id}`, 'PUT', { name, description }); window.closeModal(); render(); } catch(e) { alert(e.message); }
}

window.openProject = function(id) { setState('project', id, null); render(); };
window.openFlag = function(id) { setState('flag', state.currentProjectId, id); render(); };

window.showCreateEnvironment = function() {
    document.getElementById('modal').innerHTML = `
        <div class="modal-content">
            <h2>Add Environment</h2>
            <input type="text" id="envName" placeholder="Name (e.g. production)">
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="createEnvironment()">Create</button>
            </div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

window.createEnvironment = async function() {
    const name = document.getElementById('envName').value.trim();
    if (!name) return alert('Name required');
    try { await api(`/projects/${state.currentProjectId}/environments`, 'POST', { name }); window.closeModal(); render(); } catch(e) { alert(e.message); }
}

window.showCreateContext = function() {
    document.getElementById('modal').innerHTML = `
        <div class="modal-content">
            <h2>Add Context</h2>
            <input type="text" id="ctxName" placeholder="Name (e.g. userId)">
            <input type="text" id="ctxDesc" placeholder="Description">
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="createContext()">Create</button>
            </div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

window.createContext = async function() {
    const name = document.getElementById('ctxName').value.trim();
    const description = document.getElementById('ctxDesc').value.trim();
    if (!name) return alert('Name required');
    try { await api(`/projects/${state.currentProjectId}/contexts`, 'POST', { name, description }); window.closeModal(); render(); } catch(e) { alert(e.message); }
}

window.showCreateFlag = async function() {
    let tags = [];
    try { tags = await api(`/projects/${state.currentProjectId}/tags`); } catch(e) {}

    const modal = document.getElementById('modal');
    modal.innerHTML = '';
    modal.classList.remove('hidden');

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Create Flag</h2>
            <input type="text" id="flagName" placeholder="Name">
            <input type="text" id="flagKey" placeholder="Key (e.g. new-feature)">
            <div class="form-group">
                <label>Type</label>
                <select id="flagType">
                    <option value="RELEASE">Release</option>
                    <option value="KILLSWITCH">Killswitch</option>
                </select>
            </div>
            <textarea id="flagDesc" placeholder="Description"></textarea>
            <div class="form-group">
                <label>Tags with values <span class="hint">(max 10)</span></label>
                <div class="tag-values-list">${tags.length === 0 ? '<span class="empty-hint">No tags yet</span>' :
                    tags.slice(0, 10).map(t => `
                        <div class="tag-value-row" data-tag-id="${t.id}">
                            <span class="tag-color-dot" style="background:${t.color}"></span>
                            <span class="tag-name">${escapeHtml(t.name)}</span>
                            <input type="text" class="tag-value-input" placeholder="Value">
                            <label class="toggle-small">
                                <input type="checkbox" class="tag-enabled-check">
                                <span class="toggle-slider-small"></span>
                            </label>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn-link" onclick="showCreateTag()">+ New Tag</button>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="createFlag()">Create</button>
            </div>
        </div>
    `;
}

window.createFlag = async function() {
    const name = document.getElementById('flagName').value.trim();
    const key = document.getElementById('flagKey').value.trim();
    const description = document.getElementById('flagDesc').value.trim();
    const flagType = document.getElementById('flagType').value;
    const tagValues = [];
    document.querySelectorAll('.tag-value-row').forEach(row => {
        if (row.querySelector('.tag-enabled-check').checked) {
            const tagId = parseInt(row.dataset.tagId);
            const value = row.querySelector('.tag-value-input').value.trim();
            if (tagId && value) {
                tagValues.push({ tagId, value });
            }
        }
    });
    if (!name || !key) return alert('Name and key required');
    try { await api(`/projects/${state.currentProjectId}/flags`, 'POST', { name, key, description, flagType, tags: tagValues }); window.closeModal(); render(); } catch(e) { alert(e.message); }
}

async function deleteFlag(id) {
    if (!confirm('Delete flag?')) return;
    try { await api(`/projects/${state.currentProjectId}/flags/${id}`, 'DELETE'); render(); } catch(e) { alert(e.message); }
}

async function deleteEnvironment(id) {
    if (!confirm('Delete environment?')) return;
    try { await api(`/projects/${state.currentProjectId}/environments/${id}`, 'DELETE'); render(); } catch(e) { alert(e.message); }
}

async function deleteContext(id) {
    if (!confirm('Delete context?')) return;
    try { await api(`/projects/${state.currentProjectId}/contexts/${id}`, 'DELETE'); render(); } catch(e) { alert(e.message); }
}

async function deleteTag(id) {
    if (!confirm('Delete tag?')) return;
    try { await api(`/projects/${state.currentProjectId}/tags/${id}`, 'DELETE'); render(); } catch(e) { alert(e.message); }
}

window.showCreateSegment = function(segId) {
    let contexts = [];
    const isEdit = !!segId;
    let editPromise = null;
    if (isEdit) {
        editPromise = api(`/projects/${state.currentProjectId}/segments/${segId}`);
    }
    api(`/projects/${state.currentProjectId}/contexts`).then(allContexts => {
        contexts = allContexts;
        if (isEdit) {
            editPromise.then(seg => {
                buildSegmentModal(contexts, seg, true);
            }).catch(e => alert(e.message));
        } else {
            buildSegmentModal(contexts, null, false);
        }
    }).catch(e => { console.error(e); buildSegmentModal(contexts, null, false); });
};

function buildSegmentModal(contexts, existing, isEdit) {
    const segContext = existing?.context || [];
    document.getElementById('modal').innerHTML = `
        <div class="modal-content" style="max-width:550px">
            <h2>${isEdit ? 'Edit' : 'Create'} Segment</h2>
            <input type="text" id="segName" placeholder="Segment name" value="${isEdit ? escapeHtml(existing.name) : ''}">
            <textarea id="segDesc" placeholder="Description">${isEdit ? escapeHtml(existing.description || '') : ''}</textarea>
            <div class="form-group">
                <label>Context fields (AND)</label>
                <div id="segmentContextEntries">
                    ${segContext.map((e, i) => `
                        <div class="context-entry-row" data-index="${i}">
                            <select class="ctx-def-select">
                                <option value="">Select context</option>
                                ${contexts.map(c => `<option value="${c.id}" ${c.id == e.contextDefinitionId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                            </select>
                            ${renderChipsBlock(e.contextValues)}
                            <button class="btn-icon btn-remove-ctx-entry">✕</button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-link" id="btnAddContextEntry">+ Add context field</button>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="${isEdit ? `saveSegment(${existing.id})` : 'createSegment()'}">${isEdit ? 'Save' : 'Create'}</button>
            </div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('btnAddContextEntry').onclick = addContextEntryRow;
    setupAllChipsBlocks();
    document.querySelectorAll('.btn-remove-ctx-entry').forEach(btn => {
        btn.onclick = (e) => {
            e.target.closest('.context-entry-row').remove();
        };
    });
}

function addContextEntryRow() {
    let contexts = [];
    api(`/projects/${state.currentProjectId}/contexts`).then(c => {
        contexts = c;
        const container = document.getElementById('segmentContextEntries');
        const div = document.createElement('div');
        div.className = 'context-entry-row';
        div.innerHTML = `
            <select class="ctx-def-select">
                <option value="">Select context</option>
                ${contexts.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
            </select>
            ${renderChipsBlock('[]')}
            <button class="btn-icon btn-remove-ctx-entry">✕</button>
        `;
        container.appendChild(div);
        div.querySelector('.btn-remove-ctx-entry').onclick = () => div.remove();
        setupChipsBlock(div.querySelector('.values-chips-area'));
    }).catch(() => {});
}

window.createSegment = async function() {
    const name = document.getElementById('segName').value.trim();
    const description = document.getElementById('segDesc').value.trim();
    if (!name) return alert('Name required');
    const contextMap = {};
    document.querySelectorAll('.context-entry-row').forEach(row => {
        const defId = parseInt(row.querySelector('.ctx-def-select').value) || null;
        const chipsArea = row.querySelector('.values-chips-area');
        const chipValues = chipsArea ? getChipValues(chipsArea) : [];
        if (defId && chipValues.length > 0) {
            contextMap[defId] = { contextDefinitionId: defId, contextValues: JSON.stringify(chipValues) };
        }
    });
    const context = Object.values(contextMap);
    try {
        await api(`/projects/${state.currentProjectId}/segments`, 'POST', { name, description, context });
        window.closeModal();
        render();
    } catch(e) { alert(e.message); }
};

window.saveSegment = async function(segId) {
    const name = document.getElementById('segName').value.trim();
    const description = document.getElementById('segDesc').value.trim();
    if (!name) return alert('Name required');
    const contextMap = {};
    document.querySelectorAll('.context-entry-row').forEach(row => {
        const defId = parseInt(row.querySelector('.ctx-def-select').value) || null;
        const chipsArea = row.querySelector('.values-chips-area');
        const chipValues = chipsArea ? getChipValues(chipsArea) : [];
        if (defId && chipValues.length > 0) {
            contextMap[defId] = { contextDefinitionId: defId, contextValues: JSON.stringify(chipValues) };
        }
    });
    const context = Object.values(contextMap);
    try {
        await api(`/projects/${state.currentProjectId}/segments/${segId}`, 'PUT', { name, description, context });
        window.closeModal();
        render();
    } catch(e) { alert(e.message); }
};

window.showEditSegment = function(segId) {
    showCreateSegment(segId);
};

async function deleteSegment(id) {
    if (!confirm('Delete segment?')) return;
    try { await api(`/projects/${state.currentProjectId}/segments/${id}`, 'DELETE'); render(); } catch(e) { alert(e.message); }
}

window.showCreateTag = function() {
    document.getElementById('modal').innerHTML = `
        <div class="modal-content">
            <h2>Create Tag</h2>
            <input type="text" id="tagName" placeholder="Tag name">
            <input type="text" id="tagDesc" placeholder="Description">
            <div class="form-group">
                <label>Color</label>
                <input type="color" id="tagColor" value="#6366f1">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="createTag()">Create</button>
            </div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

window.createTag = async function() {
    const name = document.getElementById('tagName').value.trim();
    const description = document.getElementById('tagDesc').value.trim();
    const color = document.getElementById('tagColor').value;
    if (!name) return alert('Name required');
    try {
        await api(`/projects/${state.currentProjectId}/tags`, 'POST', { name, description, color });
        window.closeModal();
        render();
    } catch(e) { alert(e.message); }
}

window.closeModal = function() { document.getElementById('modal').classList.add('hidden'); }

async function showCreateApiKey() {
    let environments = [];
    try { environments = await api(`/projects/${state.currentProjectId}/environments`); } catch(e) {}

    document.getElementById('modal').innerHTML = `
        <div class="modal-content">
            <h2>Create API Key</h2>
            <input type="text" id="apiKeyName" placeholder="Service name (e.g. My App)">
            <div class="form-group">
                <label>Environment</label>
                <select id="apiKeyEnv">
                    <option value="">All environments</option>
                    ${environments.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('')}
                </select>
            </div>
            <textarea id="apiKeyDesc" placeholder="Description (optional)"></textarea>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="createApiKey()">Create</button>
            </div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

window.createApiKey = async function() {
    const name = document.getElementById('apiKeyName').value.trim();
    const environmentId = document.getElementById('apiKeyEnv').value || null;
    const description = document.getElementById('apiKeyDesc').value.trim();
    if (!name) return alert('Name required');
    try {
        const result = await api(`/projects/${state.currentProjectId}/api-keys`, 'POST', {
            name,
            environmentId: environmentId ? parseInt(environmentId) : null,
            description
        });
        window.closeModal();
        currentApiKeyId = result.id;
        renderApiKeysScreen();
    } catch(e) { alert(e.message); }
};

async function deleteApiKey(id) {
    if (!confirm('Delete API key? This will revoke access for any client using it.')) return;
    try { await api(`/projects/${state.currentProjectId}/api-keys/${id}`, 'DELETE'); currentApiKeyId = null; renderApiKeysScreen(); } catch(e) { alert(e.message); }
}

function renderApiKeysSection(apiKeys, environments) {
    if (!apiKeys || apiKeys.length === 0) return '';

    return `
        <div class="api-keys-section collapsed" id="apiKeysSection">
            <div class="section-collapse-header">
                <span class="collapse-icon">▼</span>
                <h3>API Keys (${apiKeys.length})</h3>
            </div>
            <div class="section-collapse-body">
                <table class="api-keys-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Environment</th>
                            <th>API Key</th>
                            <th>Description</th>
                            <th>Created</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${apiKeys.map(k => `
                            <tr>
                                <td><strong>${escapeHtml(k.name)}</strong></td>
                                <td><span class="env-tag">${escapeHtml(k.environmentId ? (environments?.find(e => e.id === k.environmentId)?.name || 'env') : 'All')}</span></td>
                                <td><code class="api-key-val-cell">${escapeHtml(k.apiKey)}</code></td>
                                <td class="desc-cell">${escapeHtml(k.description || '—')}</td>
                                <td class="date-cell">${new Date(k.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button class="btn-primary btn-sm api-key-copy-btn">Copy</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="api-keys-usage">
                    <p>Include a key in the <code>Authorization</code> header to read flags:</p>
                    <code class="api-key-curl">curl -H "Authorization: Bearer &lt;API_KEY&gt;" ${window.location.origin}/api/client/features</code>
                </div>
            </div>
        </div>
    `;
}

window.copyApiKey = function() {
    const el = document.getElementById('apiKeyValue');
    if (!el) return;
    navigator.clipboard.writeText(el.textContent).then(() => {
        const btn = document.querySelector('.btn-copy-key');
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
};

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escAttr(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseJsonArray(json) {
    try {
        return JSON.parse(json || '[]');
    } catch {
        return [];
    }
}

function renderChipsBlock(existingJson) {
    const values = parseJsonArray(existingJson);
    const chips = values.map(v => `<span class="value-chip"><span class="value-chip-text">${escAttr(v)}</span><button class="value-chip-remove">×</button></span>`).join('');
    return '' +
        `<div class="values-chips-area" data-values='${escAttr(existingJson || "[]")}'>
            <div class="chip-add-row">
                <input type="text" class="chip-add-input" placeholder="Type value and press Enter">
                <button type="button" class="btn-chip-add">Add</button>
            </div>
            <div class="chips-bank${chips ? ' has-values' : ''}">${chips}</div>
        </div>`;
}

function setupChipsBlock(container) {
    const input = container.querySelector('.chip-add-input');
    const addBtn = container.querySelector('.btn-chip-add');
    const bank = container.querySelector('.chips-bank');

    function addChip(value) {
        value = value.trim();
        if (!value) return;
        if (getChipValues(container).some(v => v === value)) return;
        const chip = document.createElement('span');
        chip.className = 'value-chip';
        chip.innerHTML = `<span class="value-chip-text">${escAttr(value)}</span><button class="value-chip-remove">×</button>`;
        chip.querySelector('.value-chip-remove').onclick = () => {
            chip.remove();
            if (bank.querySelectorAll('.value-chip').length === 0) bank.classList.remove('has-values');
        };
        bank.appendChild(chip);
        bank.classList.add('has-values');
        input.value = '';
        input.focus();
    }

    addBtn.onclick = () => addChip(input.value);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); addChip(input.value); }
    });

    container.querySelectorAll('.value-chip-remove').forEach(btn => {
        btn.onclick = () => {
            btn.closest('.value-chip').remove();
            if (bank.querySelectorAll('.value-chip').length === 0) bank.classList.remove('has-values');
        };
    });
}

function getChipValues(container) {
    const chips = container.querySelectorAll('.value-chip-text');
    return Array.from(chips).map(c => c.textContent.trim()).filter(Boolean);
}

document.addEventListener('DOMContentLoaded', render);