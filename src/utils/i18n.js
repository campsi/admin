import languages from '@cospired/i18n-iso-languages';
import countries from 'i18n-iso-countries';
import * as iso3166 from 'iso-3166-2';
languages.registerLocale(require('@cospired/i18n-iso-languages/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export function getLanguageName(language) {
  return languages.getName(language, 'en');
}

export function getCountryName(country) {
  return countries.getName(country, 'en');
}

export function getSubdivisionName(country, subdivision) {
  return subdivision ? iso3166.subdivision(country, subdivision)?.name : undefined;
}

export function getLocaleName(locale) {
  const [languageCode, countryCode, subdivisionCode] = locale.split('-');
  const languageName = getLanguageName(languageCode);
  const countryName = getCountryName(countryCode);
  const subdivisionName = getSubdivisionName(countryCode, subdivisionCode);
  return `${languageName}${countryCode ? ` - ${countryName}` : ''}${subdivisionCode ? `(${subdivisionName})` : ''}`;
}
