(function () {
  'use strict';

  function normalizePath(path) {
    return String(path || '').replace(/\\/g, '/');
  }

  function isSitePage() {
    return /(?:^|\/)site(?:\/|$)/.test(normalizePath(location.pathname));
  }

  function detectBasePath() {
    var host = location.hostname;
    var path = normalizePath(location.pathname);

    if (host.endsWith('.github.io')) {
      var parts = path.split('/').filter(Boolean);
      if (!parts.length) return '';

      var first = parts[0];
      if (first === 'site' || first === 'assets') return '';
      if (/\.html?$/i.test(first)) return '';

      return '/' + first;
    }

    if (isSitePage()) return '..';

    return '';
  }

  window.__ASSET_BASE__ = detectBasePath();

  window.assetUrl = function assetUrl(path) {
    if (!path || /^https?:\/\//i.test(path)) return path;

    var clean = String(path).replace(/^\//, '');
    var base = window.__ASSET_BASE__ || '';

    if (base === '..') return '../' + clean;

    return base ? base + '/' + clean : '/' + clean;
  };
})();
