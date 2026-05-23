const API_BASE = '/api/v1';

let currentView = 'projects';
let currentProjectId = null;
let currentFlagId = null;

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
    if (!res.ok) throw new Error(await res.text());
    return res.json();
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
    let project, environments, contexts, flags, allStrategies = {};
    try {
        project = await api(`/projects/${state.currentProjectId}`);
        environments = await api(`/projects/${state.currentProjectId}/environments`);
        contexts = await api(`/projects/${state.currentProjectId}/contexts`);
        flags = await api(`/projects/${state.currentProjectId}/flags`);
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
                                <div class="nav-item${i === 0 ? ' active' : ''}" data-env="${e.id}">
                                    <span class="nav-icon">🌍</span>
                                    <span>${escapeHtml(e.name)}</span>
                                    <button class="btn-icon btn-delete-env" data-id="${e.id}">✕</button>
                                </div>
                            `).join('') || ''}
                            <button class="btn-link" id="btnAddEnv">+ Add Environment</button>
                        </div>
                        <div class="nav-section">
                            <h4>Contexts</h4>
                            ${contexts?.map((c, i) => `
                                <div class="nav-item${i === 0 ? ' active' : ''}" data-ctx="${c.id}">
                                    <span class="nav-icon">📋</span>
                                    <span>${escapeHtml(c.name)}</span>
                                    <button class="btn-icon btn-delete-ctx" data-id="${c.id}">✕</button>
                                </div>
                            `).join('') || ''}
                            <button class="btn-link" id="btnAddCtx">+ Add Context</button>
                        </div>
                    </nav>
                </aside>
                <main class="content">
                    <div class="content-header">
                        <h2>Feature Flags</h2>
                        <button class="btn-primary" id="btnAddFlag">+ New Flag</button>
                    </div>
                    <div class="flags-list">
                        ${!flags || flags.length === 0 ? '<p class="empty">No flags yet</p>' :
                        flags.map(f => {
                            const strategies = allStrategies[f.id] || [];
                            return `
                            <div class="flag-card" data-id="${f.id}">
                                <div class="flag-info">
                                    <h3>${escapeHtml(f.name)}</h3>
                                    <code>${escapeHtml(f.key)}</code>
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
    document.getElementById('btnAddEnv').onclick = showCreateEnvironment;
    document.getElementById('btnAddCtx').onclick = showCreateContext;
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
}

async function renderFlag(container) {
    let flag = null, environments = [], strategies = [];
    try {
        const flags = await api(`/projects/${state.currentProjectId}/flags`);
        flag = flags.find(f => f.id === state.currentFlagId);
        environments = await api(`/projects/${state.currentProjectId}/environments`);
strategies = await api(`/flags/${state.currentFlagId}/strategies`);
    } catch(e) { console.error('Error loading flag data:', e); }

    container.innerHTML = `
        <div class="page flag-page">
            <header class="page-header">
                <button class="btn-back" id="btnBack">← Back to Project</button>
                <h1>${escapeHtml(flag?.name || 'Flag')}</h1>
                <code class="flag-key-badge">${escapeHtml(flag?.key || '')}</code>
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
                    <p class="flag-description">${escapeHtml(flag?.description || 'No description')}</p>
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
                                                ${type === 'TARGETING' ? `<span class="strategy-detail">${strategy.rolloutPercentage}% for context #${strategy.contextDefinitionId}</span>` : ''}
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

async function deleteStrategyForEnv(envId) {
    if (!confirm('Delete strategy for this environment?')) return;
    try {
        const strategies = await api(`/flags/${state.currentFlagId}/strategies`);
        const existing = strategies.find(s => s.environmentId === envId);
        if (existing) {
            await api(`/strategies/${existing.id}`, 'DELETE');
            render();
        }
    } catch(e) { alert(e.message); }
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

    let contexts = [];
    try { contexts = await api(`/projects/${state.currentProjectId}/contexts`); } catch(e) {}

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
                ${type === 'GRADUAL' ? `<input type="number" id="strPct" value="${percentage}" min="0" max="100" placeholder="Percentage">` : ''}
                ${type === 'TARGETING' ? `
                    <select id="strCtx"><option value="">Select context</option>${contexts.map(c => `<option value="${c.id}" ${c.id == contextDefinitionId ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
                    <input type="text" id="strValues" value='${contextValuesJson}' placeholder='Values JSON, e.g. ["user1","user2"]'>
                    <input type="number" id="strPct" value="${rolloutPercentage}" min="0" max="100" placeholder="Rollout %">
                ` : ''}
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
        if (t === 'GRADUAL') opts.innerHTML = `<input type="number" id="strPct" value="50" min="0" max="100" placeholder="Percentage">`;
        else if (t === 'TARGETING') opts.innerHTML = `
            <select id="strCtx"><option value="">Select context</option>${contexts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
            <input type="text" id="strValues" value='["value1","value2"]' placeholder='Values JSON'>
            <input type="number" id="strPct" value="100" min="0" max="100" placeholder="Rollout %">
        `;
        else opts.innerHTML = '';
    });

    document.getElementById('modal').classList.remove('hidden');
};

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
        body.contextDefinitionId = parseInt(document.getElementById('strCtx').value) || null;
        body.contextValuesJson = document.getElementById('strValues').value;
        body.rolloutPercentage = parseFloat(document.getElementById('strPct').value);
    }

    try {
        const strategies = await api(`/flags/${state.currentFlagId}/strategies`);
        const existing = strategies.find(s => s.environmentId === envId);
        if (existing) {
            await api(`/strategies/${existing.id}`, 'PUT', body);
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
            await api(`/strategies/${existing.id}`, 'PUT', { enabled });
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
            await api(`/strategies/${existing.id}`, 'PUT', { enabled });
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
        closeModal();
        render();
    } catch(e) { alert(e.message); }
}

async function deleteProject(id) {
    if (!confirm('Delete project?')) return;
    try { await api(`/projects/${id}`, 'DELETE'); render(); } catch(e) { alert(e.message); }
}

function editProject(id) {
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
    try { await api(`/projects/${id}`, 'PUT', { name, description }); closeModal(); render(); } catch(e) { alert(e.message); }
}

function openProject(id) { setState('project', id, null); render(); }
function openFlag(id) { setState('flag', state.currentProjectId, id); render(); }

function showCreateEnvironment() {
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

async function createEnvironment() {
    const name = document.getElementById('envName').value.trim();
    if (!name) return alert('Name required');
    try { await api(`/projects/${state.currentProjectId}/environments`, 'POST', { name }); closeModal(); render(); } catch(e) { alert(e.message); }
}

function showCreateContext() {
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

async function createContext() {
    const name = document.getElementById('ctxName').value.trim();
    const description = document.getElementById('ctxDesc').value.trim();
    if (!name) return alert('Name required');
    try { await api(`/projects/${state.currentProjectId}/contexts`, 'POST', { name, description }); closeModal(); render(); } catch(e) { alert(e.message); }
}

function showCreateFlag() {
    document.getElementById('modal').innerHTML = `
        <div class="modal-content">
            <h2>Create Flag</h2>
            <input type="text" id="flagName" placeholder="Name">
            <input type="text" id="flagKey" placeholder="Key (e.g. new-feature)">
            <textarea id="flagDesc" placeholder="Description"></textarea>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="createFlag()">Create</button>
            </div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

async function createFlag() {
    const name = document.getElementById('flagName').value.trim();
    const key = document.getElementById('flagKey').value.trim();
    const description = document.getElementById('flagDesc').value.trim();
    if (!name || !key) return alert('Name and key required');
    try { await api(`/projects/${state.currentProjectId}/flags`, 'POST', { name, key, description }); closeModal(); render(); } catch(e) { alert(e.message); }
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

function closeModal() { document.getElementById('modal').classList.add('hidden'); }

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', render);