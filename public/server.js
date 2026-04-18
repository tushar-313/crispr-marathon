function twoDigits(value) {
  return String(value).padStart(2, '0');
}

function nowStamp() {
  const now = new Date();
  return `${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}:${twoDigits(now.getSeconds())}`;
}

function bytesLabel(bytes) {
  if (!Number.isFinite(bytes)) {
    return '--';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  return `${(kb / 1024).toFixed(2)} MB`;
}

function addLog(message) {
  const log = document.querySelector('[data-activity-log]');
  if (!log) {
    return;
  }

  const item = document.createElement('article');
  item.className = 'log-item';
  item.innerHTML = `<div class="stamp">${nowStamp()}</div><div>${message}</div>`;

  log.prepend(item);
  const items = log.querySelectorAll('.log-item');
  if (items.length > 24) {
    items[items.length - 1].remove();
  }
}

function renderService(healthJson, fetchedAt) {
  const node = document.querySelector('[data-service-snapshot]');
  if (!node) {
    return;
  }

  const rows = [
    ['Health', healthJson && healthJson.ok ? 'OK' : 'UNKNOWN'],
    ['Service', healthJson && healthJson.service ? healthJson.service : 'crispr-marathon'],
    ['Endpoint', `${location.origin}/api/healthz`],
    ['Fetched', fetchedAt],
  ];

  node.innerHTML = rows
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');
}

function renderNetwork() {
  const node = document.querySelector('[data-network-snapshot]');
  if (!node) {
    return;
  }

  const rows = [
    ['Origin', location.origin],
    ['Hostname', location.hostname || 'localhost'],
    ['Port', location.port || 'default'],
    ['Protocol', location.protocol.replace(':', '').toUpperCase()],
    ['Path', location.pathname],
  ];

  node.innerHTML = rows
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');
}

function renderRuntime() {
  const node = document.querySelector('[data-runtime-snapshot]');
  if (!node) {
    return;
  }

  const rows = [
    ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'n/a'],
    ['Language', navigator.language || 'n/a'],
    ['Platform', navigator.platform || 'n/a'],
    ['User Agent', navigator.userAgent],
  ];

  node.innerHTML = rows
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');
}

function renderMetrics(files, fetchedAt) {
  const node = document.querySelector('[data-payload-metrics]');
  if (!node) {
    return;
  }

  const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
  const rows = [
    ['Total files', String(files.length)],
    ['Total size', bytesLabel(totalSize)],
    ['Last sync', fetchedAt],
  ];

  node.innerHTML = rows
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');
}

function renderTable(files) {
  const node = document.querySelector('[data-payload-table]');
  if (!node) {
    return;
  }

  if (!files.length) {
    node.innerHTML = '<tr><td colspan="4">No payload files found.</td></tr>';
    return;
  }

  node.innerHTML = files
    .map((file) => {
      const name = file.name || '-';
      const ext = String(file.extension || '-').toUpperCase();
      const size = bytesLabel(file.size || 0);
      const modified = file.modifiedAt ? new Date(file.modifiedAt).toLocaleString() : '-';
      return `<tr><td>${name}</td><td>${ext}</td><td>${size}</td><td>${modified}</td></tr>`;
    })
    .join('');
}

async function refresh() {
  const fetchedAt = `${new Date().toLocaleDateString()} ${nowStamp()}`;

  addLog('Refreshing server intelligence snapshot...');

  let healthJson = null;
  try {
    const healthResponse = await fetch('/api/healthz');
    if (healthResponse.ok) {
      healthJson = await healthResponse.json();
      addLog('Health endpoint responded successfully.');
    } else {
      addLog('Health endpoint returned non-OK status.');
    }
  } catch (error) {
    addLog('Health endpoint unreachable from current origin.');
  }

  let files = [];
  try {
    const filesResponse = await fetch('/api/files');
    if (filesResponse.ok) {
      const payload = await filesResponse.json();
      files = payload.files || [];
      addLog(`Payload registry sync complete (${files.length} files).`);
    } else {
      addLog('Payload registry returned non-OK status.');
    }
  } catch (error) {
    addLog('Payload registry fetch failed.');
  }

  renderService(healthJson, fetchedAt);
  renderNetwork();
  renderRuntime();
  renderMetrics(files, fetchedAt);
  renderTable(files);
}

function tickNow() {
  const nowNode = document.querySelector('[data-now]');
  if (!nowNode) {
    return;
  }
  nowNode.textContent = nowStamp();
}

function wireActions() {
  const refreshButton = document.querySelector('[data-refresh]');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      refresh().catch(() => {
        addLog('Manual refresh failed unexpectedly.');
      });
    });
  }
}

async function init() {
  tickNow();
  window.setInterval(tickNow, 1000);
  wireActions();
  renderNetwork();
  renderRuntime();
  await refresh();
  addLog('Server intel page ready.');
}

document.addEventListener('DOMContentLoaded', () => {
  init().catch(() => {
    addLog('Initialization failed.');
  });
});
