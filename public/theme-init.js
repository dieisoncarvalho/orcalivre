try {
  var t = localStorage.getItem('orcalivre:theme') || localStorage.getItem('propostapro:theme');
  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}
