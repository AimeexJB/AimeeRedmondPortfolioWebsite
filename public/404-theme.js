// Match the theme the visitor already had on the rest of the site, set
// before paint so there's no flash of the wrong theme. Same logic as App.tsx.
(function () {
  try {
    var stored = localStorage.getItem('theme')
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
  } catch (e) {}
})()
