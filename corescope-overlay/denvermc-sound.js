(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var api = window.__coloradoMeshSound;
  if (api && api.version) return;

  var MODE_STORAGE_KEY = 'coloradoMesh.map.soundMode';
  var VOLUME_STORAGE_KEY = 'coloradoMesh.map.soundVolume';
  var UPSTREAM_AUDIO_ENABLED_KEY = 'live-audio-enabled';
  var DEFAULT_VOLUME = 0.3;
  var AudioCtor = window.AudioContext || window.webkitAudioContext || null;
  var modes = [
    { value: 'off', label: 'Sound Off' },
    { value: 'native', label: 'Native+' },
    { value: 'generative', label: 'Generative Key' },
    { value: 'ensemble', label: 'Orchestral Ensemble' },
    { value: 'blaster', label: 'Space Blaster' },
  ];
  var modeLookup = modes.reduce(function (acc, mode) {
    acc[mode.value] = mode;
    return acc;
  }, {});
  var listeners = [];
  var audioCtx = null;
  var masterGain = null;
  var suppressObserver = null;
  var suppressTimer = null;
  var dedupeWindowMs = 2500;
  var dedupeSeen = new Map();
  var buckets = {
    priority: { capacity: 6, tokens: 6, refillPerSecond: 3, updatedAt: Date.now() },
    normal: { capacity: 4, tokens: 4, refillPerSecond: 1.5, updatedAt: Date.now() },
    low: { capacity: 2, tokens: 2, refillPerSecond: 0.75, updatedAt: Date.now() },
  };
  var lastNormalizedEvent = null;
  var lastEvent = null;
  var lastDroppedReason = null;
  var counters = {
    modeChanges: 0,
    volumeChanges: 0,
    unlockAttempts: 0,
    unlockFailures: 0,
    suppressions: 0,
    suppressedPackets: 0,
    testEvents: 0,
    received: 0,
    normalized: 0,
    routed: 0,
    dropped: 0,
    deduped: 0,
    throttled: 0,
    locked: 0,
    off: 0,
    malformed: 0,
    priority: 0,
    played: 0,
  };

  function readStorage(key) {
    try { return window.localStorage.getItem(key); }
    catch { return null; }
  }

  function writeStorage(key, value) {
    try { window.localStorage.setItem(key, value); }
    catch { /* ignore quota/private-mode */ }
  }

  function clampVolume(value) {
    var next = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(next)) return DEFAULT_VOLUME;
    return Math.max(0, Math.min(1, next));
  }

  function readMode() {
    var saved = readStorage(MODE_STORAGE_KEY);
    return modeLookup[saved] ? saved : 'off';
  }

  function readVolume() {
    var saved = readStorage(VOLUME_STORAGE_KEY);
    if (saved == null || saved === '') return DEFAULT_VOLUME;
    return clampVolume(saved);
  }

  var state = {
    mode: readMode(),
    volume: readVolume(),
    unlocked: false,
    status: 'bootstrap',
    available: !!AudioCtor,
  };

  function getModeOptions() {
    return modes.map(function (mode) {
      return { value: mode.value, label: mode.label };
    });
  }

  function cloneEvent(event) {
    if (!event) return null;
    return {
      id: event.id,
      type: event.type,
      modeHint: event.modeHint,
      channelName: event.channelName,
      channelHash: event.channelHash,
      isEmergency: event.isEmergency,
      isPriority: event.isPriority,
      observationCount: event.observationCount,
      hopCount: event.hopCount,
      intensity: event.intensity,
      timestamp: event.timestamp,
    };
  }

  function getState() {
    return {
      mode: state.mode,
      volume: state.volume,
      unlocked: state.unlocked,
      status: state.status,
      available: state.available,
      counters: Object.assign({}, counters),
      lastNormalizedEvent: cloneEvent(lastNormalizedEvent),
      lastEvent: cloneEvent(lastEvent),
      lastDroppedReason: lastDroppedReason,
    };
  }

  function updateStatus() {
    if (!state.available) {
      state.status = 'unavailable';
    } else if (state.mode === 'off') {
      state.status = 'off';
    } else if (!state.unlocked) {
      state.status = 'locked';
    } else if (audioCtx && audioCtx.state === 'suspended') {
      state.status = 'suspended';
    } else {
      state.status = 'ready';
    }
    if (api) api.status = state.status;
  }

  function notify() {
    updateStatus();
    var snapshot = getState();
    listeners.slice().forEach(function (listener) {
      try { listener(snapshot); }
      catch { /* keep other listeners alive */ }
    });
    try {
      window.dispatchEvent(new CustomEvent('coloradoMeshSoundChange', { detail: snapshot }));
    } catch { /* CustomEvent can fail in very old browsers */ }
  }

  function applyVolume() {
    if (masterGain) masterGain.gain.value = state.unlocked && state.mode !== 'off' ? state.volume : 0;
  }

  function suspendAudioContext() {
    state.unlocked = false;
    applyVolume();
    if (audioCtx && audioCtx.state === 'running' && typeof audioCtx.suspend === 'function') {
      try { audioCtx.suspend(); }
      catch { /* ignore browser-specific suspend errors */ }
    }
  }

  function ensureAudioContext() {
    if (!AudioCtor) {
      state.available = false;
      state.unlocked = false;
      updateStatus();
      return false;
    }

    try {
      if (!audioCtx) {
        audioCtx = new AudioCtor();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = state.volume;
        masterGain.connect(audioCtx.destination);
      }
      applyVolume();
      if (audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function') {
        var resumed = audioCtx.resume();
        if (resumed && typeof resumed.then === 'function') {
          resumed.then(function () {
            state.unlocked = audioCtx.state !== 'suspended';
            applyVolume();
            notify();
          }).catch(function () {
            counters.unlockFailures += 1;
            state.unlocked = false;
            applyVolume();
            notify();
          });
        }
      }
      state.unlocked = audioCtx.state !== 'suspended';
      applyVolume();
      updateStatus();
      return true;
    } catch {
      counters.unlockFailures += 1;
      state.available = false;
      state.unlocked = false;
      updateStatus();
      return false;
    }
  }

  function setMode(mode, options) {
    if (!modeLookup[mode]) return false;
    var userGesture = !!(options && options.userGesture);
    var changed = state.mode !== mode;
    state.mode = mode;
    writeStorage(MODE_STORAGE_KEY, mode);
    if (changed) counters.modeChanges += 1;

    if (mode === 'off') {
      suspendAudioContext();
    } else if (userGesture) {
      counters.unlockAttempts += 1;
      ensureAudioContext();
    } else {
      state.unlocked = false;
      applyVolume();
    }

    suppressCoreScopeAudio();
    notify();
    return true;
  }

  function setVolume(value) {
    var next = clampVolume(value);
    var changed = state.volume !== next;
    state.volume = next;
    writeStorage(VOLUME_STORAGE_KEY, String(next));
    applyVolume();
    if (changed) counters.volumeChanges += 1;
    notify();
    return true;
  }

  function isUnlocked() {
    return state.mode !== 'off' && state.unlocked;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return function () {};
    listeners.push(listener);
    try { listener(getState()); }
    catch { /* ignore listener init errors */ }
    return function () {
      listeners = listeners.filter(function (candidate) { return candidate !== listener; });
    };
  }

  function numberFrom(value, fallback) {
    var next = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(next)) return fallback;
    return next;
  }

  function intFrom(value, fallback) {
    var next = Math.round(numberFrom(value, fallback));
    return Number.isFinite(next) ? next : fallback;
  }

  function stringFrom(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return '';
  }

  function parseMaybeJson(value) {
    if (!value || typeof value !== 'string') return null;
    try { return JSON.parse(value); }
    catch { return null; }
  }

  function decodedFromPacket(pkt) {
    if (!pkt || typeof pkt !== 'object') return {};
    if (pkt.decoded && typeof pkt.decoded === 'object') return pkt.decoded;
    var decoded = parseMaybeJson(pkt.decoded_json);
    return decoded && typeof decoded === 'object' ? decoded : {};
  }

  function pathFromPacket(pkt, decoded) {
    var path = decoded && decoded.path && typeof decoded.path === 'object' ? decoded.path : {};
    if (Array.isArray(path.hops)) return path.hops;
    var parsed = parseMaybeJson(pkt && pkt.path_json);
    return Array.isArray(parsed) ? parsed : [];
  }

  function rawHexFromPacket(pkt) {
    return stringFrom(pkt && (pkt.raw || pkt.raw_hex || (pkt.packet && (pkt.packet.raw || pkt.packet.raw_hex))));
  }

  function byteAt(hex, index, fallback) {
    if (!hex || hex.length < index * 2 + 2) return fallback;
    var parsed = parseInt(hex.slice(index * 2, index * 2 + 2), 16);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function firstString(values) {
    for (var i = 0; i < values.length; i++) {
      var value = stringFrom(values[i]).trim();
      if (value) return value;
    }
    return '';
  }

  function firstValue(values) {
    for (var i = 0; i < values.length; i++) {
      if (values[i] != null && values[i] !== '') return values[i];
    }
    return null;
  }

  function isEmergencyChannel(channelName, channelHash, type) {
    var name = stringFrom(channelName).toLowerCase();
    var hash = stringFrom(channelHash).toLowerCase();
    return name.indexOf('emergency') !== -1
        || hash.indexOf('emergency') !== -1
        || stringFrom(type).toUpperCase() === 'EMERGENCY';
  }

  function normalizeChannelHash(value) {
    if (value == null || value === '') return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    var raw = stringFrom(value).trim();
    if (!raw) return null;
    return raw;
  }

  function eventLane(event) {
    if (event.isPriority) return 'priority';
    if (event.type === 'ADVERT' || event.type === 'NODEINFO') return 'low';
    return 'normal';
  }

  function normalizePacket(pkt) {
    if (!pkt || typeof pkt !== 'object') return null;
    var decoded = decodedFromPacket(pkt);
    var header = decoded.header || {};
    var payload = decoded.payload || decoded;
    var type = firstString([
      header.payloadTypeName,
      header.type,
      payload.payloadTypeName,
      payload.type,
      pkt.type,
    ]).toUpperCase() || 'UNKNOWN';
    var hops = pathFromPacket(pkt, decoded);
    var rawHex = rawHexFromPacket(pkt);
    var hash = firstString([
      pkt.hash,
      pkt.packet && pkt.packet.hash,
      payload.hash,
      rawHex ? rawHex.slice(0, 16) : '',
    ]);
    if (!hash && type === 'UNKNOWN' && !rawHex) return null;

    var channelName = firstString([
      payload.channelName,
      payload.channel,
      payload.channel_name,
      decoded.channelName,
      pkt.channelName,
      pkt.channel,
    ]);
    var channelHash = normalizeChannelHash(firstValue([
      payload.channelHash,
      payload.channelHashByte,
      payload.channel_hash,
      decoded.channelHash,
      decoded.channelHashByte,
      pkt.channelHash,
      pkt.channelHashByte,
    ]));
    var observationCount = Math.max(1, intFrom(pkt.observation_count || (pkt.packet && pkt.packet.observation_count), 1));
    var hopCount = Math.max(1, intFrom(hops.length || payload.hopCount || decoded.hopCount || pkt.hop_count, 1));
    var byteSeed = byteAt(rawHex, 3, observationCount * 17 + hopCount * 13);
    var intensity = Math.max(0.05, Math.min(1, (byteSeed / 255) * 0.65 + Math.min(observationCount, 6) * 0.05 + Math.min(hopCount, 8) * 0.025));
    var isEmergency = isEmergencyChannel(channelName, channelHash, type);
    var isPriority = isEmergency || type === 'GRP_TXT' || type === 'CHAN' || observationCount >= 4;
    var timestamp = intFrom(pkt._ts || pkt.timestamp || pkt.received_at || Date.now(), Date.now());

    return {
      id: hash || [type, channelName || channelHash || 'no-channel', timestamp].join(':'),
      type: type,
      modeHint: eventLane({ type: type, isPriority: isPriority }),
      channelName: channelName || null,
      channelHash: channelHash,
      isEmergency: isEmergency,
      isPriority: isPriority,
      observationCount: observationCount,
      hopCount: hopCount,
      intensity: intensity,
      timestamp: timestamp,
    };
  }

  function rememberDrop(reason) {
    counters.dropped += 1;
    lastDroppedReason = reason;
  }

  function pruneDedupe(now) {
    dedupeSeen.forEach(function (seenAt, id) {
      if (now - seenAt > dedupeWindowMs) dedupeSeen.delete(id);
    });
  }

  function acceptDedupe(event, now) {
    if (!event.id) return true;
    pruneDedupe(now);
    var seenAt = dedupeSeen.get(event.id);
    if (seenAt && now - seenAt < dedupeWindowMs) {
      counters.deduped += 1;
      rememberDrop('dedupe');
      return false;
    }
    dedupeSeen.set(event.id, now);
    return true;
  }

  function acceptBucket(event, now) {
    var lane = eventLane(event);
    var bucket = buckets[lane] || buckets.normal;
    var elapsed = Math.max(0, (now - bucket.updatedAt) / 1000);
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsed * bucket.refillPerSecond);
    bucket.updatedAt = now;
    if (bucket.tokens < 1) {
      counters.throttled += 1;
      rememberDrop('throttle:' + lane);
      return false;
    }
    bucket.tokens -= 1;
    return true;
  }

  function markPlaceholderPlayed(event) {
    counters.played += 1;
    lastEvent = cloneEvent(event);
    return true;
  }

  function routeEvent(event) {
    if (!event) {
      counters.malformed += 1;
      rememberDrop('malformed');
      notify();
      return false;
    }
    if (state.mode === 'off') {
      counters.off += 1;
      rememberDrop('off');
      notify();
      return false;
    }
    if (!state.unlocked || !state.available) {
      counters.locked += 1;
      rememberDrop(state.available ? 'locked' : 'unavailable');
      notify();
      return false;
    }

    var now = Date.now();
    if (!acceptDedupe(event, now)) {
      notify();
      return false;
    }
    if (!acceptBucket(event, now)) {
      notify();
      return false;
    }

    counters.routed += 1;
    if (event.isPriority) counters.priority += 1;
    lastDroppedReason = null;
    var accepted = markPlaceholderPlayed(event);
    notify();
    return accepted;
  }

  function handlePacket(pkt) {
    counters.received += 1;
    var event = normalizePacket(pkt);
    if (!event) {
      counters.malformed += 1;
      rememberDrop('malformed');
      notify();
      return false;
    }
    counters.normalized += 1;
    lastNormalizedEvent = cloneEvent(event);
    return routeEvent(event);
  }

  function injectTestEvent(eventOrPacket) {
    counters.testEvents += 1;
    if (eventOrPacket && typeof eventOrPacket === 'object' && eventOrPacket.type && eventOrPacket.id) {
      lastNormalizedEvent = cloneEvent(eventOrPacket);
      return routeEvent(Object.assign({}, eventOrPacket));
    }
    return handlePacket(eventOrPacket || {
      hash: 'test-' + counters.testEvents,
      raw_hex: '010203040506',
      observation_count: 1,
      decoded: { header: { payloadTypeName: 'TEST' }, payload: {} },
    });
  }

  function persistCoreScopeDisabled() {
    writeStorage(UPSTREAM_AUDIO_ENABLED_KEY, 'false');
  }

  function markSuppressed(el) {
    if (!el || el.dataset.coloradoMeshAudioSuppressed === '1') return false;
    el.dataset.coloradoMeshAudioSuppressed = '1';
    counters.suppressions += 1;
    return true;
  }

  function suppressCoreScopeDom() {
    var toggle = document.getElementById('liveAudioToggle');
    if (toggle) {
      toggle.checked = false;
      toggle.disabled = true;
      toggle.tabIndex = -1;
      toggle.setAttribute('aria-hidden', 'true');
      markSuppressed(toggle);
      var label = toggle.closest ? toggle.closest('label') : null;
      if (label) {
        label.hidden = true;
        label.setAttribute('aria-hidden', 'true');
        markSuppressed(label);
      }
    }

    var controls = document.getElementById('audioControls');
    if (controls) {
      controls.classList.add('hidden');
      controls.hidden = true;
      controls.setAttribute('aria-hidden', 'true');
      markSuppressed(controls);
    }
  }

  function patchCoreScopeAudio() {
    var meshAudio = window.MeshAudio;
    if (!meshAudio || meshAudio.__coloradoMeshAudioSuppressed) return !!meshAudio;

    var originalSetEnabled = typeof meshAudio.setEnabled === 'function' ? meshAudio.setEnabled.bind(meshAudio) : null;
    var originalRestore = typeof meshAudio.restore === 'function' ? meshAudio.restore.bind(meshAudio) : null;

    function forceOff() {
      persistCoreScopeDisabled();
      if (originalSetEnabled) {
        try { originalSetEnabled(false); }
        catch { /* ignore upstream audio errors */ }
      }
    }

    meshAudio.setEnabled = function () {
      forceOff();
      return false;
    };
    meshAudio.isEnabled = function () { return false; };
    meshAudio.restore = function () {
      forceOff();
      if (originalRestore) {
        try { originalRestore(); }
        catch { /* ignore upstream restore errors */ }
      }
      forceOff();
      return false;
    };
    meshAudio.sonifyPacket = function (pkt) {
      counters.suppressedPackets += 1;
      return handlePacket(pkt);
    };

    try {
      Object.defineProperty(meshAudio, '__coloradoMeshAudioSuppressed', { value: true });
    } catch {
      meshAudio.__coloradoMeshAudioSuppressed = true;
    }

    forceOff();
    return true;
  }

  function suppressCoreScopeAudio() {
    persistCoreScopeDisabled();
    patchCoreScopeAudio();
    suppressCoreScopeDom();
  }

  function startSuppressionWatch() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', startSuppressionWatch, { once: true });
      return;
    }
    suppressCoreScopeAudio();

    if (!suppressObserver && typeof MutationObserver !== 'undefined') {
      suppressObserver = new MutationObserver(function () {
        suppressCoreScopeAudio();
      });
      suppressObserver.observe(document.body, { childList: true, subtree: true });
    }

    if (!suppressTimer) {
      var attempts = 0;
      suppressTimer = window.setInterval(function () {
        attempts += 1;
        suppressCoreScopeAudio();
        if (attempts >= 40 || (window.MeshAudio && document.getElementById('liveAudioToggle'))) {
          window.clearInterval(suppressTimer);
          suppressTimer = null;
        }
      }, 250);
    }
  }

  updateStatus();

  api = {
    version: 2,
    status: state.status,
    storageKeys: {
      mode: MODE_STORAGE_KEY,
      volume: VOLUME_STORAGE_KEY,
    },
    getModeOptions: getModeOptions,
    getState: getState,
    setMode: setMode,
    setVolume: setVolume,
    isUnlocked: isUnlocked,
    subscribe: subscribe,
    normalizePacket: normalizePacket,
    routeEvent: routeEvent,
    injectTestEvent: injectTestEvent,
    suppressCoreScopeAudio: suppressCoreScopeAudio,
  };

  window.__coloradoMeshSound = api;
  window.__denvermcMapSound = api;

  suppressCoreScopeAudio();
  startSuppressionWatch();
  notify();
})();
