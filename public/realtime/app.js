(() => {
  const $ = (id) => document.getElementById(id);
  const statusEl = $('status');
  const sidEl = $('sid');
  const transportEl = $('transport');
  const logsEl = $('logs');

  let socket = null;

  const STORAGE_KEY = 'rt.session.v1';
  const LOGS_CAP = 1000;

  const defaultState = () => ({
    settings: {
      ns: '/',
      path: '/socket.io',
      token: '',
      transports: { websocket: true, polling: true },
    },
    payload: { type: 'json', jsonText: '', strText: '' },
    emitTarget: { target: 'socket', room: '' },
    listeners: [], // { id, pattern, enabled }
    rooms: [], // ['room1']
    logs: [], // { dir, event, payload, ts }
    autoReconnect: true,
    connected: false,
  });

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const obj = JSON.parse(raw);
      return { ...defaultState(), ...obj };
    } catch (_) {
      return defaultState();
    }
  }

  let state = loadState();
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      // ignore
    }
  }

  function resetSession() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function setStatus(connected) {
    if (connected) {
      statusEl.textContent = 'Connected';
      statusEl.className = 'badge success';
    } else {
      statusEl.textContent = 'Disconnected';
      statusEl.className = 'badge danger';
    }
    $('disconnect').disabled = !connected;
    $('connect').disabled = !!connected;
    state.connected = !!connected;
    saveState();
  }

  function log(direction, event, payload, options) {
    const persist = options?.persist !== false;
    const ts = options?.ts ?? Date.now();
    const time = new Date(ts).toLocaleTimeString();
    const item = document.createElement('div');
    item.className = `log ${direction}`;
    const pretty =
      typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    item.innerHTML = `<span class="time">${time}</span> <span class="dir">${direction}</span> <span class="event" title="Click to add listener">${event}</span> <pre class="payload">${pretty}</pre>`;
    item.dataset.event = event;
    logsEl.prepend(item);

    // persist log (cap by LOGS_CAP)
    if (persist) {
      try {
        state.logs.push({ dir: direction, event, payload, ts });
        if (state.logs.length > LOGS_CAP)
          state.logs.splice(0, state.logs.length - LOGS_CAP);
        saveState();
      } catch (_) {}
    }

    // highlight if matched by any enabled listener
    const matches = getMatchingListeners(event);
    if (matches.length) {
      item.classList.add('matched');
    }
  }

  function currentOptions() {
    const transports = [];
    if ($('t-websocket').checked) transports.push('websocket');
    if ($('t-polling').checked) transports.push('polling');
    const path = $('path').value || '/socket.io';
    const token = $('token').value.trim();
    const opts = { path, transports };
    if (token) opts.auth = { token };
    return opts;
  }

  function connect() {
    const ns = $('ns').value || '/';
    const opts = currentOptions();
    const url = undefined; // same-origin
    socket = window.io(ns, opts);

    socket.on('connect', () => {
      setStatus(true);
      sidEl.textContent = socket.id;
      transportEl.textContent = socket.io.engine.transport.name;
      log('in', 'connect', { id: socket.id });

      // auto-join rooms from state
      try {
        (state.rooms || []).forEach((r) => {
          if (r) socket.emit('room:join', { room: r });
        });
      } catch (_) {}
    });

    socket.on('disconnect', (reason) => {
      setStatus(false);
      sidEl.textContent = '—';
      transportEl.textContent = '—';
      log('in', 'disconnect', { reason });
    });

    socket.io.engine.on('upgrade', (transport) => {
      transportEl.textContent = transport.name;
      log('in', 'transport-upgrade', { transport: transport.name });
    });

    socket.on('connect_error', (err) => {
      log('in', 'connect_error', { message: err.message });
    });

    socket.on('reconnect_attempt', (n) =>
      log('in', 'reconnect_attempt', { attempt: n }),
    );
    socket.on('reconnect_failed', () => log('in', 'reconnect_failed'));

    socket.on('pong', (data) => log('in', 'pong', data));

    // Rooms acks
    socket.on('room:joined', (data) => {
      log('in', 'room:joined', data);
      if (data?.room && !state.rooms.includes(data.room)) {
        state.rooms.push(data.room);
        saveState();
        renderRooms();
      }
    });
    socket.on('room:left', (data) => {
      log('in', 'room:left', data);
      if (data?.room) {
        state.rooms = state.rooms.filter((r) => r !== data.room);
        saveState();
        renderRooms();
      }
    });

    socket.onAny((event, ...args) => {
      if (event === 'pong') return; // already logged
      log('in', event, args.length > 1 ? args : args[0]);
      // Post-log highlight already handled in log(); nothing else to do
    });
  }

  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  $('connect').addEventListener('click', () => {
    if (socket) socket.disconnect();
    connect();
  });
  $('disconnect').addEventListener('click', () => disconnect());
  $('clear').addEventListener('click', () => {
    logsEl.innerHTML = '';
    state.logs = [];
    saveState();
  });
  $('reset-session').addEventListener('click', () => resetSession());

  $('ping').addEventListener('click', () => {
    if (!socket) return log('out', 'ping', 'not connected');
    const payload = { ts: Date.now() };
    log('out', 'ping', payload);
    socket.emit('ping', payload);
  });

  $('emit').addEventListener('click', () => {
    if (!socket) return log('out', 'emit', 'not connected');
    const event = $('event').value.trim();
    if (!event) return log('out', 'emit', 'missing event name');
    const type =
      document.querySelector('input[name="payload-type"]:checked')?.value ||
      'json';
    let payloadToSend = null;
    if (type === 'json') {
      const text = $('payload').value.trim();
      if (text) {
        try {
          payloadToSend = JSON.parse(text);
        } catch (e) {
          return log('out', event, { error: 'invalid JSON' });
        }
      }
    } else {
      payloadToSend = $('payload-str').value;
    }
    // Determine emit target
    const target =
      document.querySelector('input[name="emit-target"]:checked')?.value ||
      'socket';
    if (target === 'room') {
      const room = $('target-room-name').value.trim();
      if (!room) return log('out', 'emit', { error: 'missing room name' });
      log('out', event, { to: `room:${room}`, payload: payloadToSend });
      socket.emit('room:broadcast', { room, event, payload: payloadToSend });
    } else {
      log('out', event, payloadToSend);
      socket.emit(event, payloadToSend);
    }
  });

  // initial state
  setStatus(false);

  // payload type toggle
  const toggleVisibility = () => {
    const type =
      document.querySelector('input[name="payload-type"]:checked')?.value ||
      'json';
    const isJson = type === 'json';
    const jsonRow = $('row-payload-json');
    const stringRow = $('row-payload-string');
    if (jsonRow) jsonRow.classList.toggle('hidden', !isJson);
    if (stringRow) stringRow.classList.toggle('hidden', isJson);
  };
  ['pt-json', 'pt-string'].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener('change', toggleVisibility);
  });
  toggleVisibility();

  // emit target toggle
  const toggleTargetVisibility = () => {
    const target =
      document.querySelector('input[name="emit-target"]:checked')?.value ||
      'socket';
    const row = $('row-target-room');
    if (row) row.classList.toggle('hidden', target !== 'room');
  };
  ['target-socket', 'target-room'].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener('change', toggleTargetVisibility);
  });
  toggleTargetVisibility();

  // listeners management
  const listenersEl = $('listeners');
  function globToRegExp(glob) {
    const escaped = glob
      .replace(/[.+^${}()|\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp('^' + escaped + '$');
  }
  function getMatchingListeners(event) {
    return (state.listeners || []).filter(
      (l) => l.enabled && globToRegExp(l.pattern).test(event),
    );
  }
  function renderListeners() {
    if (!listenersEl) return;
    listenersEl.innerHTML = '';
    (state.listeners || []).forEach((l) => {
      const row = document.createElement('div');
      row.className = 'listener-item';
      row.dataset.id = l.id;
      const enabledAttr = l.enabled ? 'checked' : '';
      row.innerHTML = `
        <div class="pattern">${l.pattern}</div>
        <div class="controls">
          <label class="checkbox-label"><input type="checkbox" class="listener-toggle" ${enabledAttr} /> <span>Enabled</span></label>
        </div>
        <div class="controls">
          <button class="secondary small listener-remove">Remove</button>
        </div>
      `;
      listenersEl.appendChild(row);
    });
  }
  function addListener(pattern, enabled = true) {
    if (!pattern) return;
    const exists = (state.listeners || []).some((l) => l.pattern === pattern);
    if (exists) return; // avoid duplicates
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
    state.listeners.push({ id, pattern, enabled });
    saveState();
    renderListeners();
  }
  function removeListener(id) {
    state.listeners = (state.listeners || []).filter((l) => l.id !== id);
    saveState();
    renderListeners();
  }
  $('listener-add')?.addEventListener('click', () => {
    const pattern = $('listener-pattern').value.trim();
    if (!pattern) return;
    addListener(pattern, true);
    $('listener-pattern').value = '';
  });
  $('listeners-clear')?.addEventListener('click', () => {
    state.listeners = [];
    saveState();
    renderListeners();
  });
  listenersEl?.addEventListener('change', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!target.classList.contains('listener-toggle')) return;
    const row = target.closest('.listener-item');
    const id = row?.dataset.id;
    if (!id) return;
    const l = state.listeners.find((x) => x.id === id);
    if (!l) return;
    l.enabled = !!target.checked;
    saveState();
  });
  listenersEl?.addEventListener('click', (e) => {
    const btn = e.target;
    if (!(btn instanceof HTMLElement)) return;
    if (!btn.classList.contains('listener-remove')) return;
    const row = btn.closest('.listener-item');
    const id = row?.dataset.id;
    if (!id) return;
    removeListener(id);
  });

  // logs click-to-add listener
  logsEl.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains('event')) return;
    const row = target.closest('.log');
    if (!row || !row.classList.contains('in')) return; // only from inbound events
    const eventName = target.textContent?.trim();
    if (!eventName) return;
    addListener(eventName, true);
  });

  // rooms UI
  const roomsEl = $('rooms');
  function renderRooms() {
    if (!roomsEl) return;
    roomsEl.innerHTML = '';
    (state.rooms || []).forEach((room) => {
      const badge = document.createElement('span');
      badge.className = 'room-badge';
      badge.innerHTML = `<span>${room}</span> <span class="remove" title="Leave">×</span>`;
      badge.querySelector('.remove')?.addEventListener('click', () => {
        // leave via server if connected
        if (socket) socket.emit('room:leave', { room });
        state.rooms = state.rooms.filter((r) => r !== room);
        saveState();
        renderRooms();
      });
      roomsEl.appendChild(badge);
    });
  }
  $('room-join')?.addEventListener('click', () => {
    const room = $('room-input').value.trim();
    if (!room) return;
    if (!state.rooms.includes(room)) state.rooms.push(room);
    saveState();
    renderRooms();
    if (socket) socket.emit('room:join', { room });
    $('room-input').value = '';
  });
  $('room-leave')?.addEventListener('click', () => {
    const room = $('room-input').value.trim();
    if (!room) return;
    state.rooms = state.rooms.filter((r) => r !== room);
    saveState();
    renderRooms();
    if (socket) socket.emit('room:leave', { room });
    $('room-input').value = '';
  });

  // persist and restore settings/payload/emit target
  function restoreUI() {
    // settings
    $('ns').value = state.settings.ns || '/';
    $('path').value = state.settings.path || '/socket.io';
    $('token').value = state.settings.token || '';
    $('t-websocket').checked = !!state.settings.transports.websocket;
    $('t-polling').checked = !!state.settings.transports.polling;
    // payload
    if (state.payload.type === 'string') $('pt-string').checked = true;
    else $('pt-json').checked = true;
    $('payload').value = state.payload.jsonText || '';
    $('payload-str').value = state.payload.strText || '';
    toggleVisibility();
    // emit target
    if (state.emitTarget.target === 'room') $('target-room').checked = true;
    else $('target-socket').checked = true;
    $('target-room-name').value = state.emitTarget.room || '';
    toggleTargetVisibility();
    // listeners & rooms
    renderListeners();
    renderRooms();
    // logs
    if (state.logs?.length) {
      // render from oldest to newest so prepend makes correct order
      const items = state.logs;
      for (
        let i = Math.max(0, items.length - LOGS_CAP);
        i < items.length;
        i++
      ) {
        const entry = items[i];
        log(entry.dir, entry.event, entry.payload, {
          persist: false,
          ts: entry.ts,
        });
      }
    }
  }
  restoreUI();

  // drawer toggle
  const drawer = document.getElementById('drawer');
  document.getElementById('drawer-toggle')?.addEventListener('click', () => {
    drawer?.classList.add('open');
  });
  document.getElementById('drawer-close')?.addEventListener('click', () => {
    drawer?.classList.remove('open');
  });

  // emit panel collapse
  const emitBody = document.getElementById('emit-body');
  const emitToggle = document.getElementById('emit-collapse');
  let emitCollapsed = false;
  emitToggle?.addEventListener('click', () => {
    emitCollapsed = !emitCollapsed;
    if (emitCollapsed) {
      emitBody?.classList.add('hidden');
      emitToggle.textContent = 'Show';
    } else {
      emitBody?.classList.remove('hidden');
      emitToggle.textContent = 'Hide';
    }
  });

  // persist on changes
  ['ns', 'path', 'token'].forEach((id) => {
    $(id)?.addEventListener('input', () => {
      state.settings.ns = $('ns').value;
      state.settings.path = $('path').value;
      state.settings.token = $('token').value;
      saveState();
    });
  });
  ['t-websocket', 't-polling'].forEach((id) => {
    $(id)?.addEventListener('change', () => {
      state.settings.transports.websocket = $('t-websocket').checked;
      state.settings.transports.polling = $('t-polling').checked;
      saveState();
    });
  });
  ['pt-json', 'pt-string'].forEach((id) => {
    $(id)?.addEventListener('change', () => {
      const type =
        document.querySelector('input[name="payload-type"]:checked')?.value ||
        'json';
      state.payload.type = type;
      saveState();
    });
  });
  $('payload')?.addEventListener('input', () => {
    state.payload.jsonText = $('payload').value;
    saveState();
  });
  $('payload-str')?.addEventListener('input', () => {
    state.payload.strText = $('payload-str').value;
    saveState();
  });
  ['target-socket', 'target-room'].forEach((id) => {
    $(id)?.addEventListener('change', () => {
      const target =
        document.querySelector('input[name="emit-target"]:checked')?.value ||
        'socket';
      state.emitTarget.target = target;
      saveState();
    });
  });
  $('target-room-name')?.addEventListener('input', () => {
    state.emitTarget.room = $('target-room-name').value;
    saveState();
  });

  // auto-reconnect to previous session
  if (state.autoReconnect && state.connected) {
    // populate UI inputs already done; just connect
    connect();
  }
})();
