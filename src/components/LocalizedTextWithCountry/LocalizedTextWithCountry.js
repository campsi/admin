import { useState } from 'react';
import LanguageSelect from '../LanguageSelect/LanguageSelect';
import CountrySelect from '../CountrySelect/CountrySelect';
import SubdivisionSelect from '../SubdivisionSelect/SubdivisionSelect';
import { Button, Col, Flex, Form, Input, Row, Space, Tooltip } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, ZhihuOutlined } from '@ant-design/icons';
import cloneDeep from 'clone-deep';
import { getLocaleName } from '../../utils/i18n';
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

  function updateLocaleValue(newValue) {
    const newFormData = {
      ...formData,
      __lang: sanitizeValue({
        ...value,
        [locale]: newValue
      })
    };
    onChange(newFormData);
  }

  function deleteLocale() {
    const newFormData = cloneDeep(formData);
    delete newFormData.__lang[locale];
    onChange(newFormData);
  }

  function toggleRetranslateFlag(locale) {
    const newFormData = cloneDeep(formData);
    if (newFormData.__flags?.retranslate) {
      if (newFormData.__flags.retranslate.includes(locale)) {
        newFormData.__flags.retranslate = newFormData.__flags.retranslate.filter(loc => loc !== locale);
      } else {
        newFormData.__flags.retranslate.push(locale);
      }
    } else {
      newFormData.__flags = {
        retranslate: [locale]
      };
    }
    onChange(newFormData);
  }

  function setRetranslateFlag(locales) {
    const newFormData = cloneDeep(formData);
    if (Array.isArray(locales) && locales.length > 0) {
      newFormData.__flags = {
        retranslate: locales
      };
    } else {
      newFormData.__flags.retranslate = [];
    }
    onChange(newFormData);
  }

  const englishLocaleIsSelected = locale === 'en';
  const nonEnglishActiveLocales = Object.keys(value).filter(loc => loc !== 'en');
  const localeHasValue = Object.hasOwn(formData?.__lang || {}, locale);
  const localeFlaggedToRetranslate = formData?.__flags?.retranslate?.includes(locale);
  const translationChecked = englishLocaleIsSelected ? formData?.__flags?.retranslate?.length > 0 : localeFlaggedToRetranslate;
  const allLocalesAreFlagged = nonEnglishActiveLocales.filter(x => !formData?.__flags?.retranslate?.includes(x)).length === 0;
  const checkColor = englishLocaleIsSelected && !allLocalesAreFlagged ? '#faad14' : '#52c41a';

  const buttons = (
    <Space>
      {' '}
      <Tooltip
        placement="rightBottom"
        title={englishLocaleIsSelected ? 'retranslate all other locales' : 'retranslate this locale'}
        arrow={true}
      >
        <Button
          disabled={englishLocaleIsSelected ? nonEnglishActiveLocales.length === 0 : !localeHasValue}
          onClick={() => {
            if (englishLocaleIsSelected) {
              setRetranslateFlag(translationChecked ? [] : nonEnglishActiveLocales);
            } else {
              toggleRetranslateFlag(locale);
            }
          }}
          icon={translationChecked ? <CheckCircleOutlined style={{ color: checkColor }} /> : <ZhihuOutlined />}
          type="primary"
          ghost
        />
      </Tooltip>
      <Tooltip placement="rightBottom" title={`Delete ${getLocaleName(locale)} text`} arrow={true}>
        <Button disabled={!localeHasValue} onClick={deleteLocale} icon={<DeleteOutlined />} danger />
      </Tooltip>
    </Space>
  );

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
          <Flex>
            <SubdivisionSelect
              onChange={s => setSelectedSubdivision(s)}
              value={selectedSubdivision}
              currentCountry={selectedCountry}
              activeSubdivisions={[...activeSubdivisions]}
            />
            {schema['ui:multiline'] && buttons}
          </Flex>
        </Col>
        <Col span={inputSpan}>
          <Flex>
            <InputComponent
              value={fieldValue}
              type="text"
              rows={6}
              onChange={event => {
                updateLocaleValue(event.target.value);
              }}
            />
            {!schema['ui:multiline'] && buttons}
          </Flex>
        </Col>
      </Row>
    </Form.Item>
  );
}
