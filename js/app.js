/**
 * app.js – Main Application Controller
 * ======================================
 * Wires all UI events to ContactStore operations.
 * Handles search, sort, filter, undo/redo, import/export,
 * dark mode, and mobile navigation.
 */

'use strict';

/* ======================== Init ======================== */
const store = new ContactStore();

let currentView    = 'grid';
let currentSort    = 'name-asc';
let currentGroup   = 'all';
let currentSearch  = '';
let editingId      = null;
let deleteTarget   = null;
let selectedColor  = '#6366f1';
let undoTimer      = null;

// Elements
const contactsGrid   = document.getElementById('contactsGrid');
const searchInput    = document.getElementById('searchInput');
const sortSelect     = document.getElementById('sortSelect');
const filterGroup    = document.getElementById('filterGroup');
const gridViewBtn    = document.getElementById('gridView');
const listViewBtn    = document.getElementById('listView');
const contactModal   = document.getElementById('contactModal');
const viewModal      = document.getElementById('viewModal');
const deleteModal    = document.getElementById('deleteModal');
const contactForm    = document.getElementById('contactForm');
const modalTitle     = document.getElementById('modalTitle');
const undoBar        = document.getElementById('undoBar');
const undoBtn        = document.getElementById('undoBtn');
const undoMsg        = document.getElementById('undoMsg');
const fabMain        = document.getElementById('fabMain');
const fabOptions     = document.getElementById('fabOptions');

/* ======================== Render ======================== */

function refreshUI() {
  let contacts = store.all();

  // Apply group filter
  if (currentGroup !== 'all') {
    contacts = contacts.filter(c => c.group === currentGroup);
  }

  // Apply search
  if (currentSearch.trim()) {
    contacts = BinarySearch.linearSearch(contacts, currentSearch);
  }

  // Apply sort
  const comparators = {
    'name-asc':   QuickSort.byNameAsc,
    'name-desc':  QuickSort.byNameDesc,
    'phone-asc':  QuickSort.byPhoneAsc,
    'recent':     QuickSort.byRecent,
    'favorites':  QuickSort.favoriteFirst,
  };
  QuickSort.sort(contacts, comparators[currentSort] || QuickSort.byNameAsc);

  renderContactsGrid(contacts, currentView === 'list');
  renderAlphaNav(store.all());
  renderGroupOptions(store.groups());
  updateStats(store.stats());
  bindCardEvents();
}

function bindCardEvents() {
  // View buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openViewModal(btn.dataset.id || btn.closest('[data-id]')?.dataset.id);
    });
  });

  // Edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id || btn.closest('[data-id]')?.dataset.id;
      if (id) openEditModal(id);
    });
  });

  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id || btn.closest('[data-id]')?.dataset.id;
      if (id) openDeleteModal(id);
    });
  });

  // Favorite toggle
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const contact = store.get(id);
      if (!contact) return;
      store.update(id, { ...contact, isFavorite: !contact.isFavorite });
      refreshUI();
      showToast(contact.isFavorite ? 'Removed from favorites' : 'Added to favorites ⭐', 'success');
    });
  });

  // Card click → view
  document.querySelectorAll('.contact-card').forEach(card => {
    card.addEventListener('click', () => openViewModal(card.dataset.id));
  });
}

/* ======================== Modals ======================== */

function openAddModal() {
  editingId = null;
  selectedColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  modalTitle.textContent = 'Add New Contact';
  contactForm.reset();
  clearErrors();
  document.getElementById('avatarPreview').style.background = selectedColor;
  document.getElementById('avatarPreview').innerHTML = '<i class="fas fa-user"></i>';
  renderAvatarColorPicker(selectedColor);
  contactModal.classList.add('open');
}

function openEditModal(id) {
  const c = store.get(id);
  if (!c) return;
  editingId = id;
  selectedColor = c.color || '#6366f1';
  modalTitle.textContent = 'Edit Contact';

  document.getElementById('firstName').value = c.firstName;
  document.getElementById('lastName').value  = c.lastName;
  document.getElementById('phone').value     = c.phone;
  document.getElementById('email').value     = c.email;
  document.getElementById('group').value     = c.group;
  document.getElementById('address').value   = c.address;
  document.getElementById('notes').value     = c.notes;
  document.getElementById('isFavorite').checked = c.isFavorite;

  const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('avatarPreview').style.background = selectedColor;
  document.getElementById('avatarPreview').textContent = initials;

  renderAvatarColorPicker(selectedColor);
  clearErrors();
  closeViewModal();
  contactModal.classList.add('open');
}

function openViewModal(id) {
  const c = store.get(id);
  if (!c) return;
  document.getElementById('viewModalBody').innerHTML = renderViewModal(c);
  viewModal.classList.add('open');

  // bind buttons in view modal
  viewModal.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
  viewModal.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => { closeViewModal(); openDeleteModal(btn.dataset.id); });
  });
}

function openDeleteModal(id) {
  deleteTarget = id;
  const c = store.get(id);
  document.getElementById('deleteName').textContent = c ? c.name : '';
  deleteModal.classList.add('open');
}

function closeContactModal() {
  contactModal.classList.remove('open');
  editingId = null;
}

function closeViewModal() {
  viewModal.classList.remove('open');
}

function closeDeleteModal() {
  deleteModal.classList.remove('open');
  deleteTarget = null;
}

function clearErrors() {
  ['firstNameErr', 'phoneErr', 'emailErr'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

/* ======================== Form Submit ======================== */

contactForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  const data = {
    firstName: document.getElementById('firstName').value,
    lastName:  document.getElementById('lastName').value,
    phone:     document.getElementById('phone').value,
    email:     document.getElementById('email').value,
    group:     document.getElementById('group').value,
    address:   document.getElementById('address').value,
    notes:     document.getElementById('notes').value,
    isFavorite: document.getElementById('isFavorite').checked,
    color:     selectedColor,
  };

  if (editingId) {
    const result = store.update(editingId, data);
    if (result) {
      showToast('Contact updated successfully!', 'success');
    }
  } else {
    const result = store.add(data);
    if (result === null) {
      document.getElementById('phoneErr').textContent = 'A contact with this phone number already exists.';
      return;
    }
    showToast('Contact added successfully!', 'success');
  }

  closeContactModal();
  refreshUI();
});

function validateForm() {
  let valid = true;
  clearErrors();

  const firstName = document.getElementById('firstName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!firstName) {
    document.getElementById('firstNameErr').textContent = 'First name is required.';
    valid = false;
  }
  if (!phone) {
    document.getElementById('phoneErr').textContent = 'Phone number is required.';
    valid = false;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('emailErr').textContent = 'Invalid email address.';
    valid = false;
  }
  return valid;
}

/* ======================== Delete ======================== */

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  if (!deleteTarget) return;
  const contact = store.get(deleteTarget);
  store.delete(deleteTarget);
  closeDeleteModal();
  refreshUI();
  showUndoBar(`"${contact.name}" deleted.`);
});

function showUndoBar(msg) {
  undoMsg.textContent = msg;
  undoBar.style.display = 'flex';
  if (undoTimer) clearTimeout(undoTimer);
  undoTimer = setTimeout(() => { undoBar.style.display = 'none'; }, 5000);
}

undoBtn.addEventListener('click', () => {
  store.undo();
  undoBar.style.display = 'none';
  clearTimeout(undoTimer);
  refreshUI();
  showToast('Action undone!', 'success');
});

/* ======================== Avatar Color ======================== */

document.getElementById('avatarColors').addEventListener('click', e => {
  const dot = e.target.closest('.color-dot');
  if (!dot) return;
  selectedColor = dot.dataset.color;
  document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
  dot.classList.add('selected');
  document.getElementById('avatarPreview').style.background = selectedColor;
});

// Update avatar initials while typing
document.getElementById('firstName').addEventListener('input', updateAvatarPreview);
document.getElementById('lastName').addEventListener('input', updateAvatarPreview);

function updateAvatarPreview() {
  const fn = document.getElementById('firstName').value.trim();
  const ln = document.getElementById('lastName').value.trim();
  const name = `${fn} ${ln}`.trim();
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('avatarPreview').textContent = initials || '';
  if (!initials) document.getElementById('avatarPreview').innerHTML = '<i class="fas fa-user"></i>';
}

/* ======================== Search ======================== */

searchInput.addEventListener('input', debounce(() => {
  currentSearch = searchInput.value;
  const tag = document.getElementById('searchTag');
  if (currentSearch.trim()) {
    tag.textContent = `"${currentSearch}"`;
    tag.style.display = 'inline';
  } else {
    tag.style.display = 'none';
  }
  refreshUI();
}, 250));

/* ======================== Sort ======================== */

sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  refreshUI();
});

/* ======================== Group Filter ======================== */

filterGroup.addEventListener('change', () => {
  currentGroup = filterGroup.value;
  refreshUI();
});

/* ======================== View Toggle ======================== */

gridViewBtn.addEventListener('click', () => {
  currentView = 'grid';
  contactsGrid.classList.remove('list-view');
  gridViewBtn.classList.add('active');
  listViewBtn.classList.remove('active');
  refreshUI();
});

listViewBtn.addEventListener('click', () => {
  currentView = 'list';
  contactsGrid.classList.add('list-view');
  listViewBtn.classList.add('active');
  gridViewBtn.classList.remove('active');
  refreshUI();
});

/* ======================== Alpha Nav ======================== */

document.getElementById('alphaNav').addEventListener('click', e => {
  const btn = e.target.closest('.alpha-btn');
  if (!btn || btn.disabled) return;
  const letter = btn.dataset.letter;

  // Toggle filter
  if (currentSearch === `^${letter}`) {
    currentSearch = '';
    searchInput.value = '';
    document.getElementById('searchTag').style.display = 'none';
    document.querySelectorAll('.alpha-btn').forEach(b => b.classList.remove('active'));
  } else {
    currentSearch = `^${letter}`;
    document.querySelectorAll('.alpha-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    searchInput.value = '';
    document.getElementById('searchTag').textContent = letter;
    document.getElementById('searchTag').style.display = 'inline';
  }

  // Filter by first letter
  const contacts = store.all().filter(c =>
    currentSearch ? c.name.toUpperCase().startsWith(letter) : true
  );

  if (currentGroup !== 'all') {
    const groupFiltered = contacts.filter(c => c.group === currentGroup);
    renderContactsGrid(QuickSort.sort(groupFiltered, QuickSort.byNameAsc), currentView === 'list');
  } else {
    renderContactsGrid(QuickSort.sort(contacts, QuickSort.byNameAsc), currentView === 'list');
  }
  bindCardEvents();
});

/* ======================== Modal Open Buttons ======================== */

['addContactBtn','heroAddBtn','emptyAddBtn'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', openAddModal);
});

document.getElementById('heroDSABtn').addEventListener('click', () => {
  document.getElementById('dsa-section').scrollIntoView({ behavior: 'smooth' });
});

/* ======================== Modal Close ======================== */

document.getElementById('modalClose').addEventListener('click', closeContactModal);
document.getElementById('cancelBtn').addEventListener('click', closeContactModal);
document.getElementById('viewModalClose').addEventListener('click', closeViewModal);
document.getElementById('deleteModalClose').addEventListener('click', closeDeleteModal);
document.getElementById('deleteCancelBtn').addEventListener('click', closeDeleteModal);

// Close on overlay click
[contactModal, viewModal, deleteModal].forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    contactModal.classList.remove('open');
    viewModal.classList.remove('open');
    deleteModal.classList.remove('open');
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { store.undo(); refreshUI(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') { store.redo(); refreshUI(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    searchInput.focus();
  }
});

/* ======================== Theme ======================== */

const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('cv_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('cv_theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  themeToggle.innerHTML = theme === 'dark'
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
}

/* ======================== Hamburger ======================== */

document.getElementById('hamburger').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('mobile-open');
});

/* ======================== Nav Links Active ======================== */

const sections = ['home','contacts-section','dsa-section','about-section'];
const navLinks = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const link = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) observer.observe(el);
});

/* ======================== FAB ======================== */

fabMain.addEventListener('click', () => {
  fabOptions.classList.toggle('open');
});

document.getElementById('exportJson').addEventListener('click', () => {
  downloadFile(store.exportJSON(), 'contacts.json', 'application/json');
  showToast('Contacts exported as JSON!', 'success');
  fabOptions.classList.remove('open');
});

document.getElementById('exportCsv').addEventListener('click', () => {
  const csv = store.exportCSV();
  if (!csv) return showToast('No contacts to export.', 'error');
  downloadFile(csv, 'contacts.csv', 'text/csv');
  showToast('Contacts exported as CSV!', 'success');
  fabOptions.classList.remove('open');
});

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
  fabOptions.classList.remove('open');
});

document.getElementById('importFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const added = store.importJSON(ev.target.result);
      refreshUI();
      showToast(`Imported ${added} contacts!`, 'success');
    } catch {
      showToast('Invalid JSON file.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

/* ======================== Utility ======================== */

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

/* ======================== Boot ======================== */
refreshUI();
