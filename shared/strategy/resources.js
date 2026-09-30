// Small, serializable resource vectors; the same code runs in Node and browsers.
export const RESOURCES = Object.freeze(['food', 'materials', 'knowledge', 'culture']);

export function resources(values = {}) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('Invalid resources');
  for (const key of Object.keys(values)) {
    if (!RESOURCES.includes(key)) throw new Error(`Unknown resource: ${key}`);
    if (!Number.isSafeInteger(values[key]) || values[key] < 0) throw new Error('Resources must be non-negative integers');
  }
  return Object.fromEntries(RESOURCES.map(key => [key, values[key] ?? 0]));
}

export function addResources(stock, amount) {
  const next = {};
  for (const key of RESOURCES) {
    next[key] = stock[key] + amount[key];
    if (!Number.isSafeInteger(next[key])) throw new Error('Resource overflow');
  }
  return next;
}

export function spendResources(stock, amount) {
  if (RESOURCES.some(key => stock[key] < amount[key])) throw new Error('Insufficient resources');
  return Object.fromEntries(RESOURCES.map(key => [key, stock[key] - amount[key]]));
}

export const resourceTotal = amount => RESOURCES.reduce((sum, key) => sum + amount[key], 0);
