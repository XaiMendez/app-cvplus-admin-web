import { describe, expect, it } from 'vitest';
import { FormControl } from '@angular/forms';
import { duiValidator, formatDui, isValidDui } from './dui.util';

describe('formatDui', () => {
  it('agrega el guion antes del último dígito', () => {
    expect(formatDui('012345678')).toBe('01234567-8');
  });
  it('deja solo dígitos y limita a 9', () => {
    expect(formatDui('01.23a45-67 8999')).toBe('01234567-8');
  });
  it('no agrega guion hasta tener más de 8 dígitos', () => {
    expect(formatDui('0123')).toBe('0123');
    expect(formatDui('01234567')).toBe('01234567');
  });
  it('tolera vacío', () => {
    expect(formatDui('')).toBe('');
  });
});

describe('isValidDui', () => {
  it('acepta 9 dígitos, con o sin guion', () => {
    expect(isValidDui('01234567-8')).toBe(true);
    expect(isValidDui('012345678')).toBe(true);
  });
  it('no revisa el dígito verificador', () => {
    expect(isValidDui('01234567-9')).toBe(true);
  });
  it('rechaza longitud incorrecta', () => {
    expect(isValidDui('0123456-7')).toBe(false);
    expect(isValidDui('0123456789')).toBe(false);
    expect(isValidDui('')).toBe(false);
  });
  it('rechaza el DUI de solo ceros', () => {
    expect(isValidDui('00000000-0')).toBe(false);
  });
});

describe('duiValidator', () => {
  it('no marca error en vacío (lo cubre required)', () => {
    expect(duiValidator(new FormControl(''))).toBeNull();
  });
  it('marca error si la longitud es incorrecta', () => {
    expect(duiValidator(new FormControl('0123456-7'))).toEqual({ dui: true });
  });
  it('pasa con un DUI válido', () => {
    expect(duiValidator(new FormControl('01234567-8'))).toBeNull();
  });
});
