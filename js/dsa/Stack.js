/**
 * Stack.js
 * =========
 * A generic stack for undo/redo functionality.
 * Operations recorded: add, edit, delete.
 *
 * Time Complexity:
 *   - push: O(1)
 *   - pop:  O(1)
 *   - peek: O(1)
 */

class Stack {
  constructor(maxSize = 50) {
    this._data = [];
    this.maxSize = maxSize;
  }

  /** Push an item onto the stack */
  push(item) {
    if (this._data.length >= this.maxSize) {
      this._data.shift(); // remove oldest
    }
    this._data.push(item);
  }

  /** Pop the top item */
  pop() {
    if (this.isEmpty()) return null;
    return this._data.pop();
  }

  /** Peek at the top item without removing */
  peek() {
    if (this.isEmpty()) return null;
    return this._data[this._data.length - 1];
  }

  /** Check if stack is empty */
  isEmpty() {
    return this._data.length === 0;
  }

  /** Get stack size */
  get size() {
    return this._data.length;
  }

  /** Clear the stack */
  clear() {
    this._data = [];
  }

  /** Convert to array (bottom → top) */
  toArray() {
    return [...this._data];
  }
}
