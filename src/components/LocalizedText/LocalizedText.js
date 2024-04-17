import { useState } from 'react';
import LanguageSelect from '../LanguageSelect/LanguageSelect';
import { Button, Col, Flex, Form, Input, Row, Space, Tooltip } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, ZhihuOutlined } from '@ant-design/icons';
import cloneDeep from 'clone-deep';
import { getLanguageName } from '../../utils/i18n';
const { TextArea } = Input;

export function cleanLocalizedValue(value) {
  if (Array.isArray(value)) {
    return value.map(cleanLocalizedValue);
  }

  if (typeof value === 'object' && value !== null) {
    // Remove empty localized values
    if (Object.hasOwn(value, '__lang') && Object.keys(value.__lang).length === 0) {
      return undefined;
    }
    // Remove localized values without language
    if (Object.hasOwn(value, '__flags') && !Object.hasOwn(value, '__lang')) {
      return undefined;
    }
    const result = {};
    Object.keys(value).forEach(key => {
      const cleaned = cleanLocalizedValue(value[key]);
      if (typeof cleaned !== 'undefined') {
        result[key] = cleaned;
      }
    });
    return result;
  }
  return value;
}

export default function LocalizedText({ formData, schema, name, onChange }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const value = formData?.__lang || { [selectedLanguage]: '' };
  const fieldValue = value[selectedLanguage];
  const InputComponent = schema['ui:multiline'] ? TextArea : Input;
  const [selectSpan, inputSpan] = schema['ui:multiline'] ? [24, 24] : [8, 16];

  function sanitizeValue(value) {
    // !! Don't delete empty languages !!
    return Object.keys(value).length > 0 ? value : undefined;
  }

  function updateLocaleValue(newValue) {
    const newFormData = {
      ...formData,
      __lang: sanitizeValue({
        ...value,
        [selectedLanguage]: newValue
      })
    };
    onChange(newFormData);
  }

  function deleteLocale() {
    const newFormData = cloneDeep(formData);
    delete newFormData.__lang[selectedLanguage];
    onChange(newFormData);
  }

  function toggleRetranslateFlag(language) {
    const newFormData = cloneDeep(formData);
    if (newFormData.__flags?.retranslate) {
      if (newFormData.__flags.retranslate.includes(language)) {
        newFormData.__flags.retranslate = newFormData.__flags.retranslate.filter(lang => lang !== language);
      } else {
        newFormData.__flags.retranslate.push(language);
      }
    } else {
      newFormData.__flags = {
        retranslate: [language]
      };
    }
    onChange(newFormData);
  }

  function setRetranslateFlag(languages) {
    const newFormData = cloneDeep(formData);
    if (Array.isArray(languages) && languages.length > 0) {
      newFormData.__flags = {
        retranslate: languages
      };
    } else {
      newFormData.__flags.retranslate = [];
    }
    onChange(newFormData);
  }

  const englishLanguageIsSelected = selectedLanguage === 'en';
  const nonEnglishActiveLanguages = Object.keys(value).filter(lang => lang !== 'en');
  const languageHasValue = Object.hasOwn(formData?.__lang || {}, selectedLanguage);
  const languageFlaggedToRetranslate = formData?.__flags?.retranslate?.includes(selectedLanguage);
  const translationChecked = englishLanguageIsSelected
    ? formData?.__flags?.retranslate?.length > 0
    : languageFlaggedToRetranslate;
  const allLanguagesAreFlagged = nonEnglishActiveLanguages.filter(x => !formData?.__flags?.retranslate?.includes(x)).length === 0;
  const checkColor = englishLanguageIsSelected && !allLanguagesAreFlagged ? '#faad14' : '#52c41a';

  const buttons = (
    <Space>
      {' '}
      <Tooltip
        placement="rightBottom"
        title={englishLanguageIsSelected ? 'retranslate all other languages' : 'retranslate this language'}
        arrow={true}
      >
        <Button
          disabled={englishLanguageIsSelected ? nonEnglishActiveLanguages.length === 0 : !languageHasValue}
          onClick={() => {
            if (englishLanguageIsSelected) {
              setRetranslateFlag(translationChecked ? [] : nonEnglishActiveLanguages);
            } else {
              toggleRetranslateFlag(selectedLanguage);
            }
          }}
          icon={translationChecked ? <CheckCircleOutlined style={{ color: checkColor }} /> : <ZhihuOutlined />}
          type="primary"
          ghost
        />
      </Tooltip>
      <Tooltip placement="rightBottom" title={`Delete ${getLanguageName(selectedLanguage)} text`} arrow={true}>
        <Button disabled={!languageHasValue} onClick={deleteLocale} icon={<DeleteOutlined />} danger />
      </Tooltip>
    </Space>
  );

  return (
    <Form.Item label={schema.title || name}>
      <Row style={{ width: '100%' }}>
        <Col span={selectSpan}>
          <Flex>
            <LanguageSelect
              onChange={l => setSelectedLanguage(l)}
              value={selectedLanguage}
              activeLanguages={Object.keys(value)}
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
              placeholder={languageHasValue ? '(empty string)' : '(no translation yet)'}
            />
            {!schema['ui:multiline'] && buttons}
          </Flex>
        </Col>
      </Row>
    </Form.Item>
  );
}
