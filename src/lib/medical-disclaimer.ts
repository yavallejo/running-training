// =============================================================================
// Medical Disclaimer
// =============================================================================
// Single source of truth for the medical/legal disclaimer shown throughout
// the app, and helpers to manage user consent to it.
// =============================================================================

export const MEDICAL_DISCLAIMER_VERSION = '2026-07-20'

export const MEDICAL_DISCLAIMER_TEXT = {
  short:
    'Los planes generados por RunPlan Pro son orientativos y se producen algorítmicamente. No sustituyen la evaluación de un médico deportólogo. Si tenés más de 60 años, lesiones, enfermedades crónicas o no realizás actividad física hace más de 6 meses, consultá con un profesional de la salud antes de comenzar.',

  full: `RunPlan Pro genera planes de entrenamiento de forma algorítmica. Al utilizarlos:

• No sustituyen la supervisión de un médico deportólogo.
• No constituyen diagnóstico, prescripción ni tratamiento médico.
• La actividad física conlleva riesgos (musculares, articulares, cardiovasculares).
• Usted asume toda responsabilidad por su seguridad durante el entrenamiento.
• Si tiene más de 60 años, lesiones, enfermedades crónicas, está embarazada o no realizó actividad física en los últimos 6 meses, debe consultar a un profesional de la salud antes de comenzar.
• El plan puede modificarse para reducir intensidad si se reportan lesiones, pero no reemplaza las indicaciones de su médico.

Al continuar, usted confirma que ha leído este aviso y acepta los Términos y Condiciones.`
}

const STORAGE_KEY = 'runplan_medical_consent'

export interface StoredConsent {
  v: 1
  ts: string
  version: string
}

export function getStoredConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredConsent
    if (parsed.v !== 1) return null
    if (parsed.version !== MEDICAL_DISCLAIMER_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function setStoredConsent(): StoredConsent {
  const consent: StoredConsent = {
    v: 1,
    ts: new Date().toISOString(),
    version: MEDICAL_DISCLAIMER_VERSION
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
  }
  return consent
}

export function clearStoredConsent(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
