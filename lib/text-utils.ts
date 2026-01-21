export function safeInitials(source?: string | null, fallback: string = 'DS') {
  if (!source) return fallback;
  const normalized = source
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  const letters = normalized.match(/[A-Za-z0-9]/g);
  if (!letters || letters.length === 0) return fallback;

  return letters.join('').slice(0, 2).toUpperCase();
}
