import { useState } from "react";
import LanguageSelect from "../LanguageSelect/LanguageSelect";
import {Form, Input, Space} from "antd";
const {TextArea} = Input;


export default function LocalizedText({ formData, schema, name, onChange }) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const value = formData?.$lang || { [selectedLanguage]: "" };
  const fieldValue = value[selectedLanguage];
  const InputComponent = schema['ui:multiline'] ? TextArea : Input;

  return (
    <Form.Item label={schema.title || name}>
      <Space direction={schema['ui:multiline'] ? "vertical": "horizontal"} style={{width: '100%'}}>
        <LanguageSelect
          onChange={(l) => setSelectedLanguage(l)}
          value={selectedLanguage}
          activeLanguages={Object.keys(value)}
        />
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
      </Space>
    </Form.Item>
  );
}
