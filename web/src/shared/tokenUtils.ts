export function getTokenFromHash(): string {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('token') || '';
}
