export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[-‐‑–—]/g, ' ').trim().replace(/\s+/g, ' ');
