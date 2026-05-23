const API_BASE = '/api/v1';

let currentView = 'projects';
let currentProjectId = null;
let currentFlagId = null;
let editingEnvId = null;
let editingCtxId = null;
let editingTagId = null;

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
    let project, environments, contexts, flags, tags, allStrategies = {};
    try {
        project = await api(`/projects/${state.currentProjectId}`);
        environments = await api(`/projects/${state.currentProjectId}/environments`);
        contexts = await api(`/projects/${state.currentProjectId}/contexts`);
        flags = await api(`/projects/${state.currentProjectId}/flags`);
        tags = await api(`/projects/${state.currentProjectId}/tags`);
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
                            const flagTags = (f.tags || []).map(t => tags.find(tag => tag.id === t.id || tag.id === t || tag.id === t.tagId)).filter(Boolean);
                            return `
                            <div class="flag-card" data-id="${f.id}">
                                <div class="flag-info">
                                    <h3>${escapeHtml(f.name)}</h3>
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
            item.onclick = (e) => { if (!e.target.classList.contains('btn-icon')) editingEnvId = parseInt(item.dataset.env); editingCtxId = null; editingTagId = null; render(); };
        } else if (item.dataset.ctx) {
            item.onclick = (e) => { if (!e.target.classList.contains('btn-icon')) editingCtxId = parseInt(item.dataset.ctx); editingEnvId = null; editingTagId = null; render(); };
        } else if (item.dataset.tag) {
            item.onclick = (e) => { if (!e.target.classList.contains('btn-icon')) editingTagId = parseInt(item.dataset.tag); editingEnvId = null; editingCtxId = null; render(); };
        }
    });
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
            const description = document.getElementById('editTagDesc')?.value.trim() || '';
            const color = document.getElementById('editTagColor').value;
            if (!name) return;
            await api(`/projects/${state.currentProjectId}/tags/${btn.dataset.id}`, 'PUT', { name, description, color });
            editingTagId = null;
            render();
        };
    });
    document.querySelectorAll('.btn-cancel-edit').forEach(btn => {
        btn.onclick = () => { editingEnvId = null; editingCtxId = null; editingTagId = null; render(); };
    });
}

async function renderFlag(container) {
    let flag = null, environments = [], strategies = [], tags = [];
    try {
        const flags = await api(`/projects/${state.currentProjectId}/flags`);
        flag = flags.find(f => f.id === state.currentFlagId);
        environments = await api(`/projects/${state.currentProjectId}/environments`);
        strategies = await api(`/flags/${state.currentFlagId}/strategies`);
        tags = await api(`/projects/${state.currentProjectId}/tags`);
    } catch(e) { console.error('Error loading flag data:', e); }

    const isEditing = window.editingFlagId === state.currentFlagId;

    container.innerHTML = `
        <div class="page flag-page">
            <header class="page-header">
                <button class="btn-back" id="btnBack">← Back to Project</button>
                ${isEditing ? `
                    <input type="text" id="editFlagName" value="${escapeHtml(flag?.name || '')}" class="header-edit-input">
                    <input type="text" id="editFlagKey" value="${escapeHtml(flag?.key || '')}" class="header-edit-input">
                    <button class="btn-primary btn-sm" onclick="saveFlagEdit()">Save</button>
                    <button class="btn-secondary btn-sm" onclick="cancelFlagEdit()">Cancel</button>
                ` : `
                    <h1>${escapeHtml(flag?.name || 'Flag')}</h1>
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
    const tagIds = [...document.querySelectorAll('.flag-tag-check:checked')].map(c => parseInt(c.value));
    if (!name || !key) return alert('Name and key required');
    try {
        await api(`/projects/${state.currentProjectId}/flags/${state.currentFlagId}`, 'PUT', { name, key, description, tagIds });
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
                ${type === 'GRADUAL' ? `
                    <div class="slider-group">
                        <input type="range" id="strPct" min="0" max="100" value="${percentage}">
                        <span class="slider-value">${percentage}%</span>
                    </div>
                ` : ''}
                ${type === 'TARGETING' ? `
                    <select id="strCtx"><option value="">Select context</option>${contexts.map(c => `<option value="${c.id}" ${c.id == contextDefinitionId ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
                    <input type="text" id="strValues" value='${contextValuesJson}' placeholder='Values JSON, e.g. ["user1","user2"]'>
                    <div class="slider-group">
                        <input type="range" id="strPct" min="0" max="100" value="${rolloutPercentage}">
                        <span class="slider-value">${rolloutPercentage}%</span>
                    </div>
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
        if (t === 'GRADUAL') opts.innerHTML = `
            <div class="slider-group">
                <input type="range" id="strPct" min="0" max="100" value="50">
                <span class="slider-value">50%</span>
            </div>
        `;
        else if (t === 'TARGETING') opts.innerHTML = `
            <select id="strCtx"><option value="">Select context</option>${contexts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
            <input type="text" id="strValues" value='["value1","value2"]' placeholder='Values JSON'>
            <div class="slider-group">
                <input type="range" id="strPct" min="0" max="100" value="100">
                <span class="slider-value">100%</span>
            </div>
        `;
        else opts.innerHTML = '';
        setupSliderListeners();
    });

    document.getElementById('modal').classList.remove('hidden');
    setupSliderListeners();
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
    try { await api(`/projects/${state.currentProjectId}/flags`, 'POST', { name, key, description, tags: tagValues }); window.closeModal(); render(); } catch(e) { alert(e.message); }
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', render);