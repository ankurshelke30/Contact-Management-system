/**
 * BST.js – Binary Search Tree
 * ============================
 * Contacts are indexed by name for O(log n) alphabetical traversal,
 * prefix search, and range queries.
 *
 * Time Complexity:
 *   - Insert: O(log n) average, O(n) worst (unbalanced)
 *   - Search: O(log n) average
 *   - Delete: O(log n) average
 *   - In-order (sorted list): O(n)
 */

class BSTNode {
  constructor(name, id) {
    this.name = name.toLowerCase();
    this.id = id;               // Contact id (phone)
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  /** Insert a contact by name */
  insert(name, id) {
    this.root = this._insert(this.root, name, id);
  }

  _insert(node, name, id) {
    if (!node) return new BSTNode(name, id);
    const lname = name.toLowerCase();
    if (lname < node.name) node.left = this._insert(node.left, name, id);
    else if (lname > node.name) node.right = this._insert(node.right, name, id);
    else {
      // Update id if same name
      node.id = id;
    }
    return node;
  }

  /** Search for exact name */
  search(name) {
    return this._search(this.root, name.toLowerCase());
  }

  _search(node, name) {
    if (!node) return null;
    if (name === node.name) return node;
    if (name < node.name) return this._search(node.left, name);
    return this._search(node.right, name);
  }

  /** Delete a contact by name */
  delete(name) {
    this.root = this._delete(this.root, name.toLowerCase());
  }

  _delete(node, name) {
    if (!node) return null;
    if (name < node.name) {
      node.left = this._delete(node.left, name);
    } else if (name > node.name) {
      node.right = this._delete(node.right, name);
    } else {
      // Node with one or no child
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      // Node with two children: get in-order successor
      const successor = this._min(node.right);
      node.name = successor.name;
      node.id = successor.id;
      node.right = this._delete(node.right, successor.name);
    }
    return node;
  }

  _min(node) {
    while (node.left) node = node.left;
    return node;
  }

  /** In-order traversal → sorted by name */
  inOrder() {
    const result = [];
    this._inOrder(this.root, result);
    return result;
  }

  _inOrder(node, result) {
    if (!node) return;
    this._inOrder(node.left, result);
    result.push({ name: node.name, id: node.id });
    this._inOrder(node.right, result);
  }

  /** Prefix search – find all contacts whose name starts with prefix */
  prefixSearch(prefix) {
    const result = [];
    this._prefixSearch(this.root, prefix.toLowerCase(), result);
    return result;
  }

  _prefixSearch(node, prefix, result) {
    if (!node) return;
    if (node.name.startsWith(prefix)) {
      this._inOrder(node.left, result);  // collect left subtree
      result.push({ name: node.name, id: node.id });
      this._inOrder(node.right, result); // collect right subtree
      return;
    }
    if (prefix < node.name) this._prefixSearch(node.left, prefix, result);
    else this._prefixSearch(node.right, prefix, result);
  }

  /** Get height of the tree */
  height() {
    return this._height(this.root);
  }

  _height(node) {
    if (!node) return 0;
    return 1 + Math.max(this._height(node.left), this._height(node.right));
  }

  /** Clear tree */
  clear() {
    this.root = null;
  }
}
