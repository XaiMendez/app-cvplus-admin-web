/** Respuesta de POST /self-registration/lookup: nunca incluye datos personales completos. */
export interface LookupResult {
  lookup_token: string;
  masked_name: string;
  masked_dui: string;
  email_hint: string;
  phone_hint: string;
}

export interface EnrollPayload {
  lookup_token: string;
  name: string;
  email: string;
  phone: string;
  accepted_terms: boolean;
  marketing_consent: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
}

/** Envoltorio estándar de la API (ApiResponseDto). */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiError[];
}

export type EnrollResponse = ApiResponse<{ message: string; email: string }>;
