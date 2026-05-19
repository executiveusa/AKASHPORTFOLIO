/**
 * i18n index — es-MX default, en-US fallback.
 */
import esMX from './es-MX';
import enUS from './en-US';

export type { Locale } from './es-MX';
export { esMX, enUS };

export const locales = { 'es-MX': esMX, 'en-US': enUS } as const;
export type LocaleKey = keyof typeof locales;

export function getLocale(key?: string) {
  if (key && key in locales) return locales[key as LocaleKey];
  return esMX; // Default
}

export default esMX;
