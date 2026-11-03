import { describe, expect, it } from 'vitest';
import { parseWarehouse } from './warehouse.util';

describe('parseWarehouse', () => {
  it('acepta ids numéricos y códigos', () => {
    expect(parseWarehouse('119')).toBe('119');
    expect(parseWarehouse(' SV-01 ')).toBe('SV-01');
  });
  it('ignora vacío, nulo y valores raros', () => {
    expect(parseWarehouse(null)).toBeUndefined();
    expect(parseWarehouse(undefined)).toBeUndefined();
    expect(parseWarehouse('')).toBeUndefined();
    expect(parseWarehouse('119; DROP TABLE x')).toBeUndefined();
    expect(parseWarehouse('<script>')).toBeUndefined();
    expect(parseWarehouse('a'.repeat(51))).toBeUndefined();
  });
});
