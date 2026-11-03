/**
 * Lee el warehouse (sucursal) del query param ?warehouse=119.
 * Es opcional: si falta o trae caracteres raros se ignora (undefined) y el formulario funciona igual.
 */
export function parseWarehouse(value: string | null | undefined): string | undefined {
  const v = (value ?? '').trim();
  return /^[A-Za-z0-9_-]{1,50}$/.test(v) ? v : undefined;
}
