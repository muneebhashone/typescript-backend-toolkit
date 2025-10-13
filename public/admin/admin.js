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
    // cache relation labels: key => label, where key = `${resource}:${id}`
    labelCache: Object.create(null),
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
    const fieldByPath = Object.fromEntries(
      state.fields.map((f) => [f.path, f]),
    );
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
      cols.forEach((c) => {
        const f = fieldByPath[c];
        tr.appendChild(el('td', { textContent: formatCell(row[c], f) }));
      });
      const actions = el('td', { style: 'display: flex;' });
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

  function formatCell(v, field) {
    if (!field) return formatVal(v);
    if (field.type === 'relation' && field.relation) {
      if (v == null) return '';
      const res = field.relation.resource;
      if (Array.isArray(v)) {
        const labels = v
          .map((id) => state.labelCache[`${res}:${id}`] || String(id))
          .filter(Boolean);
        return labels.slice(0, 3).join(', ') + (labels.length > 3 ? ' …' : '');
      }
      return state.labelCache[`${res}:${v}`] || String(v);
    }
    return formatVal(v);
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
      } else if (type === 'relation' && f.relation) {
        input = createRelationEditor(f, row ? row[f.path] : undefined);
      } else if (type === 'subdocument' && Array.isArray(f.children)) {
        if (f.isArray) {
          input = createSubdocArrayEditor(f, row ? row[f.path] : undefined);
        } else {
          input = createSubdocEditor(f, row ? row[f.path] : undefined);
        }
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
        } else if (type === 'relation' && f.relation) {
          // Value is controlled by relation editor (hidden input maintains value)
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
      if (type === 'relation' && f.relation) {
        // disable search when readOnly
        if (readOnly.has(f.path)) {
          const controls = input.querySelectorAll('input,button');
          controls.forEach((c) => (c.disabled = true));
        }
      } else if (type === 'subdocument' && Array.isArray(f.children)) {
        if (readOnly.has(f.path)) {
          const controls = input.querySelectorAll(
            'input,button,select,textarea',
          );
          controls.forEach((c) => (c.disabled = true));
        }
      } else {
        input.value = val;
        input.disabled = readOnly.has(f.path);
        input.dataset.path = f.path;
        input.dataset.type = type;
        input.dataset.isArray = f.isArray ? '1' : '0';
        input.dataset.isFile = isFile ? '1' : '0';
      }
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
    if (type === 'subdocument') {
      try {
        return JSON.parse(v);
      } catch {
        throw new Error('Invalid JSON for subdocument field');
      }
    }
    if (type === 'mixed' || type === 'relation') return v; // keep as-is (relation handled upstream)
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
    await batchLoadRelationLabels();
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

  // Helpers for relation fields
  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), ms);
    };
  }

  async function batchLoadRelationLabels() {
    const relFields = state.fields.filter(
      (f) => f.type === 'relation' && f.relation,
    );
    const tasks = relFields.map(async (f) => {
      const ids = new Set();
      for (const row of state.data) {
        const v = row[f.path];
        if (Array.isArray(v)) v.forEach((id) => ids.add(String(id)));
        else if (v != null) ids.add(String(v));
      }
      const missing = Array.from(ids).filter(
        (id) => !state.labelCache[`${f.relation.resource}:${id}`],
      );
      if (!missing.length) return;
      const resp = await api(
        `/${state.current}/lookup/${encodeURIComponent(f.path)}?ids=${missing.join(',')}`,
      );
      (resp.options || []).forEach((opt) => {
        state.labelCache[`${f.relation.resource}:${opt._id}`] = opt.label;
      });
    });
    await Promise.all(tasks);
  }

  function createRelationEditor(field, rawVal) {
    const isMulti = !!field.isArray;
    const container = el('div', {
      style: 'display:flex; flex-direction: column; gap:6px;',
    });
    const hidden = el('input', { type: 'hidden' });
    // Set dataset on the hidden input so payload builder can read it
    hidden.dataset.path = field.path;
    hidden.dataset.type = 'relation';
    hidden.dataset.isArray = isMulti ? '1' : '0';
    hidden.dataset.isFile = '0';

    const search = el('input', { type: 'text', placeholder: 'Search…' });
    const results = el('div', {
      style:
        'border:1px solid var(--border); background: var(--bg); border-radius: 6px; display:none;',
    });
    const chips = el('div', {
      style: 'display:flex; gap:6px; flex-wrap:wrap;',
    });
    // Will be assigned later (after the row is created). Used to toggle the Clear row visibility
    let updateRowVisibility = () => {};

    function setHidden(val) {
      if (isMulti) hidden.value = JSON.stringify(val);
      else hidden.value = val || '';
    }

    function renderChips(items) {
      chips.innerHTML = '';
      items.forEach((it) => {
        const chip = el(
          'span',
          {
            style:
              'padding:4px 8px; border:1px solid var(--border); border-radius:12px; background: var(--panel);',
          },
          [`${it.label} `],
        );
        const btn = el('button', {
          textContent: '×',
          style:
            'margin-left:6px; background: transparent; color: var(--muted); border: 1px solid var(--border); padding:0 6px;',
        });
        btn.onclick = () => {
          selected = selected.filter((s) => s._id !== it._id);
          setHidden(selected.map((s) => s._id));
          renderChips(selected);
        };
        chip.appendChild(btn);
        chips.appendChild(chip);
      });
    }

    function showResults(items) {
      results.innerHTML = '';
      items.forEach((opt) => {
        const row = el(
          'div',
          {
            style:
              'padding:8px 10px; cursor:pointer; border-bottom:1px solid var(--border);',
          },
          [opt.label],
        );
        row.onclick = () => {
          if (isMulti) {
            if (!selected.find((s) => s._id === opt._id)) selected.push(opt);
            setHidden(selected.map((s) => s._id));
            renderChips(selected);
          } else {
            selected = [opt];
            setHidden(opt._id);
            selectedLabel.textContent = opt.label;
          }
          results.style.display = 'none';
          search.value = '';
          // Toggle Clear button visibility when selection changes
          updateRowVisibility();
        };
        results.appendChild(row);
      });
      results.style.display = items.length ? 'block' : 'none';
    }

    const selectedLabel = el('div', {
      className: 'muted',
      style:
        'color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;',
    });
    let selected = [];

    // Initialize from raw value
    (async () => {
      if (rawVal == null) {
        setHidden(isMulti ? [] : '');
        // ensure UI reflects empty selection
        queueMicrotask(() => updateRowVisibility());
        return;
      }
      if (isMulti && Array.isArray(rawVal)) {
        const ids = rawVal.map(String);
        const missing = ids.filter(
          (id) => !state.labelCache[`${field.relation.resource}:${id}`],
        );
        if (missing.length) {
          const resp = await api(
            `/${state.current}/lookup/${encodeURIComponent(field.path)}?ids=${missing.join(',')}`,
          );
          (resp.options || []).forEach((opt) => {
            state.labelCache[`${field.relation.resource}:${opt._id}`] =
              opt.label;
          });
        }
        selected = ids.map((id) => ({
          _id: id,
          label: state.labelCache[`${field.relation.resource}:${id}`] || id,
        }));
        renderChips(selected);
        setHidden(ids);
      } else if (!isMulti && typeof rawVal === 'string') {
        const id = String(rawVal);
        if (!state.labelCache[`${field.relation.resource}:${id}`]) {
          const resp = await api(
            `/${state.current}/lookup/${encodeURIComponent(field.path)}?ids=${id}`,
          );
          (resp.options || []).forEach((opt) => {
            state.labelCache[`${field.relation.resource}:${opt._id}`] =
              opt.label;
          });
        }
        const label =
          state.labelCache[`${field.relation.resource}:${id}`] || id;
        selected = [{ _id: id, label }];
        selectedLabel.textContent = label;
        setHidden(id);
      }
      // defer until the row exists in DOM
      queueMicrotask(() => updateRowVisibility());
    })();

    const doSearch = debounce(async () => {
      const q = search.value.trim();
      if (!q) {
        results.style.display = 'none';
        results.innerHTML = '';
        return;
      }
      try {
        const resp = await api(
          `/${state.current}/lookup/${encodeURIComponent(field.path)}?q=${encodeURIComponent(q)}`,
        );
        showResults(resp.options || []);
      } catch {
        results.style.display = 'none';
      }
    }, 250);
    search.oninput = doSearch;

    if (isMulti) {
      container.appendChild(chips);
    } else {
      const clearBtn = el('button', {
        textContent: 'Clear',
        style:
          'width:max-content; background: transparent; color: var(--text); border: 1px solid var(--border);',
      });
      clearBtn.onclick = () => {
        selected = [];
        selectedLabel.textContent = '';
        setHidden('');
        updateRowVisibility();
      };
      const row = el(
        'div',
        { style: 'display:none; gap:8px; align-items:center;' },
        [selectedLabel, clearBtn],
      );
      // Assign the toggler now that row exists
      updateRowVisibility = () => {
        row.style.display = selected.length ? 'flex' : 'none';
      };
      container.appendChild(row);
      // Ensure correct initial visibility after any async initialization
      queueMicrotask(() => updateRowVisibility());
    }
    container.appendChild(search);
    container.appendChild(results);
    container.appendChild(hidden);
    return container;
  }

  // Subdocument (single) editor
  function createSubdocEditor(field, rawVal) {
    const container = el('div', {
      style:
        'display:flex; flex-direction: column; gap:8px; border:1px solid var(--border); padding:10px; border-radius:6px;',
    });
    const hidden = el('input', { type: 'hidden' });
    hidden.dataset.path = field.path;
    hidden.dataset.type = 'subdocument';
    hidden.dataset.isArray = '0';
    hidden.dataset.isFile = '0';

    const childWrap = el('div', { className: 'form-grid' });
    const value = rawVal && typeof rawVal === 'object' ? rawVal : {};

    const childControls = [];
    field.children.forEach((cf) => {
      const label = el('label', { textContent: cf.path });
      let input;
      if (cf.type === 'relation' && cf.relation)
        input = createRelationEditor(
          { ...cf, path: `${field.path}.${cf.path}` },
          value[cf.path],
        );
      else if (cf.type === 'subdocument' && Array.isArray(cf.children)) {
        if (cf.isArray)
          input = createSubdocArrayEditor(
            { ...cf, path: `${field.path}.${cf.path}` },
            value[cf.path],
          );
        else
          input = createSubdocEditor(
            { ...cf, path: `${field.path}.${cf.path}` },
            value[cf.path],
          );
      } else if (cf.enumValues && cf.enumValues.length) {
        input = el('select');
        input.appendChild(el('option', { value: '', textContent: '' }));
        cf.enumValues.forEach((opt) =>
          input.appendChild(el('option', { value: opt, textContent: opt })),
        );
        input.value = value[cf.path] != null ? String(value[cf.path]) : '';
      } else if (cf.type === 'boolean') {
        input = el('select');
        ['false', 'true'].forEach((opt) =>
          input.appendChild(el('option', { value: opt, textContent: opt })),
        );
        input.value = value[cf.path] ? 'true' : 'false';
      } else if (cf.type === 'number') {
        input = el('input', {
          type: 'number',
          step: 'any',
          value: value[cf.path] != null ? String(value[cf.path]) : '',
        });
      } else if (cf.type === 'date') {
        input = el('input', {
          type: 'datetime-local',
          value: value[cf.path] ? toDatetimeLocal(value[cf.path]) : '',
        });
      } else if (cf.type === 'array') {
        input = el('textarea', {
          rows: 3,
          placeholder: '[ ... ]',
          value: Array.isArray(value[cf.path])
            ? JSON.stringify(value[cf.path], null, 2)
            : '',
        });
      } else {
        input = el('input', {
          type: 'text',
          value: value[cf.path] != null ? String(value[cf.path]) : '',
        });
      }
      const childPath = `${field.path}.${cf.path}`;
      if (!(cf.type === 'relation' && cf.relation)) {
        input.dataset.path = childPath;
        input.dataset.type = cf.type;
        input.dataset.isArray = cf.isArray ? '1' : '0';
        input.dataset.isFile = '0';
      }
      childControls.push({ def: cf, elem: input, path: childPath });
      childWrap.appendChild(label);
      childWrap.appendChild(input);
    });

    function syncHidden() {
      const obj = {};
      for (const item of childControls) {
        const cf = item.def;
        const ctrl = item.elem;
        const p = item.path.split('.').slice(-1)[0];
        if (cf.type === 'relation') {
          const hid =
            ctrl.querySelector &&
            ctrl.querySelector(
              `input[type="hidden"][data-path="${item.path}"]`,
            );
          obj[p] = hid ? hid.value : undefined;
        } else if (
          ctrl.tagName === 'TEXTAREA' &&
          (cf.type === 'array' || (cf.isArray && cf.type !== 'subdocument'))
        ) {
          try {
            const parsed = JSON.parse(ctrl.value || '[]');
            obj[p] = parsed;
          } catch {}
        } else if (ctrl.type === 'number')
          obj[p] = ctrl.value === '' ? undefined : Number(ctrl.value);
        else if (ctrl.type === 'datetime-local')
          obj[p] = ctrl.value ? fromDatetimeLocal(ctrl.value) : undefined;
        else if (ctrl.tagName === 'SELECT' && cf.type === 'boolean')
          obj[p] = ctrl.value === 'true';
        else if (cf.type === 'subdocument') {
          const hid =
            ctrl.querySelector &&
            ctrl.querySelector('input[type="hidden"][data-type="subdocument"]');
          if (hid) {
            try {
              obj[p] = JSON.parse(hid.value || '{}');
            } catch {}
          }
        } else obj[p] = ctrl.value === '' ? undefined : ctrl.value;
      }
      hidden.value = JSON.stringify(obj);
    }

    childWrap.addEventListener('input', syncHidden, true);
    syncHidden();

    container.appendChild(childWrap);
    container.appendChild(hidden);
    return container;
  }

  // Subdocument array (repeater) editor
  function createSubdocArrayEditor(field, rawVal) {
    const container = el('div', {
      style:
        'display:flex; flex-direction: column; gap:8px; border:1px dashed var(--border); padding:10px; border-radius:6px;',
    });
    const hidden = el('input', { type: 'hidden' });
    hidden.dataset.path = field.path;
    hidden.dataset.type = 'subdocument';
    hidden.dataset.isArray = '1';
    hidden.dataset.isFile = '0';

    const itemsWrap = el('div', {
      style: 'display:flex; flex-direction: column; gap:8px;',
    });
    const addBtn = el('button', {
      textContent: 'Add item',
      style: 'width:max-content;',
    });

    let items = Array.isArray(rawVal) ? rawVal : [];

    function render() {
      itemsWrap.innerHTML = '';
      items.forEach((it, idx) => {
        const row = el('div', {
          style:
            'border:1px solid var(--border); border-radius:6px; padding:8px;',
        });
        const header = el(
          'div',
          {
            style:
              'display:flex; justify-content: space-between; align-items:center; margin-bottom:6px;',
          },
          [
            el('span', { className: 'muted', textContent: `Item ${idx + 1}` }),
            (() => {
              const btn = el('button', {
                textContent: 'Remove',
                style:
                  'background: transparent; color: var(--danger); border:1px solid var(--border);',
              });
              btn.onclick = () => {
                items.splice(idx, 1);
                syncHidden();
                render();
              };
              return btn;
            })(),
          ],
        );
        const editor = createSubdocEditor({ ...field, isArray: false }, it);
        row.appendChild(header);
        row.appendChild(editor);
        itemsWrap.appendChild(row);
      });
    }

    function syncHidden() {
      try {
        const arr = [];
        const rows = itemsWrap.querySelectorAll(
          'input[type="hidden"][data-type="subdocument"][data-is-array="0"]',
        );
        rows.forEach((h) => {
          try {
            const val = JSON.parse(h.value || '{}');
            arr.push(val);
          } catch {}
        });
        hidden.value = JSON.stringify(arr);
      } catch {}
    }

    itemsWrap.addEventListener('input', syncHidden, true);

    addBtn.onclick = () => {
      items.push({});
      render();
      syncHidden();
    };

    render();
    syncHidden();
    container.appendChild(itemsWrap);
    container.appendChild(addBtn);
    container.appendChild(hidden);
    return container;
  }
})();
