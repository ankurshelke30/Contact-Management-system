/**
 * HashTable.js
 * ============
 * A hash table implementation using separate chaining (linked lists)
 * for collision resolution. Contacts are keyed by phone number.
 *
 * Time Complexity:
 *   - Insert: O(1) average, O(n) worst case
 *   - Search: O(1) average, O(n) worst case
 *   - Delete: O(1) average, O(n) worst case
 * Space Complexity: O(n)
 */

class HashNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.next = null;
  }
}

class HashTable {
  constructor(size = 64) {
    this.size = size;
    this.buckets = new Array(size).fill(null);
    this.count = 0;
  }

  /** Polynomial rolling hash function */
  _hash(key) {
    let hash = 0;
    const prime = 31;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * prime + key.charCodeAt(i)) % this.size;
    }
    return Math.abs(hash);
  }

  /** Insert or update a key-value pair */
  set(key, value) {
    const index = this._hash(String(key));
    let node = this.buckets[index];

    // Update if key exists
    while (node) {
      if (node.key === String(key)) {
        node.value = value;
        return;
      }
      node = node.next;
    }

    // Insert at head (chaining)
    const newNode = new HashNode(String(key), value);
    newNode.next = this.buckets[index];
    this.buckets[index] = newNode;
    this.count++;

    // Resize if load factor > 0.75
    if (this.count / this.size > 0.75) {
      this._resize();
    }
  }

  /** Retrieve a value by key */
  get(key) {
    const index = this._hash(String(key));
    let node = this.buckets[index];
    while (node) {
      if (node.key === String(key)) return node.value;
      node = node.next;
    }
    return null;
  }

  /** Remove a key-value pair */
  delete(key) {
    const index = this._hash(String(key));
    let node = this.buckets[index];
    let prev = null;

    while (node) {
      if (node.key === String(key)) {
        if (prev) prev.next = node.next;
        else this.buckets[index] = node.next;
        this.count--;
        return true;
      }
      prev = node;
      node = node.next;
    }
    return false;
  }

  /** Check if key exists */
  has(key) {
    return this.get(key) !== null;
  }

  /** Get all values */
  values() {
    const result = [];
    for (const bucket of this.buckets) {
      let node = bucket;
      while (node) {
        result.push(node.value);
        node = node.next;
      }
    }
    return result;
  }

  /** Get all keys */
  keys() {
    const result = [];
    for (const bucket of this.buckets) {
      let node = bucket;
      while (node) {
        result.push(node.key);
        node = node.next;
      }
    }
    return result;
  }

  /** Resize when load factor exceeds threshold */
  _resize() {
    const oldBuckets = this.buckets;
    this.size *= 2;
    this.buckets = new Array(this.size).fill(null);
    this.count = 0;

    for (const bucket of oldBuckets) {
      let node = bucket;
      while (node) {
        this.set(node.key, node.value);
        node = node.next;
      }
    }
  }

  /** Get load factor */
  loadFactor() {
    return (this.count / this.size).toFixed(2);
  }

  /** Get number of collisions */
  collisions() {
    let collisions = 0;
    for (const bucket of this.buckets) {
      if (bucket && bucket.next) {
        let node = bucket.next;
        while (node) { collisions++; node = node.next; }
      }
    }
    return collisions;
  }
}
