import { useState } from 'react';
import LanguageSelect from '../LanguageSelect/LanguageSelect';
import CountrySelect from '../CountrySelect/CountrySelect';
import SubdivisionSelect from '../SubdivisionSelect/SubdivisionSelect';
import { Col, Form, Input, Row } from 'antd';
const { TextArea } = Input;

export default function LocalizedTextWithCountry({ formData, schema, name, onChange }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCountry, setSelectedCountry] = useState('default');
  const [selectedSubdivision, setSelectedSubdivision] = useState('default');
  let locale;
  switch (true) {
    case selectedCountry !== 'default' && selectedSubdivision === 'default':
      locale = `${selectedLanguage}-${selectedCountry}`;
      break;
    case selectedCountry !== 'default' && selectedSubdivision !== 'default':
      locale = `${selectedLanguage}-${selectedCountry}-${selectedSubdivision}`;
      break;
    default:
      locale = selectedLanguage;
      break;
  }
  const value = formData?.__lang || { [locale]: '' };
  const fieldValue = value[locale];
  const InputComponent = schema['ui:multiline'] ? TextArea : Input;
  const [selectLanguageSpan, selectCountrySpan, selectSubdivisionSpan, inputSpan] = schema['ui:multiline']
    ? [8, 8, 8, 24]
    : [3, 3, 3, 15];
  const activeLanguages = new Set(Object.keys(value).map(l => l.split('-')[0]));
  const activeCountries = new Set(
    Object.keys(value)
      .filter(l => l.startsWith(selectedLanguage))
      .map(l => l.split('-')[1])
      .filter(Boolean)
  );
  const activeSubdivisions = new Set(
    Object.keys(value)
      .filter(l => l.startsWith(`${selectedLanguage}-${selectedCountry}`))
      .map(l => l.split('-')[2])
      .filter(Boolean)
  );

  function sanitizeValue(value) {
    const result = {};
    Object.keys(value).forEach(locale => {
      if (value[locale]) {
        result[locale] = value[locale];
      }
    });
    if (Object.keys(result).length > 0) {
      return result;
    }
    return undefined;
  }

  return (
    <Form.Item label={schema.title || name}>
      <Row style={{ width: '100%' }}>
        <Col span={selectLanguageSpan}>
          <LanguageSelect
            onChange={l => {
              setSelectedLanguage(l);
              setSelectedCountry('default');
              setSelectedSubdivision('default');
            }}
            value={selectedLanguage}
            activeLanguages={[...activeLanguages]}
          />
        </Col>
        <Col span={selectCountrySpan}>
          <CountrySelect
            onChange={c => {
              setSelectedCountry(c);
              setSelectedSubdivision('default');
            }}
            value={selectedCountry}
            currentLanguage={selectedLanguage}
            activeCountries={[...activeCountries]}
          />
        </Col>
        <Col span={selectSubdivisionSpan}>
          <SubdivisionSelect
            onChange={s => setSelectedSubdivision(s)}
            value={selectedSubdivision}
            currentCountry={selectedCountry}
            activeSubdivisions={[...activeSubdivisions]}
          />
        </Col>
        <Col span={inputSpan}>
          <InputComponent
            value={fieldValue}
            type="text"
            rows={6}
            onChange={event => {
              const newValue = {
                __lang: sanitizeValue({
                  ...value,
                  [locale]: event.target.value
                })
              };
              onChange(newValue);
            }}
          />
        </Col>
      </Row>
    </Form.Item>
  );
}
