import { en, TranslationDictionary } from './translations/en';
import { hi } from './translations/hi';

export type SupportedLanguage = 'en' | 'hi';

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  hi,
};

export type TranslationKey =
  | `common.${keyof typeof en.common}`
  | `onboarding.${keyof typeof en.onboarding}`
  | `auth.${keyof typeof en.auth}`
  | `home.${keyof typeof en.home}`
  | `map.${keyof typeof en.map}`
  | `stationDetail.${keyof typeof en.stationDetail}`
  | `preCharge.${keyof typeof en.preCharge}`
  | `liveCharging.${keyof typeof en.liveCharging}`
  | `sessionComplete.${keyof typeof en.sessionComplete}`
  | `profile.${keyof typeof en.profile}`
  | `activity.${keyof typeof en.activity}`
  | `vehicle.${keyof typeof en.vehicle}`
  | `qr.${keyof typeof en.qr}`
  | `modals.${keyof typeof en.modals}`;

export * from './translations/en';
export * from './translations/hi';
