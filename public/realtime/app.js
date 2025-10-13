(() => {
  const $ = (id) => document.getElementById(id);
  const statusEl = $('status');
  const sidEl = $('sid');
  const transportEl = $('transport');
  const logsEl = $('logs');

  let socket = null;

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
  }

  function log(direction, event, payload) {
    const time = new Date().toLocaleTimeString();
    const item = document.createElement('div');
    item.className = `log ${direction}`;
    const pretty =
      typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    item.innerHTML = `<span class="time">${time}</span> <span class="dir">${direction}</span> <span class="event">${event}</span> <pre class="payload">${pretty}</pre>`;
    logsEl.prepend(item);
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

    socket.onAny((event, ...args) => {
      if (event === 'pong') return; // already logged
      log('in', event, args.length > 1 ? args : args[0]);
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
  $('clear').addEventListener('click', () => (logsEl.innerHTML = ''));

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
    log('out', event, payloadToSend);
    socket.emit(event, payloadToSend);
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
})();
