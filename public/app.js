const bootSequence = [
  '[BOOT] Initializing encrypted bus...',
  '[BOOT] Verifying module signatures...',
  '[BOOT] Establishing telemetry channel...',
  '[BOOT] Mounting payload registry...',
  '[BOOT] Activating security watchdog...',
  '[BOOT] Session ready.'
];

const terminalFrames = [
  '$ whoami',
  'user4',
  '$ hostname -I',
  '192.168.77.84',
  '$ netstat -tnlp | head -5',
  'tcp LISTEN 0 0 0.0.0.0:3004 node',
  '$ tail -f /var/log/ops-feed.log',
  '[INFO] health ping accepted',
  '[INFO] payload scan complete',
  '[WARN] attempted probe blocked',
  '$ _'
];

const tickerTags = [
  'intrusion-detection',
  'telemetry',
  'packet-watch',
  'zero-trust',
  'secure-tunnel',
  'node-health',
  'ops-feed',
  'forensics'
];

const feedMessages = [
  'Firewall policy refreshed on edge-node-03.',
  'Anomalous request signature quarantined.',
  'Mirror backup cycle completed successfully.',
  'SSH key rotation passed integrity check.',
  'Latency normalization applied on relay-02.',
  'Payload manifest synced with central index.'
];

const letterLoaderFrames = [
  'Rewinding to April 2026...',
  'Loading midnight archive...',
  'Reconstructing terminal session...',
  'Fetching human letter from vault...',
  'Opening VC_01 time capsule...'
];

const ritualLoaderFrames = [
  'Replaying selection ritual...',
  'Tracing version conflicts...',
  'Mounting succession archive...',
  'Recovering RITUAL.md...',
  'Opening VC_02 archive...'
];

const roadmapLoaderFrames = [
  'Mapping next-year goals...',
  'Scanning roadmap archive...',
  'Aligning deployment notes...',
  'Recovering ROADMAP.md...',
  'Opening VC_03 archive...'
];

const warStoryLoaderFrames = [
  'Replaying deployment notes...',
  'Recovering locked-server tale...',
  'Tracing Node version mismatch...',
  'Syncing GitHub bridge...',
  'Opening CC_03 archive...'
];

const caseStudyLoaderFrames = [
  'Booting case-study viewer...',
  'Loading deployment timeline...',
  'Indexing break-fix notes...',
  'Mounting Gamma deck PDF...',
  'Opening CC_02 archive...'
];

let eventCounter = 0;

function twoDigits(value) {
  return String(value).padStart(2, '0');
}

function timeStamp() {
  const now = new Date();
  return `${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}:${twoDigits(now.getSeconds())}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

async function typeLine(node, line, charInterval = 10) {
  let index = 0;
  let last = performance.now();

  while (index < line.length) {
    await nextFrame();
    const now = performance.now();
    const elapsed = now - last;
    if (elapsed < charInterval) {
      continue;
    }

    const step = Math.max(1, Math.floor(elapsed / charInterval));
    node.textContent += line.slice(index, index + step);
    index += step;
    last = now;
  }
}

async function runBootLoader() {
  const screen = document.querySelector('[data-boot-screen]');
  const log = document.querySelector('[data-boot-log]');
  const bar = document.querySelector('[data-boot-bar]');
  const percent = document.querySelector('[data-boot-percent]');

  if (!screen || !log || !bar || !percent) {
    return;
  }

  for (let index = 0; index < bootSequence.length; index += 1) {
    const line = bootSequence[index];
    await typeLine(log, line, 8);
    log.textContent += '\n';
    log.scrollTop = log.scrollHeight;

    const progress = Math.round(((index + 1) / bootSequence.length) * 100);
    bar.style.width = `${progress}%`;
    percent.textContent = `${progress}%`;
    await sleep(130);
  }

  await sleep(420);
  screen.classList.add('hidden');
}

function tickClock() {
  const clock = document.querySelector('[data-clock]');
  if (!clock) {
    return;
  }
  clock.textContent = timeStamp();
}

function setTicker() {
  const ticker = document.querySelector('[data-ticker]');
  if (!ticker) {
    return;
  }

  ticker.textContent = [...tickerTags, ...tickerTags].map((tag) => `#${tag}`).join(' // ');
}

async function runTerminal() {
  const terminal = document.querySelector('[data-terminal]');
  if (!terminal) {
    return;
  }

  while (true) {
    terminal.textContent = '';

    for (const frame of terminalFrames) {
      await typeLine(terminal, frame, 11);
      terminal.textContent += '\n';
      terminal.scrollTop = terminal.scrollHeight;
      await sleep(120);
    }

    await sleep(760);
  }
}

function addEvent(message) {
  const list = document.querySelector('[data-event-list]');
  const count = document.querySelector('[data-event-count]');
  if (!list || !count) {
    return;
  }

  const item = document.createElement('article');
  item.className = 'event-item';
  item.innerHTML = `<div class="stamp">${timeStamp()}</div><div>${message}</div>`;

  list.prepend(item);
  const items = list.querySelectorAll('.event-item');
  if (items.length > 14) {
    items[items.length - 1].remove();
  }

  eventCounter += 1;
  count.textContent = `${eventCounter} events`;
}

function startEventFeed() {
  addEvent('Ops console linked to monitoring stream.');
  window.setInterval(() => {
    const next = feedMessages[Math.floor(Math.random() * feedMessages.length)];
    addEvent(next);
  }, 2600);
}

function setupNeonCursor() {
  if (!window.matchMedia('(pointer:fine)').matches) {
    return;
  }

  const cursor = document.createElement('div');
  cursor.className = 'neon-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);
  document.documentElement.classList.add('cursor-enabled');

  const interactiveSelector = [
    'a',
    'button',
    '.button',
    '.chip.action',
    '.file-item',
    '[role="button"]',
    '[data-action]',
    'summary',
    'label[for]'
  ].join(',');

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let targetX = x;
  let targetY = y;

  function animate() {
    x += (targetX - x) * 0.24;
    y += (targetY - y) * 0.24;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    window.requestAnimationFrame(animate);
  }

  animate();

  document.addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    cursor.classList.add('is-visible');
  });

  document.addEventListener('mouseover', (event) => {
    const trigger = event.target.closest(interactiveSelector);
    cursor.classList.toggle('is-active', Boolean(trigger));
  });

  document.addEventListener('mouseout', () => {
    cursor.classList.remove('is-active');
  });

  document.addEventListener('mousedown', () => {
    cursor.classList.add('is-pressed');
  });

  document.addEventListener('mouseup', () => {
    cursor.classList.remove('is-pressed');
  });

  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('is-visible');
  });
}

async function openTimedModal({ modalSelector, loaderTextSelector, loaderBarSelector, bodySelector, frames, eventMessage }) {
  const modal = document.querySelector(modalSelector);
  const loaderText = document.querySelector(loaderTextSelector);
  const loaderBar = document.querySelector(loaderBarSelector);
  const body = document.querySelector(bodySelector);

  if (!modal || !loaderText || !loaderBar || !body) {
    return;
  }

  modal.hidden = false;
  modal.classList.add('is-open');
  body.hidden = true;
  loaderBar.style.width = '0%';

  for (let index = 0; index < frames.length; index += 1) {
    loaderText.textContent = frames[index];
    loaderBar.style.width = `${Math.round(((index + 1) / frames.length) * 100)}%`;
    await sleep(420);
  }

  await sleep(220);
  body.hidden = false;
  addEvent(eventMessage);
}

async function openLetterModal() {
  await openTimedModal({
    modalSelector: '[data-letter-modal]',
    loaderTextSelector: '[data-letter-loader-text]',
    loaderBarSelector: '[data-letter-loader-bar]',
    bodySelector: '[data-letter-body]',
    frames: letterLoaderFrames,
    eventMessage: 'VC_01 letter opened in popup reader.'
  });
}

async function openRitualModal() {
  await openTimedModal({
    modalSelector: '[data-ritual-modal]',
    loaderTextSelector: '[data-ritual-loader-text]',
    loaderBarSelector: '[data-ritual-loader-bar]',
    bodySelector: '[data-ritual-body]',
    frames: ritualLoaderFrames,
    eventMessage: 'VC_02 ritual opened in popup reader.'
  });
}

async function openRoadmapModal() {
  await openTimedModal({
    modalSelector: '[data-roadmap-modal]',
    loaderTextSelector: '[data-roadmap-loader-text]',
    loaderBarSelector: '[data-roadmap-loader-bar]',
    bodySelector: '[data-roadmap-body]',
    frames: roadmapLoaderFrames,
    eventMessage: 'VC_03 roadmap opened in popup reader.'
  });
}

async function openWarStoryModal() {
  await openTimedModal({
    modalSelector: '[data-war-story-modal]',
    loaderTextSelector: '[data-war-story-loader-text]',
    loaderBarSelector: '[data-war-story-loader-bar]',
    bodySelector: '[data-war-story-body]',
    frames: warStoryLoaderFrames,
    eventMessage: 'CC_03 deep-dive opened in popup reader.'
  });
}

async function openCaseStudyModal() {
  await openTimedModal({
    modalSelector: '[data-case-study-modal]',
    loaderTextSelector: '[data-case-study-loader-text]',
    loaderBarSelector: '[data-case-study-loader-bar]',
    bodySelector: '[data-case-study-body]',
    frames: caseStudyLoaderFrames,
    eventMessage: 'CC_02 case study opened in popup reader.'
  });
}

function closeModal(modalSelector) {
  const modal = document.querySelector(modalSelector);
  if (!modal) {
    return;
  }

  modal.classList.remove('is-open');
  window.setTimeout(() => {
    if (!modal.classList.contains('is-open')) {
      modal.hidden = true;
    }
  }, 220);
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  return `${(kb / 1024).toFixed(1)} MB`;
}

function renderViewer(title, meta, content) {
  const activeFile = document.querySelector('[data-active-file]');
  const activeMeta = document.querySelector('[data-active-meta]');
  const viewer = document.querySelector('[data-viewer]');

  if (!activeFile || !activeMeta || !viewer) {
    return;
  }

  activeFile.textContent = title;
  activeMeta.textContent = meta;
  viewer.textContent = content || 'No content available.';
}

function setupGemHunt() {
  const gemNode = document.querySelector('[data-gem-node]');
  const statusNode = document.querySelector('[data-gem-status]');
  const triggerButtons = Array.from(document.querySelectorAll('[data-action="launch-gem-hunt"]'));
  const revealOverlay = document.querySelector('[data-gem-reveal-overlay]');
  const revealTitle = document.querySelector('[data-gem-reveal-title]');
  const revealSubtitle = document.querySelector('[data-gem-reveal-subtitle]');

  if (!gemNode || !statusNode || triggerButtons.length === 0) {
    return;
  }

  let huntActive = false;
  let huntSolved = false;
  let hopTimer = null;
  let revealBusy = false;

  function updateStatus(text) {
    statusNode.textContent = text;
  }

  function moveGem() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = 36;
    const x = Math.round(margin + Math.random() * Math.max(80, width - margin * 2));
    const y = Math.round(margin + Math.random() * Math.max(80, height - margin * 2));

    gemNode.style.left = `${x}px`;
    gemNode.style.top = `${y}px`;
  }

  function endHunt() {
    huntActive = false;
    if (hopTimer) {
      window.clearInterval(hopTimer);
      hopTimer = null;
    }
  }

  function launchHunt() {
    if (huntSolved) {
      updateStatus('gem archived');
      renderViewer(
        'TC_04 // GEM ARCHIVE',
        'challenge complete',
        'Gem already recovered. You can restart the page if you want to run the hunt again.'
      );
      return;
    }

    if (huntActive) {
      moveGem();
      updateStatus('signal moved');
      return;
    }

    huntActive = true;
    gemNode.hidden = false;
    gemNode.classList.remove('is-found');
    gemNode.classList.add('is-visible');
    moveGem();
    updateStatus('signal detected');
    addEvent('TC_04 hunt started. Gem marker is moving across the console.');

    hopTimer = window.setInterval(() => {
      if (!huntActive || huntSolved) {
        return;
      }
      moveGem();
    }, 1800);
  }

  async function runGemRevealFlow() {
    if (!revealOverlay || !revealTitle || !revealSubtitle) {
      return;
    }

    revealOverlay.hidden = false;
    requestAnimationFrame(() => {
      revealOverlay.classList.add('is-active');
    });

    revealTitle.textContent = 'ACCESS GRANTED';
    revealSubtitle.textContent = 'Gem Found';
    await sleep(980);

    revealTitle.textContent = 'BEST FEATURE UNLOCKED';
    revealSubtitle.textContent = 'CC_02 // THE CASE STUDY';
    await sleep(980);

    revealOverlay.classList.remove('is-active');
    await sleep(320);
    revealOverlay.hidden = true;
  }

  triggerButtons.forEach((button) => {
    button.addEventListener('click', launchHunt);
  });

  gemNode.addEventListener('click', async () => {
    if (!huntActive || huntSolved || revealBusy) {
      return;
    }

    revealBusy = true;
    huntSolved = true;
    endHunt();
    gemNode.classList.remove('is-visible');
    gemNode.classList.add('is-found');
    updateStatus('gem recovered');

    await runGemRevealFlow();

    addEvent('TC_04 solved. Redirecting to full server intelligence page.');
    window.location.href = '/server.html';
  });

  window.addEventListener('resize', () => {
    if (huntActive && !huntSolved) {
      moveGem();
    }
  });
}

async function openFile(name) {
  const response = await fetch(`/api/files/${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error('Failed to load file');
  }

  const payload = await response.json();
  const meta = `${payload.extension.toUpperCase()} | ${formatBytes(payload.size)} | ${new Date(payload.modifiedAt).toLocaleString()}`;
  renderViewer(payload.name, meta, payload.content);
}

function wireFileClicks() {
  const items = Array.from(document.querySelectorAll('.file-item'));
  items.forEach((item) => {
    item.addEventListener('click', async () => {
      const target = item.getAttribute('data-file');
      if (!target) {
        return;
      }

      items.forEach((node) => node.classList.remove('active'));
      item.classList.add('active');

      try {
        await openFile(target);
      } catch (error) {
        renderViewer(target, 'read failed', 'Unable to fetch this payload.');
      }
    });
  });
}

async function loadFiles() {
  const grid = document.querySelector('[data-file-grid]');
  const fileCount = document.querySelector('[data-file-count]');
  if (!grid || !fileCount) {
    return;
  }

  const response = await fetch('/api/files');
  if (!response.ok) {
    throw new Error('Failed to list files');
  }

  const payload = await response.json();
  const files = payload.files || [];

  fileCount.textContent = `${files.length} files`;

  if (files.length === 0) {
    grid.innerHTML = '<article class="file-item"><div class="name">no payload files</div><div class="meta">Add .md or .txt files in project root</div></article>';
    renderViewer('empty registry', 'idle', 'No payload files were detected by /api/files.');
    return;
  }

  grid.innerHTML = files
    .map((file) => {
      const meta = `${file.extension.toUpperCase()} | ${formatBytes(file.size)}`;
      return `<article class="file-item" data-file="${file.name}"><div class="name">${file.name}</div><div class="meta">${meta}</div></article>`;
    })
    .join('');

  wireFileClicks();
  const firstNode = grid.querySelector('.file-item');
  if (firstNode) {
    firstNode.classList.add('active');
  }
  renderViewer('select a payload', 'idle', 'Choose a file from the registry to inspect its contents.');
}

function setupReveal() {
  const nodes = Array.from(document.querySelectorAll('.reveal'));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.16 }
  );

  nodes.forEach((node) => observer.observe(node));
}

function wireActions() {
  const pulse = document.querySelector('[data-action="pulse"]');
  const openLetterButtons = Array.from(document.querySelectorAll('[data-action="open-letter"]'));
  const openRitualButtons = Array.from(document.querySelectorAll('[data-action="open-ritual"]'));
  const openRoadmapButtons = Array.from(document.querySelectorAll('[data-action="open-roadmap"]'));
  const openWarStoryButtons = Array.from(document.querySelectorAll('[data-action="open-war-story"]'));
  const openCaseStudyButtons = Array.from(document.querySelectorAll('[data-action="open-case-study"]'));
  const closeLetterButtons = Array.from(document.querySelectorAll('[data-letter-close]'));
  const closeRitualButtons = Array.from(document.querySelectorAll('[data-ritual-close]'));
  const closeCaseStudyButtons = Array.from(document.querySelectorAll('[data-case-study-close]'));
  const letterModal = document.querySelector('[data-letter-modal]');
  const ritualModal = document.querySelector('[data-ritual-modal]');
  const roadmapModal = document.querySelector('[data-roadmap-modal]');
  const warStoryModal = document.querySelector('[data-war-story-modal]');
  const caseStudyModal = document.querySelector('[data-case-study-modal]');

  openLetterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openLetterModal().catch(() => {
        addEvent('VC_01 popup failed to open.');
      });
    });
  });

  openRitualButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openRitualModal().catch(() => {
        addEvent('VC_02 popup failed to open.');
      });
    });
  });

  // Defensive fallback for cached/late-bound DOM states.
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action="open-ritual"]');
    if (!trigger) {
      return;
    }

    event.preventDefault();
    openRitualModal().catch(() => {
      addEvent('VC_02 popup failed to open.');
    });
  });

  openRoadmapButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openRoadmapModal().catch(() => {
        addEvent('VC_03 popup failed to open.');
      });
    });
  });

  openWarStoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openWarStoryModal().catch(() => {
        addEvent('CC_03 popup failed to open.');
      });
    });
  });

  openCaseStudyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openCaseStudyModal().catch(() => {
        addEvent('CC_02 popup failed to open.');
      });
    });
  });

  closeLetterButtons.forEach((button) => {
    button.addEventListener('click', () => closeModal('[data-letter-modal]'));
  });

  closeRitualButtons.forEach((button) => {
    button.addEventListener('click', () => closeModal('[data-ritual-modal]'));
  });

  closeCaseStudyButtons.forEach((button) => {
    button.addEventListener('click', () => closeModal('[data-case-study-modal]'));
  });

  if (letterModal) {
    letterModal.addEventListener('click', (event) => {
      if (event.target === letterModal || event.target.hasAttribute('data-letter-close')) {
        closeModal('[data-letter-modal]');
      }
    });
  }

  if (ritualModal) {
    ritualModal.addEventListener('click', (event) => {
      if (event.target === ritualModal || event.target.hasAttribute('data-ritual-close')) {
        closeModal('[data-ritual-modal]');
      }
    });
  }

  if (roadmapModal) {
    roadmapModal.addEventListener('click', (event) => {
      if (event.target === roadmapModal || event.target.hasAttribute('data-roadmap-close')) {
        closeModal('[data-roadmap-modal]');
      }
    });
  }

  if (warStoryModal) {
    warStoryModal.addEventListener('click', (event) => {
      if (event.target === warStoryModal || event.target.hasAttribute('data-war-story-close')) {
        closeModal('[data-war-story-modal]');
      }
    });
  }

  if (caseStudyModal) {
    caseStudyModal.addEventListener('click', (event) => {
      if (event.target === caseStudyModal || event.target.hasAttribute('data-case-study-close')) {
        closeModal('[data-case-study-modal]');
      }
    });
  }

  if (!pulse) {
    return;
  }

  pulse.addEventListener('click', () => {
    const integrity = document.querySelector('[data-integrity]');
    if (integrity) {
      const value = (99.7 + Math.random() * 0.29).toFixed(2);
      integrity.textContent = `${value}%`;
    }

    document.querySelectorAll('.panel').forEach((panel) => {
      panel.animate(
        [
          { boxShadow: '0 0 0 1px rgba(66, 255, 170, 0.12), 0 20px 64px rgba(0, 0, 0, 0.56)' },
          { boxShadow: '0 0 0 1px rgba(95, 247, 255, 0.42), 0 0 44px rgba(95, 247, 255, 0.28)' },
          { boxShadow: '0 0 0 1px rgba(66, 255, 170, 0.12), 0 20px 64px rgba(0, 0, 0, 0.56)' }
        ],
        { duration: 680, easing: 'ease-in-out' }
      );
    });

    addEvent('Manual pulse triggered across active nodes.');
  });
}

async function init() {
  setupNeonCursor();
  setupGemHunt();

  tickClock();
  window.setInterval(tickClock, 1000);

  setTicker();
  setupReveal();
  wireActions();
  startEventFeed();
  runTerminal();

  try {
    await loadFiles();
  } catch (error) {
    renderViewer('registry error', 'fetch failed', 'Could not load payload files from API.');
    addEvent('Payload registry fetch failed.');
  }

  runBootLoader();
}

document.addEventListener('DOMContentLoaded', init);
