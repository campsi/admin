import { Select } from 'antd';
import languages from '@cospired/i18n-iso-languages';
import { useEffect, useState } from 'react';
import { getCountryName, getSubdivisionName } from '../../utils/i18n';
languages.registerLocale(require('@cospired/i18n-iso-languages/langs/en.json'));

const { Option, OptGroup } = Select;

function LocalizedSelect({ value, api = [], style = {}, onChange, ressource }) {
  const [availableLocales, setAvailableLocales] = useState({});
  const locale = { locale: 'en' };

  useEffect(() => {
    (async () => {
      setAvailableLocales(await api.getAvailableLocales(ressource));
    })();
  }, [api, ressource]);

  // Sort languages by label
  const sortedLanguages = Object.entries(languages.getNames(locale?.locale?.toLowerCase() || 'en')).sort(
    (languagePairA, languagePairB) => {
      return languagePairA[1].localeCompare(languagePairB[1]);
    }
  );

  // Prepare options for each region
  const supportedLocales = Object.entries(availableLocales)
    // Build labels for each region
    .map(([regionCode, languageCodes]) => {
      const [countryCode, subdivisionCode] = regionCode.split('-');
      const countryName = getCountryName(countryCode, locale.locale.toLowerCase());
      const subdivisionName = getSubdivisionName(countryCode, subdivisionCode, locale.locale.toLowerCase());
      const label = `${countryName}${subdivisionCode ? ` - (${subdivisionName})` : ''}`;
      return [regionCode, label, languageCodes];
    })
    // Sort regions by label
    .sort((regionPairA, regionPairB) => {
      return regionPairA[1].localeCompare(regionPairB[1]);
    })
    // Build options for each region
    .map(([regionCode, label, languageCodes]) => {
      return {
        label,
        options: sortedLanguages
          // Filter out languages not in the region
          .filter(languagePair => {
            return languageCodes.includes(languagePair[0]);
          })
          // Build options for each language
          .map(languagePair => ({
            value: `${languagePair[0]}-${regionCode}`,
            label: languagePair[1]
          }))
      };
    });
  return (
    <Select
      mode="multiple"
      showSearch
      filterOption={(input, option) => {
        return String(option.children).toLowerCase().includes(input.toLowerCase());
      }}
      value={value}
      onChange={onChange}
      style={style}
    >
      {supportedLocales.map(({ label, options }) => (
        <OptGroup label={label} key={label}>
          {options.map(({ value, label }) => (
            <Option value={value} key={value}>
              {label}
            </Option>
          ))}
        </OptGroup>
      ))}
    </Select>
  );
}

export default LocalizedSelect;
