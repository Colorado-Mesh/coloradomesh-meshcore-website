(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var api = window.__coloradoMeshSound;
  if (api && api.version) return;

  var state = {
    mode: 'off',
    volume: 0.3,
    unlocked: false,
    status: 'bootstrap',
  };

  function getState() {
    return {
      mode: state.mode,
      volume: state.volume,
      unlocked: state.unlocked,
      status: state.status,
    };
  }

  api = {
    version: 1,
    status: state.status,
    getState: getState,
  };

  window.__coloradoMeshSound = api;
  window.__denvermcMapSound = api;
})();
