/**
 * QuickSort.js
 * =============
 * Generic Quick Sort implementation for sorting contact arrays.
 * Uses Lomuto partition scheme with random pivot to avoid worst-case.
 *
 * Time Complexity:
 *   - Best:    O(n log n)
 *   - Average: O(n log n)
 *   - Worst:   O(n²)  [rare with random pivot]
 * Space Complexity: O(log n) stack frames
 */

class QuickSort {
  /**
   * Sort an array of contacts in-place.
   * @param {Array} arr   – Array of contact objects
   * @param {Function} compareFn – (a, b) => negative | 0 | positive
   */
  static sort(arr, compareFn) {
    if (!arr || arr.length <= 1) return arr;
    this._quickSort(arr, 0, arr.length - 1, compareFn);
    return arr;
  }

  static _quickSort(arr, low, high, cmp) {
    if (low < high) {
      const pivotIdx = this._partition(arr, low, high, cmp);
      this._quickSort(arr, low, pivotIdx - 1, cmp);
      this._quickSort(arr, pivotIdx + 1, high, cmp);
    }
  }

  /** Lomuto partition with random pivot */
  static _partition(arr, low, high, cmp) {
    // Random pivot to avoid worst-case on sorted arrays
    const randIdx = low + Math.floor(Math.random() * (high - low + 1));
    this._swap(arr, randIdx, high);

    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (cmp(arr[j], pivot) <= 0) {
        i++;
        this._swap(arr, i, j);
      }
    }
    this._swap(arr, i + 1, high);
    return i + 1;
  }

  static _swap(arr, i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  /* ---- Pre-built comparators ---- */

  static byNameAsc(a, b) {
    return a.name.localeCompare(b.name);
  }

  static byNameDesc(a, b) {
    return b.name.localeCompare(a.name);
  }

  static byPhoneAsc(a, b) {
    return a.phone.localeCompare(b.phone);
  }

  static byRecent(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }

  static favoriteFirst(a, b) {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return a.name.localeCompare(b.name);
  }
}
