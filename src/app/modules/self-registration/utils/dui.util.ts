import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Deja solo dígitos (máx. 9) y formatea como 00000000-0. */
export function formatDui(raw: string): string {
  const d = (raw || '').replace(/\D/g, '').slice(0, 9);
  return d.length > 8 ? `${d.slice(0, 8)}-${d.slice(8)}` : d;
}

/** Valida el dígito verificador del DUI (módulo 10, pesos 9..2). */
export function isValidDui(value: string): boolean {
  const d = (value || '').replace(/\D/g, '');
  if (d.length !== 9 || /^0+$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number(d[i]) * (9 - i);
  return (10 - (sum % 10)) % 10 === Number(d[8]);
}

export function duiValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value as string;
  if (!v) return null;
  return isValidDui(v) ? null : { dui: true };
}
