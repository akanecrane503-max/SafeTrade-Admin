// Formatting helpers for currency, dates, numbers, and percentages.
// Keep all display-formatting logic here so components stay presentation-only.

export function formatCurrency(value, currency = 'USD', options = {}) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(num);
}

export function formatCrypto(value, decimals = 6) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return num.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
}

export function formatNumber(value, options = {}) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US', options).format(num);
}

export function formatCompactNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

export function formatPercent(value, decimals = 2) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
}

export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(value) {
  return formatDate(value, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(value);
}

export function truncateAddress(address, start = 6, end = 4) {
  if (!address || address.length <= start + end) return address || '—';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function truncateText(text, maxLength = 40) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
