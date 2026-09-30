/**
 * BinarySearch.js
 * ================
 * Binary search on a sorted contact array.
 * Requires the array to be sorted by the target field.
 *
 * Time Complexity:  O(log n)
 * Space Complexity: O(1)  [iterative]
 */

class BinarySearch {
  /**
   * Search for a contact whose `field` equals `target`.
   * Array must be sorted by `field` ascending.
   * @returns {number} index of found element, or -1
   */
  static search(sortedArr, target, field = 'name') {
    let low = 0;
    let high = sortedArr.length - 1;
    const t = target.toLowerCase();

    while (low <= high) {
      const mid = (low + high) >>> 1;           // unsigned right shift = fast floor division
      const val = String(sortedArr[mid][field]).toLowerCase();

      if (val === t) return mid;
      if (val < t) low = mid + 1;
      else high = mid - 1;
    }
    return -1;
  }

  /**
   * Find all contacts whose `field` starts with `prefix`.
   * Uses two binary searches to find the range [left, right].
   * @returns {Array} matching contacts
   */
  static prefixSearch(sortedArr, prefix, field = 'name') {
    const p = prefix.toLowerCase();
    const left = this._lowerBound(sortedArr, p, field);
    if (left === -1) return [];

    const results = [];
    for (let i = left; i < sortedArr.length; i++) {
      const val = String(sortedArr[i][field]).toLowerCase();
      if (!val.startsWith(p)) break;
      results.push(sortedArr[i]);
    }
    return results;
  }

  /** Find first index where field >= prefix */
  static _lowerBound(arr, prefix, field) {
    let low = 0, high = arr.length - 1, result = -1;
    while (low <= high) {
      const mid = (low + high) >>> 1;
      const val = String(arr[mid][field]).toLowerCase();
      if (val >= prefix) {
        if (val.startsWith(prefix)) result = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return result;
  }

  /**
   * Linear fallback search — searches name, phone and email.
   * Used for general search when array isn't sorted.
   * O(n) time.
   */
  static linearSearch(arr, query) {
    const q = query.toLowerCase().trim();
    if (!q) return arr;
    return arr.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  }
}
