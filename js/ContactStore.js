/**
 * ContactStore.js
 * ================
 * Orchestrates all DSA structures:
 *   - HashTable  → primary store (phone as key)
 *   - BST        → name index for sorted traversal
 *   - LinkedList → recent contacts (most recently added/edited)
 *   - Stack      → undo/redo history
 *
 * Also handles LocalStorage persistence.
 */

const STORAGE_KEY = 'contactvault_contacts';

class ContactStore {
  constructor() {
    this.table    = new HashTable(64);
    this.bst      = new BST();
    this.recent   = new DoublyLinkedList(10);
    this.undoStack = new Stack(50);
    this.redoStack = new Stack(50);

    this._load();
  }

  /* ===================== CRUD ===================== */

  /**
   * Add a new contact.
   * @param {Object} data – { firstName, lastName, phone, email, group, address, notes, isFavorite, color }
   * @returns {Object|null} created contact or null if phone duplicate
   */
  add(data) {
    const id = this._normalizePhone(data.phone);
    if (this.table.has(id)) return null; // duplicate

    const contact = {
      id,
      name: `${data.firstName.trim()} ${(data.lastName || '').trim()}`.trim(),
      firstName: data.firstName.trim(),
      lastName: (data.lastName || '').trim(),
      phone: data.phone.trim(),
      email: (data.email || '').trim(),
      group: data.group || 'Personal',
      address: (data.address || '').trim(),
      notes: (data.notes || '').trim(),
      isFavorite: !!data.isFavorite,
      color: data.color || '#6366f1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.table.set(id, contact);
    this.bst.insert(contact.name, id);
    this.recent.prepend(contact);

    // Push undo action
    this.undoStack.push({ type: 'ADD', contact: { ...contact } });
    this.redoStack.clear();

    this._save();
    return contact;
  }

  /**
   * Update an existing contact.
   * @param {string} id – phone key
   * @param {Object} data – fields to update
   */
  update(id, data) {
    const old = this.table.get(id);
    if (!old) return null;

    // Remove old BST entry
    this.bst.delete(old.name);
    this.recent.removeById(id);

    const updated = {
      ...old,
      firstName: data.firstName.trim(),
      lastName: (data.lastName || '').trim(),
      name: `${data.firstName.trim()} ${(data.lastName || '').trim()}`.trim(),
      phone: data.phone.trim(),
      email: (data.email || '').trim(),
      group: data.group || old.group,
      address: (data.address || '').trim(),
      notes: (data.notes || '').trim(),
      isFavorite: !!data.isFavorite,
      color: data.color || old.color,
      updatedAt: new Date().toISOString(),
    };

    this.table.set(id, updated);
    this.bst.insert(updated.name, id);
    this.recent.prepend(updated);

    this.undoStack.push({ type: 'EDIT', old: { ...old }, updated: { ...updated } });
    this.redoStack.clear();

    this._save();
    return updated;
  }

  /**
   * Delete a contact by phone key.
   */
  delete(id) {
    const contact = this.table.get(id);
    if (!contact) return false;

    this.table.delete(id);
    this.bst.delete(contact.name);
    this.recent.removeById(id);

    this.undoStack.push({ type: 'DELETE', contact: { ...contact } });
    this.redoStack.clear();

    this._save();
    return true;
  }

  /** Get one contact by id */
  get(id) {
    return this.table.get(id);
  }

  /* =================== UNDO/REDO =================== */

  undo() {
    const action = this.undoStack.pop();
    if (!action) return null;

    if (action.type === 'ADD') {
      this.table.delete(action.contact.id);
      this.bst.delete(action.contact.name);
      this.recent.removeById(action.contact.id);
      this.redoStack.push(action);
    } else if (action.type === 'DELETE') {
      this.table.set(action.contact.id, action.contact);
      this.bst.insert(action.contact.name, action.contact.id);
      this.recent.prepend(action.contact);
      this.redoStack.push(action);
    } else if (action.type === 'EDIT') {
      // Revert to old
      this.table.set(action.old.id, action.old);
      this.bst.delete(action.updated.name);
      this.bst.insert(action.old.name, action.old.id);
      this.recent.removeById(action.old.id);
      this.recent.prepend(action.old);
      this.redoStack.push(action);
    }

    this._save();
    return action;
  }

  redo() {
    const action = this.redoStack.pop();
    if (!action) return null;

    if (action.type === 'ADD') {
      this.table.set(action.contact.id, action.contact);
      this.bst.insert(action.contact.name, action.contact.id);
      this.recent.prepend(action.contact);
      this.undoStack.push(action);
    } else if (action.type === 'DELETE') {
      this.table.delete(action.contact.id);
      this.bst.delete(action.contact.name);
      this.recent.removeById(action.contact.id);
      this.undoStack.push(action);
    } else if (action.type === 'EDIT') {
      this.table.set(action.updated.id, action.updated);
      this.bst.delete(action.old.name);
      this.bst.insert(action.updated.name, action.updated.id);
      this.recent.removeById(action.updated.id);
      this.recent.prepend(action.updated);
      this.undoStack.push(action);
    }

    this._save();
    return action;
  }

  /* =================== QUERY =================== */

  /** Get all contacts as array */
  all() {
    return this.table.values();
  }

  /** Get contacts sorted by given criterion */
  sorted(criterion = 'name-asc') {
    const arr = this.all();
    const comparators = {
      'name-asc':   QuickSort.byNameAsc,
      'name-desc':  QuickSort.byNameDesc,
      'phone-asc':  QuickSort.byPhoneAsc,
      'recent':     QuickSort.byRecent,
      'favorites':  QuickSort.favoriteFirst,
    };
    return QuickSort.sort(arr, comparators[criterion] || QuickSort.byNameAsc);
  }

  /** Search contacts */
  search(query) {
    if (!query) return this.all();
    return BinarySearch.linearSearch(this.all(), query);
  }

  /** Get contacts by group */
  byGroup(group) {
    if (!group || group === 'all') return this.all();
    return this.all().filter(c => c.group === group);
  }

  /** Get unique groups */
  groups() {
    const gs = new Set(this.all().map(c => c.group));
    return [...gs].sort();
  }

  /** Stats */
  stats() {
    const all = this.all();
    return {
      total: all.length,
      favorites: all.filter(c => c.isFavorite).length,
      groups: new Set(all.map(c => c.group)).size,
    };
  }

  /* =================== EXPORT / IMPORT =================== */

  exportJSON() {
    return JSON.stringify(this.all(), null, 2);
  }

  exportCSV() {
    const contacts = this.all();
    if (!contacts.length) return '';
    const headers = ['Name', 'Phone', 'Email', 'Group', 'Address', 'Notes', 'Favorite', 'Created'];
    const rows = contacts.map(c => [
      `"${c.name}"`, `"${c.phone}"`, `"${c.email}"`, `"${c.group}"`,
      `"${c.address}"`, `"${c.notes}"`, c.isFavorite ? 'Yes' : 'No',
      new Date(c.createdAt).toLocaleDateString()
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  importJSON(jsonString) {
    const contacts = JSON.parse(jsonString);
    let added = 0;
    for (const c of contacts) {
      if (this.add(c)) added++;
    }
    return added;
  }

  /* =================== PERSISTENCE =================== */

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.all()));
    } catch (e) {
      console.warn('ContactStore: LocalStorage save failed', e);
    }
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this._loadDefaults();
        return;
      }
      const contacts = JSON.parse(raw);
      for (const c of contacts) {
        this.table.set(c.id, c);
        this.bst.insert(c.name, c.id);
        this.recent.prepend(c);
      }
    } catch (e) {
      console.warn('ContactStore: Load failed', e);
    }
  }

  _loadDefaults() {
    const defaults = [
      { firstName: 'Alice', lastName: 'Johnson', phone: '+1-234-567-8901', email: 'alice@email.com', group: 'Work', address: 'New York, USA', notes: 'Team lead', isFavorite: true, color: '#6366f1' },
      { firstName: 'Bob', lastName: 'Smith', phone: '+1-234-567-8902', email: 'bob@email.com', group: 'Friends', address: 'Los Angeles, USA', notes: '', isFavorite: false, color: '#f59e0b' },
      { firstName: 'Carol', lastName: 'Williams', phone: '+1-234-567-8903', email: 'carol@email.com', group: 'Family', address: 'Chicago, USA', notes: 'Sister', isFavorite: true, color: '#10b981' },
      { firstName: 'David', lastName: 'Brown', phone: '+1-234-567-8904', email: 'david@email.com', group: 'Work', address: 'Houston, USA', notes: '', isFavorite: false, color: '#3b82f6' },
      { firstName: 'Eve', lastName: 'Davis', phone: '+1-234-567-8905', email: 'eve@email.com', group: 'Friends', address: 'Phoenix, USA', notes: 'College friend', isFavorite: false, color: '#ec4899' },
      { firstName: 'Frank', lastName: 'Miller', phone: '+1-234-567-8906', email: 'frank@email.com', group: 'Personal', address: 'San Antonio, USA', notes: '', isFavorite: false, color: '#f97316' },
    ];
    for (const d of defaults) this.add(d);
  }

  _normalizePhone(phone) {
    return phone.replace(/\s+/g, '').replace(/-/g, '');
  }
}
