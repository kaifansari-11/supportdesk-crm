// theme 
const THEME_KEY = 'crm-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const icons = document.querySelectorAll('.theme-icon');
  icons.forEach(el => {
    el.textContent = theme === 'light' ? '🌙' : '☀️';
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// saves the theme 
(function () {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
})();

// live search 
function initLiveSearch() {
  const input = document.getElementById('search-input');
  const filterSelect = document.getElementById('filter-status');
  if (!input) return;

  let debounceTimer;

  function doSearch() {
    const search = input.value.trim();
    const status = filterSelect ? filterSelect.value : '';
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    const url = '/tickets' + (params.toString() ? '?' + params.toString() : '');
    
    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newTable = doc.getElementById('tickets-table');
        const currentTable = document.getElementById('tickets-table');
        if (newTable && currentTable) {
          currentTable.innerHTML = newTable.innerHTML;
        }
      })
      .catch(console.error);
  }

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doSearch, 280);
  });

  if (filterSelect) {
    filterSelect.addEventListener('change', doSearch);
  }
}

document.addEventListener('DOMContentLoaded', initLiveSearch);

// mobile sidebar 
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (sidebar && overlay) {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}