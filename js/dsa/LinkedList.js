/**
 * LinkedList.js – Doubly Linked List
 * ====================================
 * Maintains a list of recently added/accessed contacts.
 * Supports O(1) insertion at head/tail and removal from any position.
 *
 * Time Complexity:
 *   - prepend / append: O(1)
 *   - remove: O(n)
 *   - toArray: O(n)
 */

class ListNode {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor(maxSize = 10) {
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.maxSize = maxSize;
  }

  /** Add to front (most recent) */
  prepend(data) {
    const node = new ListNode(data);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.size++;

    // Keep list bounded
    if (this.size > this.maxSize) this.removeLast();
  }

  /** Add to tail */
  append(data) {
    const node = new ListNode(data);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.size++;
  }

  /** Remove from tail */
  removeLast() {
    if (!this.tail) return null;
    const data = this.tail.data;
    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.tail = this.tail.prev;
      this.tail.next = null;
    }
    this.size--;
    return data;
  }

  /** Remove node by id field */
  removeById(id) {
    let node = this.head;
    while (node) {
      if (node.data && node.data.id === id) {
        if (node.prev) node.prev.next = node.next;
        else this.head = node.next;
        if (node.next) node.next.prev = node.prev;
        else this.tail = node.prev;
        this.size--;
        return true;
      }
      node = node.next;
    }
    return false;
  }

  /** Convert to array (head → tail) */
  toArray() {
    const arr = [];
    let node = this.head;
    while (node) {
      arr.push(node.data);
      node = node.next;
    }
    return arr;
  }

  /** Clear list */
  clear() {
    this.head = this.tail = null;
    this.size = 0;
  }

  /** Peek at head */
  peekHead() {
    return this.head ? this.head.data : null;
  }
}
