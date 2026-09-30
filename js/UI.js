/**
 * UI.js
 * ======
 * All DOM rendering functions for ContactVault.
 * Separated from app logic for clean architecture.
 */

const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316',
  '#f59e0b','#10b981','#14b8a6','#3b82f6','#06b6d4',
];

const GROUP_COLORS = {
  Work: '#3b82f6', Family: '#10b981', Friends: '#f59e0b',
  Personal: '#6366f1', Other: '#64748b',
};

/* =================== Contact Card =================== */

function renderContactCard(contact, isListView = false) {
  const initials = contact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const card = document.createElement('div');
  card.className = `contact-card${isListView ? ' list-view' : ''}`;
  card.dataset.id = contact.id;

  card.innerHTML = `
    ${contact.isFavorite ? '<div class="card-fav"><i class="fas fa-star"></i></div>' : ''}
    <div class="card-avatar" style="background:${contact.color}">${initials}</div>
    <div class="card-info">
      <div class="card-name">${escHtml(contact.name)}</div>
      <div class="card-phone"><i class="fas fa-phone fa-xs"></i> ${escHtml(contact.phone)}</div>
      ${contact.email ? `<div class="card-email"><i class="fas fa-envelope fa-xs"></i> ${escHtml(contact.email)}</div>` : ''}
      <span class="card-group" style="background:${GROUP_COLORS[contact.group] || '#6366f1'}22;color:${GROUP_COLORS[contact.group] || '#6366f1'}">${contact.group}</span>
    </div>
    <div class="card-actions">
      <button class="btn btn-icon btn-primary view-btn" title="View" data-id="${contact.id}">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn btn-icon btn-ghost edit-btn" title="Edit" data-id="${contact.id}">
        <i class="fas fa-pen"></i>
      </button>
      <button class="btn btn-icon" style="background:rgba(239,68,68,.1);color:#ef4444" title="Delete" class="delete-btn" data-id="${contact.id}">
        <i class="fas fa-trash delete-btn"></i>
      </button>
      <button class="btn btn-icon btn-ghost fav-btn" title="Toggle Favorite" data-id="${contact.id}" style="${contact.isFavorite ? 'color:#f59e0b' : ''}">
        <i class="fa${contact.isFavorite ? 's' : 'r'} fa-star"></i>
      </button>
    </div>
  `;
  return card;
}

/* =================== Contacts Grid =================== */

function renderContactsGrid(contacts, isListView = false) {
  const grid = document.getElementById('contactsGrid');
  const empty = document.getElementById('emptyState');
  grid.innerHTML = '';

  if (!contacts.length) {
    grid.appendChild(empty);
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  contacts.forEach(c => grid.appendChild(renderContactCard(c, isListView)));
}

/* =================== View Modal =================== */

function renderViewModal(contact) {
  const initials = contact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `
    <div class="view-contact-header">
      <div class="view-avatar" style="background:${contact.color}">${initials}</div>
      <div>
        <div class="view-name">${escHtml(contact.name)} ${contact.isFavorite ? '<i class="fas fa-star" style="color:#f59e0b;font-size:.9rem"></i>' : ''}</div>
        <div class="view-sub">${contact.group}</div>
      </div>
    </div>
    <div class="detail-row"><i class="fas fa-phone"></i><span class="detail-label">Phone</span><span>${escHtml(contact.phone)}</span></div>
    ${contact.email ? `<div class="detail-row"><i class="fas fa-envelope"></i><span class="detail-label">Email</span><span>${escHtml(contact.email)}</span></div>` : ''}
    ${contact.address ? `<div class="detail-row"><i class="fas fa-map-marker-alt"></i><span class="detail-label">Address</span><span>${escHtml(contact.address)}</span></div>` : ''}
    ${contact.notes ? `<div class="detail-row"><i class="fas fa-sticky-note"></i><span class="detail-label">Notes</span><span>${escHtml(contact.notes)}</span></div>` : ''}
    <div class="detail-row"><i class="fas fa-clock"></i><span class="detail-label">Added</span><span>${new Date(contact.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span></div>
    <div class="view-actions">
      <button class="btn btn-primary edit-btn" data-id="${contact.id}"><i class="fas fa-pen"></i> Edit</button>
      <button class="btn btn-danger delete-btn" data-id="${contact.id}"><i class="fas fa-trash"></i> Delete</button>
      <a class="btn btn-ghost" href="tel:${contact.phone}"><i class="fas fa-phone-alt"></i> Call</a>
      ${contact.email ? `<a class="btn btn-ghost" href="mailto:${contact.email}"><i class="fas fa-envelope"></i> Email</a>` : ''}
    </div>
  `;
}

/* =================== Alpha Nav =================== */

function renderAlphaNav(contacts) {
  const nav = document.getElementById('alphaNav');
  const present = new Set(contacts.map(c => c.name[0].toUpperCase()));
  nav.innerHTML = '';

  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'alpha-btn' + (present.has(letter) ? '' : ' disabled');
    btn.textContent = letter;
    btn.disabled = !present.has(letter);
    btn.dataset.letter = letter;
    if (!present.has(letter)) btn.style.opacity = '.3';
    nav.appendChild(btn);
  });
}

/* =================== Group Filter Options =================== */

function renderGroupOptions(groups) {
  const sel = document.getElementById('filterGroup');
  const cur = sel.value;
  sel.innerHTML = '<option value="all">All Groups</option>';
  groups.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g; opt.textContent = g;
    if (g === cur) opt.selected = true;
    sel.appendChild(opt);
  });
}

/* =================== Stats =================== */

function updateStats(stats) {
  document.getElementById('totalCount').textContent = stats.total;
  document.getElementById('groupCount').textContent = stats.groups;
  document.getElementById('favCount').textContent = stats.favorites;
}

/* =================== Avatar Color Picker =================== */

function renderAvatarColorPicker(selectedColor) {
  const container = document.getElementById('avatarColors');
  container.innerHTML = '';
  AVATAR_COLORS.forEach(color => {
    const dot = document.createElement('div');
    dot.className = 'color-dot' + (color === selectedColor ? ' selected' : '');
    dot.style.background = color;
    dot.dataset.color = color;
    container.appendChild(dot);
  });
}

/* =================== Toast =================== */

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* =================== Helpers =================== */

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function downloadFile(content, filename, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
