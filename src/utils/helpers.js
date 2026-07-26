// Misc pure utility functions shared across components/hooks.

/** Merge conditional class names without an external dependency. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Generic case-insensitive multi-field search filter for table data. */
export function searchFilter(items, query, fields) {
  if (!query) return items;
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter((item) =>
    fields.some((field) => {
      const value = getNestedValue(item, field);
      return value != null && String(value).toLowerCase().includes(q);
    })
  );
}

/** Access nested object values via dot-notation path, e.g. "user.email". */
export function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

/** Generic column sort — direction is 'asc' | 'desc'. */
export function sortItems(items, key, direction = 'asc') {
  if (!key) return items;
  const sorted = [...items].sort((a, b) => {
    const aVal = getNestedValue(a, key);
    const bVal = getNestedValue(b, key);

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return aVal - bVal;
    }

    return String(aVal).localeCompare(String(bVal));
  });

  return direction === 'desc' ? sorted.reverse() : sorted;
}

/** Filter items by exact-match status field, 'all' bypasses filtering. */
export function filterByStatus(items, status, field = 'status') {
  if (!status || status === 'all') return items;
  return items.filter((item) => item[field] === status);
}

/** Clamp a number between min and max. */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/** Generate a simple unique id for client-side keys/toasts. */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Download a JSON-serializable object as a .csv file (basic export util). */
export function exportToCsv(filename, rows) {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
