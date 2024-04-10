import { useState } from 'react';
import LanguageSelect from '../LanguageSelect/LanguageSelect';
import { Button, Col, Flex, Form, Input, Row } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import cloneDeep from 'clone-deep';
const { TextArea } = Input;

export function cleanLocalizedValue(value) {
  if (Array.isArray(value)) {
    return value.map(cleanLocalizedValue);
  }

  if (typeof value === 'object' && value !== null) {
    if (value.__lang && Object.keys(value.__lang).length === 0) {
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
    const result = {};
    Object.keys(value).forEach(lang => {
      if (value[lang]) {
        result[lang] = value[lang];
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

  const languageHasValue = Object.hasOwn(formData?.__lang || {}, selectedLanguage);

  const buttons = (
    <Button.Group>
      <Button disabled={!languageHasValue} icon={<DeleteOutlined />} danger onClick={deleteLocale} />
    </Button.Group>
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
            />
            {!schema['ui:multiline'] && buttons}
          </Flex>
        </Col>
      </Row>
    </Form.Item>
  );
}
