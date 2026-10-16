import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Deja solo dígitos (máx. 9) y formatea como 00000000-0. */
export function formatDui(raw: string): string {
  const d = (raw || '').replace(/\D/g, '').slice(0, 9);
  return d.length > 8 ? `${d.slice(0, 8)}-${d.slice(8)}` : d;
}

/** Solo revisa el formato: 9 dígitos y que no sea todo ceros. NO valida el dígito verificador (la existencia la confirma Odoo). */
export function isValidDui(value: string): boolean {
  const d = (value || '').replace(/\D/g, '');
  return d.length === 9 && !/^0+$/.test(d);
}

export function duiValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value as string;
  if (!v) return null;
  return isValidDui(v) ? null : { dui: true };
}
