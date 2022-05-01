import { useState } from "react";
import LanguageSelect from "../LanguageSelect/LanguageSelect";
import { Col, Form, Input, Row } from "antd";
const { TextArea } = Input;

export default function LocalizedText({ formData, schema, name, onChange }) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const value = formData?.$lang || { [selectedLanguage]: "" };
  const fieldValue = value[selectedLanguage];
  const InputComponent = schema["ui:multiline"] ? TextArea : Input;
  const [selectSpan, inputSpan] = schema["ui:multiline"] ? [24, 24] : [8, 16];
  return (
    <Form.Item label={schema.title || name}>
      <Row style={{width: '100%'}}>
        <Col span={selectSpan}>
          <LanguageSelect
            onChange={(l) => setSelectedLanguage(l)}
            value={selectedLanguage}
            activeLanguages={Object.keys(value)}
          />
        </Col>
        <Col span={inputSpan}>
          <InputComponent
            value={fieldValue}
            type="text"
            rows={6}
            onChange={(event) => {
              const formData = {
                $lang: {
                  ...value,
                  [selectedLanguage]: event.target.value,
                },
              };
              onChange(formData);
            }}
          />
        </Col>
      </Row>
    </Form.Item>
  );
}
