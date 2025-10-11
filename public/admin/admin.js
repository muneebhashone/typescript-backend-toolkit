(() => {
  const state = {
    resources: [],
    current: null,
    fields: [],
    fileFields: [],
    page: 1,
    limit: 10,
    total: 0,
    data: [],
  };

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, props = {}, children = []) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    children.forEach((c) =>
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c),
    );
    return e;
  };

  function openModal(title) {
    const m = $('#modal');
    const t = $('#modalTitle');
    if (t) t.textContent = title || '';
    if (m) m.classList.remove('hidden');
  }

  function closeModal() {
    const m = $('#modal');
    const f = $('#form');
    if (f) f.innerHTML = '';
    if (m) m.classList.add('hidden');
  }

  async function api(path, opts = {}) {
    const isFormData =
      opts &&
      opts.body &&
      typeof FormData !== 'undefined' &&
      opts.body instanceof FormData;
    const baseHeaders = isFormData
      ? {}
      : { 'Content-Type': 'application/json' };
    const headers = { ...baseHeaders, ...(opts.headers || {}) };
    const res = await fetch(`/admin/api${path}`, { ...opts, headers });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  }

  function toDatetimeLocal(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  function fromDatetimeLocal(value) {
    if (!value) return undefined;
    const d = new Date(value);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }

  async function loadResources() {
    const { resources } = await api('/meta');
    state.resources = resources;
    const wrap = $('#resources');
    wrap.innerHTML = '';
    resources.forEach((r) => {
      const item = el('div', {
        className: `resource${state.current === r.name ? ' active' : ''}`,
      });
      item.textContent = r.label || r.name;
      item.onclick = () => selectResource(r.name);
      wrap.appendChild(item);
    });
  }

  async function loadFields(resource) {
    const { fields, fileFields } = await api(`/${resource}/meta`);
    state.fields = fields;
    state.fileFields = fileFields || [];
  }

  function renderList() {
    const list = $('#list');
    if (!state.data.length) {
      list.innerHTML =
        '<div class="muted" style="padding: 16px;">No data</div>';
      return;
    }
    const cols = [
      '_id',
      ...state.fields.filter((f) => f.path !== '_id').map((f) => f.path),
    ].slice(0, 6);
    const table = el('table');
    const thead = el('thead');
    const trh = el('tr');
    cols
      .concat(['actions'])
      .forEach((c) => trh.appendChild(el('th', { textContent: c })));
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = el('tbody');
    state.data.forEach((row) => {
      const tr = el('tr');
      cols.forEach((c) =>
        tr.appendChild(el('td', { textContent: formatVal(row[c]) })),
      );
      const actions = el('td');
      const editBtn = el('button', { textContent: 'Edit' });
      editBtn.onclick = () => showForm(row);
      const delBtn = el('button', {
        textContent: 'Delete',
        style: 'margin-left:6px',
      });
      delBtn.onclick = async () => {
        if (confirm('Delete record?')) {
          await api(`/${state.current}/${row._id}`, { method: 'DELETE' });
          await refresh();
        }
      };
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
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
    openModal(row ? 'Edit record' : 'Create record');
    const fields = state.fields.filter((f) => !['_id', '__v'].includes(f.path));
    const readOnly = new Set(['_id', 'createdAt', 'updatedAt', 'password']);
    form.innerHTML = '';
    const grid = el('div', { className: 'form-grid' });
    fields.forEach((f) => {
      const label = el('label', { textContent: f.path });
      const type = f.type;
      let input;
      const isFile =
        Array.isArray(state.fileFields) && state.fileFields.includes(f.path);
      if (isFile) {
        input = el('input', { type: 'file' });
      } else if (f.enumValues && f.enumValues.length) {
        input = el('select');
        input.appendChild(el('option', { value: '', textContent: '' }));
        f.enumValues.forEach((opt) =>
          input.appendChild(el('option', { value: opt, textContent: opt })),
        );
      } else if (type === 'boolean') {
        input = el('select');
        ['false', 'true'].forEach((opt) =>
          input.appendChild(el('option', { value: opt, textContent: opt })),
        );
      } else if (type === 'number') {
        input = el('input', { type: 'number', step: 'any' });
      } else if (type === 'date') {
        input = el('input', { type: 'datetime-local' });
      } else if (type === 'array') {
        input = el('textarea', { rows: 3, placeholder: '[ ... ]' });
      } else if (type === 'mixed') {
        input = el('input', { type: 'text' });
      } else {
        input = el('input', { type: 'text' });
      }

      const rawVal = row ? row[f.path] : undefined;
      let val = '';
      if (rawVal != null) {
        if (isFile) {
          val = '';
        } else if (f.enumValues && f.enumValues.length) val = String(rawVal);
        else if (type === 'boolean') val = rawVal ? 'true' : 'false';
        else if (type === 'number') val = String(rawVal);
        else if (type === 'date') val = toDatetimeLocal(rawVal);
        else if (type === 'array')
          val = Array.isArray(rawVal) ? JSON.stringify(rawVal, null, 2) : '';
        else if (type === 'mixed')
          val =
            typeof rawVal === 'object'
              ? JSON.stringify(rawVal)
              : String(rawVal);
        else val = String(rawVal);
      }
      input.value = val;
      input.disabled = readOnly.has(f.path);
      input.dataset.path = f.path;
      input.dataset.type = type;
      input.dataset.isArray = f.isArray ? '1' : '0';
      input.dataset.isFile = isFile ? '1' : '0';
      grid.appendChild(label);
      grid.appendChild(input);
      if (isFile && row && typeof rawVal === 'string' && rawVal) {
        grid.appendChild(
          el('div', { className: 'muted', style: 'grid-column: 1 / -1' }, [
            el('small', { textContent: `Current: ${rawVal}` }),
          ]),
        );
      }
    });
    const save = el('button', { textContent: row ? 'Update' : 'Create' });
    save.onclick = async () => {
      const payload = {};
      const fileInputs = Array.from(
        grid.querySelectorAll('[data-is-file="1"]'),
      );
      const anyFileSelected = fileInputs.some(
        (inp) => inp.files && inp.files.length > 0,
      );
      const useMultipart = anyFileSelected;
      const formData = useMultipart ? new FormData() : null;
      try {
        grid.querySelectorAll('[data-path]').forEach((inp) => {
          const isFile = inp.dataset.isFile === '1';
          const t = inp.dataset.type;
          const isArr = inp.dataset.isArray === '1';
          const path = inp.dataset.path;
          if (isFile) {
            if (useMultipart && inp.files && inp.files[0]) {
              formData.append(path, inp.files[0]);
            }
            return;
          }
          const raw = inp.value;
          const v = parseByType(t, isArr, raw);
          if (useMultipart) {
            if (v !== undefined)
              formData.append(
                path,
                typeof v === 'string' ? v : JSON.stringify(v),
              );
          } else {
            if (v !== undefined) payload[path] = v;
          }
        });
      } catch (e) {
        $('#error').textContent = e.message || 'Invalid input';
        return;
      }
      try {
        if (row) {
          if (useMultipart)
            await api(`/${state.current}/${row._id}`, {
              method: 'PUT',
              body: formData,
            });
          else
            await api(`/${state.current}/${row._id}`, {
              method: 'PUT',
              body: JSON.stringify(payload),
            });
        } else {
          if (useMultipart)
            await api(`/${state.current}`, { method: 'POST', body: formData });
          else
            await api(`/${state.current}`, {
              method: 'POST',
              body: JSON.stringify(payload),
            });
        }
        $('#error').textContent = '';
        await refresh();
        closeModal();
      } catch (e) {
        $('#error').textContent = e.message || 'Failed';
      }
    };
    const cancel = el('button', {
      textContent: 'Cancel',
      style:
        'margin-left:8px; background: transparent; color: var(--text); border: 1px solid var(--border);',
    });
    cancel.onclick = () => closeModal();
    form.appendChild(grid);
    form.appendChild(el('div', { style: 'margin-top:8px' }, [save, cancel]));
  }

  function parseByType(type, isArray, v) {
    if (v === '') return undefined;
    if (type === 'boolean') return v === 'true';
    if (type === 'number') {
      const n = Number(v);
      return Number.isNaN(n) ? v : n;
    }
    if (type === 'date') {
      const iso = fromDatetimeLocal(v);
      return iso ?? v;
    }
    if (type === 'array' || isArray) {
      try {
        const parsed = JSON.parse(v);
        if (!Array.isArray(parsed)) throw new Error('Array expected');
        return parsed;
      } catch {
        throw new Error('Invalid JSON for array field');
      }
    }
    if (type === 'mixed') return v; // keep as string per request
    if (v === 'true') return true;
    if (v === 'false') return false;
    const n = Number(v);
    if (!Number.isNaN(n) && String(n) === v) return n;
    return v;
  }

  async function refresh() {
    if (!state.current) return;
    const q = $('#search').value.trim();
    const { data, total } = await api(
      `/${state.current}?page=${state.page}&limit=${state.limit}${q ? `&q=${encodeURIComponent(q)}` : ''}`,
    );
    state.data = data;
    state.total = total;
    renderList();
  }

  async function selectResource(name) {
    state.current = name;
    state.page = 1;
    $('#search').value = '';
    try {
      localStorage.setItem('admin.currentResource', name);
    } catch {}
    await loadFields(name);
    await refresh();
    loadResources();
  }

  $('#refresh').onclick = refresh;
  $('#new').onclick = () => showForm(null);
  $('#prev').onclick = async () => {
    if (state.page > 1) {
      state.page--;
      await refresh();
    }
  };
  $('#next').onclick = async () => {
    const max = Math.ceil(state.total / state.limit) || 1;
    if (state.page < max) {
      state.page++;
      await refresh();
    }
  };
  $('#search').onkeydown = (e) => {
    if (e.key === 'Enter') refresh();
  };

  const modalClose = $('#modalClose');
  if (modalClose) modalClose.onclick = () => closeModal();
  const modalBackdrop = document.querySelector('#modal .modal-backdrop');
  if (modalBackdrop) modalBackdrop.onclick = () => closeModal();
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#modal').classList.contains('hidden'))
      closeModal();
  });

  loadResources().then(() => {
    const saved = (() => {
      try {
        return localStorage.getItem('admin.currentResource');
      } catch {
        return null;
      }
    })();
    const names = state.resources.map((r) => r.name);
    const pick =
      saved && names.includes(saved)
        ? saved
        : state.resources[0] && state.resources[0].name;
    if (pick) selectResource(pick);
  });
})();
