import { Select } from 'antd';
import countries from 'i18n-iso-countries';
import locale from 'locale-codes';

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

const { Option, OptGroup } = Select;

function CountrySelect({ value = 'default', currentLanguage = 'universal', style = {}, onChange }) {
  const countryNames = countries.getNames('en');
  const countryCodeToOption = code => {
    return (
      <Option value={code} key={code}>
        {countryNames[code]}
      </Option>
    );
  };

  const languageCountries = locale.all
    .map(l => l.tag) // get the tag (aka ISO code)
    .filter(t => t.includes(`${currentLanguage}-`)) // filter out non-currentLanguage tags
    .filter(t => /^[a-z]{2}-[A-Z]{2}$/.test(t)) // filter out non-locale tags (i.e. 'en-029')
    .map(t => t.split('-')[1]); // get the country code

  const countryOptions = languageCountries.map(countryCodeToOption);
  return (
    <Select
      showSearch
      filterOption={(input, option) => {
        return String(option.children).toLowerCase().includes(input.toLowerCase());
      }}
      value={value}
      onChange={onChange}
      style={style}
    >
      <>
        <Option value="default" key="default">
          Default
        </Option>
        {countryOptions}
      </>
    </Select>
  );
}

export default CountrySelect;
