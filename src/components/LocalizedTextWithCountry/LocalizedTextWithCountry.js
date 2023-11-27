import { useState } from 'react';
import LanguageSelect from '../LanguageSelect/LanguageSelect';
import CountrySelect from '../CountrySelect/CountrySelect';
import { Col, Form, Input, Row } from 'antd';
const { TextArea } = Input;

export default function LocalizedTextWithCountry({ formData, schema, name, onChange }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCountry, setSelectedCountry] = useState('default');
  const locale = `${selectedLanguage}${selectedCountry !== 'default' ? `-${selectedCountry}` : ''}`;
  const value = formData?.__lang || { [locale]: '' };
  const fieldValue = value[locale];
  const InputComponent = schema['ui:multiline'] ? TextArea : Input;
  const [selectLanguageSpan, selectCountrySpan, inputSpan] = schema['ui:multiline'] ? [12,12, 24] : [4,4, 16];

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
          <LanguageSelect onChange={l => {setSelectedLanguage(l); setSelectedCountry('default');}} value={selectedLanguage} activeLanguages={Object.keys(value)} />
        </Col>
        <Col span={selectCountrySpan}>
          <CountrySelect onChange={c => setSelectedCountry(c)} value={selectedCountry} currentLanguage={selectedLanguage} />
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
