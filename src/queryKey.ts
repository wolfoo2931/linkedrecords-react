// Callers usually pass a new query on every render, so effects depend on a
// serialized key instead of the query identity. Functions (e.g. record
// classes) would serialize to null, so they are keyed by name.
export function getQueryKey(query: unknown): string {
  return JSON.stringify(query, (_, v) => (typeof v === 'function' ? `fn:${v.name}` : v));
}
