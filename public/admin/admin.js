(() => {
  const state = { resources: [], current: null, fields: [], page: 1, limit: 10, total: 0, data: [] };

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, props = {}, children = []) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    children.forEach((c) => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  };

  async function api(path, opts) {
    const res = await fetch(`/admin/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  }

  async function loadResources() {
    const { resources } = await api('/meta');
    state.resources = resources;
    const wrap = $('#resources');
    wrap.innerHTML = '';
    resources.forEach((r) => {
      const item = el('div', { className: `resource${state.current === r.name ? ' active' : ''}` });
      item.textContent = r.label || r.name;
      item.onclick = () => selectResource(r.name);
      wrap.appendChild(item);
    });
  }

  async function loadFields(resource) {
    const { fields } = await api(`/${resource}/meta`);
    state.fields = fields;
  }

  function renderList() {
    const list = $('#list');
    if (!state.data.length) { list.innerHTML = '<div class="muted">No data</div>'; return; }
    const cols = ['_id', ...state.fields.filter(f => f.path !== '_id').map(f => f.path)].slice(0, 6);
    const table = el('table');
    const thead = el('thead');
    const trh = el('tr');
    cols.concat(['actions']).forEach((c) => trh.appendChild(el('th', { textContent: c }))); 
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = el('tbody');
    state.data.forEach((row) => {
      const tr = el('tr');
      cols.forEach((c) => tr.appendChild(el('td', { textContent: formatVal(row[c]) })));
      const actions = el('td');
      const editBtn = el('button', { textContent: 'Edit' });
      editBtn.onclick = () => showForm(row);
      const delBtn = el('button', { textContent: 'Delete', style: 'margin-left:6px' });
      delBtn.onclick = async () => { if (confirm('Delete record?')) { await api(`/${state.current}/${row._id}`, { method: 'DELETE' }); await refresh(); }};
      actions.appendChild(editBtn); actions.appendChild(delBtn);
      tr.appendChild(actions);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    list.innerHTML = '';
    list.appendChild(table);
    $('#pageInfo').textContent = `Page ${state.page} — ${state.total} total`;
  }

  function formatVal(v) {
    if (v == null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  function showForm(row) {
    const form = $('#form');
    form.classList.remove('hidden');
    const fields = state.fields.filter(f => !['_id', '__v'].includes(f.path));
    const readOnly = new Set(['_id', 'createdAt', 'updatedAt', 'password']);
    form.innerHTML = '';
    const grid = el('div', { className: 'form-grid' });
    fields.forEach((f) => {
      const label = el('label', { textContent: f.path });
      let input;
      if (f.enumValues && f.enumValues.length) {
        input = el('select');
        f.enumValues.forEach((opt) => input.appendChild(el('option', { value: opt, textContent: opt })));
      } else if (f.type === 'boolean') {
        input = el('select'); ['false','true'].forEach((opt) => input.appendChild(el('option', { value: opt, textContent: opt })));
      } else {
        input = el('input', { type: 'text' });
      }
      input.value = row ? (row[f.path] ?? '') : '';
      input.disabled = readOnly.has(f.path);
      input.dataset.path = f.path;
      grid.appendChild(label); grid.appendChild(input);
    });
    const save = el('button', { textContent: row ? 'Update' : 'Create' });
    save.onclick = async () => {
      const payload = {};
      grid.querySelectorAll('[data-path]').forEach((inp) => { payload[inp.dataset.path] = parseVal(inp.value); });
      try {
        if (row) await api(`/${state.current}/${row._id}`, { method: 'PUT', body: JSON.stringify(payload) });
        else await api(`/${state.current}`, { method: 'POST', body: JSON.stringify(payload) });
        $('#error').textContent = '';
        await refresh();
        form.classList.add('hidden');
      } catch (e) {
        $('#error').textContent = e.message || 'Failed';
      }
    };
    form.appendChild(grid);
    form.appendChild(el('div', { style: 'margin-top:8px' }, [save]));
  }

  function parseVal(v){
    if (v === 'true') return true; if (v === 'false') return false; if (v === '') return undefined;
    const n = Number(v); if (!Number.isNaN(n) && String(n) === v) return n; return v;
  }

  async function refresh() {
    if (!state.current) return;
    const q = $('#search').value.trim();
    const { data, total } = await api(`/${state.current}?page=${state.page}&limit=${state.limit}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
    state.data = data; state.total = total;
    renderList();
  }

  async function selectResource(name) {
    state.current = name; state.page = 1; $('#search').value = '';
    await loadFields(name);
    await refresh();
    loadResources();
  }

  $('#refresh').onclick = refresh;
  $('#new').onclick = () => showForm(null);
  $('#prev').onclick = async () => { if (state.page > 1) { state.page--; await refresh(); } };
  $('#next').onclick = async () => { const max = Math.ceil(state.total / state.limit) || 1; if (state.page < max) { state.page++; await refresh(); } };
  $('#search').onkeydown = (e) => { if (e.key === 'Enter') refresh(); };

  loadResources().then(() => { if (state.resources[0]) selectResource(state.resources[0].name); });
})();
