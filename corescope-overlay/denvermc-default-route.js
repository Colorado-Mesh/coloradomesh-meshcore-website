(() => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path !== '/map') return;
  if (window.location.hash && window.location.hash !== '#/') return;

  window.location.replace(`${window.location.pathname}${window.location.search}#/live`);
})();
