import languages from '@cospired/i18n-iso-languages';
import countries from 'i18n-iso-countries';
import * as iso3166 from 'iso-3166-2';
languages.registerLocale(require('@cospired/i18n-iso-languages/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export function getLanguageName(language) {
  return languages.getName(language, 'en');
}

export function getCountryName(country) {
  if (country === 'EU') return 'European Union'; // Special case for EU
  return countries.getName(country, 'en');
}

export function getSubdivisionName(country, subdivision) {
  return subdivision ? iso3166.subdivision(country, subdivision)?.name : undefined;
}

export function getLocaleNameByLocaleCode(localeCode, displayedLocale, defaultName) {
  const [languageCode, countryCode, subdivisionCode] = localeCode?.split('-');
  return this.getLocaleName(languageCode, countryCode, subdivisionCode, displayedLocale, defaultName);
}

export function getLocaleName(locale) {
  const [languageCode, countryCode, subdivisionCode] = locale.split('-');
  const languageName = getLanguageName(languageCode);
  const countryName = getCountryName(countryCode);
  const subdivisionName = getSubdivisionName(countryCode, subdivisionCode);
  return `${languageName}${countryCode ? ` - ${countryName}` : ''}${subdivisionCode ? `(${subdivisionName})` : ''}`;
}

export const supportedLanguages = [
  'en',
  'fr',
  'it',
  'ar',
  'be',
  'bg',
  'bn',
  'bo',
  'ca',
  'cs',
  'da',
  'de',
  'el',
  'es',
  'et',
  'fi',
  'hi',
  'hr',
  'hu',
  'hy',
  'ga',
  'is',
  'ja',
  'ko',
  'lt',
  'lv',
  'mt',
  'nl',
  'no',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sq',
  'sr',
  'sv',
  'th',
  'tr',
  'uk',
  'ur',
  'vi',
  'zh'
];
