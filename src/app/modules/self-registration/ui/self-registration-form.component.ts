import {
  Component, ElementRef, OnDestroy, OnInit, ChangeDetectionStrategy, ViewChild, computed, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { SelfRegistrationService } from '../data-access/self-registration.service';
import { ApiError, LookupResult } from '../models/odoo-contact.model';
import { duiValidator, formatDui } from '../utils/dui.util';
import { renderTurnstile } from '../utils/turnstile.util';
import { config } from '../../../../config';

type FormState = 'idle' | 'searching' | 'found' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-self-registration-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  templateUrl: './self-registration-form.component.html',
  styleUrl: './self-registration-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelfRegistrationFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private service = inject(SelfRegistrationService);

  readonly state = signal<FormState>('idle');
  readonly lookup = signal<LookupResult | null>(null);
  readonly errorMessage = signal('');
  readonly successName = signal('');
  readonly userEmail = signal('');
  readonly captchaToken = signal<string | null>(null);

  readonly supportPhone = config.supportPhone;
  readonly supportWhatsapp = config.supportWhatsapp;
  readonly termsUrl = config.termsUrl;
  readonly privacyUrl = config.privacyUrl;
  readonly captchaRequired = !!config.turnstileSiteKey;
  readonly captchaPending = computed(() => this.captchaRequired && !this.captchaToken());

  searchForm!: FormGroup;
  editForm!: FormGroup;

  private captcha: { reset: () => void; remove: () => void } | null = null;

  /** El contenedor del CAPTCHA solo existe en las pantallas de búsqueda; se pinta al aparecer. */
  @ViewChild('captchaHost')
  set captchaHost(ref: ElementRef<HTMLElement> | undefined) {
    this.captcha?.remove();
    this.captcha = null;
    if (!ref || !this.captchaRequired) return;
    this.captchaToken.set(null);
    renderTurnstile(ref.nativeElement, config.turnstileSiteKey, (t) => this.captchaToken.set(t))
      .then((c) => (this.captcha = c))
      .catch(() => this.errorMessage.set(this.withSupport('No pudimos cargar la verificación de seguridad. Recarga la página.')));
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      dui: ['', [Validators.required, duiValidator]]
    });
    this.editForm = this.fb.group({
      // Sin validación: se muestra lo que devuelve la API (el cliente puede corregirlo).
      name: [''],
      email: [''],
      phone: [''],
      accepted_terms: [false, Validators.requiredTrue],
      marketing_consent: [false]
    });
  }

  ngOnDestroy() {
    this.captcha?.remove();
  }

  onDuiInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = formatDui(input.value);
    input.value = formatted;
    this.searchForm.get('dui')?.setValue(formatted, { emitEvent: false });
    this.searchForm.get('dui')?.updateValueAndValidity({ emitEvent: false });
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const d = input.value.replace(/\D/g, '').slice(0, 8);
    const formatted = d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
    input.value = formatted;
    this.editForm.get('phone')?.setValue(formatted, { emitEvent: false });
    this.editForm.get('phone')?.updateValueAndValidity({ emitEvent: false });
  }

  async onSearchContact() {
    if (this.searchForm.invalid || this.captchaPending() || this.state() === 'searching') return;

    const captchaToken = this.captchaToken() ?? undefined;
    this.state.set('searching');
    this.errorMessage.set('');

    try {
      const result = await firstValueFrom(this.service.lookup(this.searchForm.get('dui')?.value as string, captchaToken));
      this.lookup.set(result);
      this.editForm.reset({
        name: result.name || '',
        email: result.email || '',
        phone: result.phone || '',
        accepted_terms: false,
        marketing_consent: false
      });
      this.state.set('found');
    } catch (error) {
      this.lookup.set(null);
      this.errorMessage.set(this.searchErrorMessage(error));
      this.state.set('error');
    }
  }

  onReset() {
    this.state.set('idle');
    this.lookup.set(null);
    this.searchForm.reset({ dui: '' });
    this.editForm.reset({ name: '', email: '', phone: '', accepted_terms: false, marketing_consent: false });
    this.errorMessage.set('');
    this.successName.set('');
    this.userEmail.set('');
  }

  async onSubmit() {
    const lookup = this.lookup();
    if (!lookup || this.editForm.invalid || this.state() === 'submitting') {
      this.editForm.markAllAsTouched();
      return;
    }

    this.state.set('submitting');
    this.errorMessage.set('');

    const value = this.editForm.value;
    const name = (value.name as string).trim();
    const email = (value.email as string).trim();

    try {
      const response = await firstValueFrom(
        this.service.createMembership({
          lookup_token: lookup.lookup_token,
          name,
          email,
          phone: value.phone,
          accepted_terms: !!value.accepted_terms,
          marketing_consent: !!value.marketing_consent
        })
      );

      if (response.success) {
        this.successName.set(name);
        this.userEmail.set(email);
        this.state.set('success');
      } else {
        this.failSubmit(response.errors?.[0]);
      }
    } catch (error) {
      this.failSubmit(this.firstError(error), error instanceof HttpErrorResponse ? error.status : 0);
    }
  }

  /** Permanece en 'found' (sin perder lo editado), salvo que el token haya expirado. */
  private failSubmit(err?: ApiError, status = 0) {
    const code = err?.code;

    if (code === 'EMAIL_REQUIRED') {
      this.state.set('found');
      this.errorMessage.set('Necesitamos un correo para enviarte el pase. Escríbelo en el campo Correo.');
      return;
    }

    if (code === 'LOOKUP_TOKEN_INVALID') {
      this.onReset();
      this.errorMessage.set('Tu sesión de registro expiró. Vuelve a ingresar tu DUI.');
      this.state.set('error');
      return;
    }

    this.state.set('found');
    if (status === 409 || code === 'ALREADY_MEMBER') {
      this.errorMessage.set(this.withSupport('Ya eres parte de SUMÁS.'));
    } else if (code === 'CONTACT_MISMATCH') {
      this.errorMessage.set('El correo o el teléfono no coincide con el que registraste en la óptica. Revisa los datos.');
    } else if (status === 429) {
      this.errorMessage.set('Hiciste demasiados intentos. Espera un minuto e inténtalo de nuevo.');
    } else {
      this.errorMessage.set(this.withSupport('¡Casi listo! Hubo un problema al preparar tu Pase SUMÁS.'));
    }
  }

  private searchErrorMessage(error: unknown): string {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    const code = this.firstError(error)?.code;

    if (status === 404 || code === 'DUI_NOT_FOUND') return this.withSupport('No encontramos tu DUI en nuestro sistema.');
    if (code === 'TOO_MANY_ATTEMPTS') return this.withSupport('Hiciste varios intentos que no coincidieron. Inténtalo de nuevo en un rato.');
    if (status === 429) return 'Hiciste demasiados intentos. Espera un minuto e inténtalo de nuevo.';
    if (code === 'CAPTCHA_FAILED') return 'No pudimos verificar que eres una persona. Inténtalo de nuevo.';
    return this.withSupport('No pudimos consultar tu DUI en este momento. Intenta de nuevo en unos minutos.');
  }

  private firstError(error: unknown): ApiError | undefined {
    if (error instanceof HttpErrorResponse) {
      return error.error?.errors?.[0] ?? (error.error?.code ? { message: error.error.message, code: error.error.code } : undefined);
    }
    return undefined;
  }

  private withSupport(text: string): string {
    return this.supportPhone ? `${text} Escríbenos al ${this.supportPhone} para ayudarte.` : text;
  }
}
