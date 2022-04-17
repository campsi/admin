import { useState } from "react";
import LanguageSelect from "../LanguageSelect/LanguageSelect";
import { Form, Input } from "antd";

export default function LocalizedText(props) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const value = props.formData?.$lang || { [selectedLanguage]: "" };
  const fieldValue = value[selectedLanguage];
  return (
    <Form.Item label={props.name}>
      <div style={{ display: "flex" }}>
        <LanguageSelect
          onChange={(l) => setSelectedLanguage(l)}
          value={selectedLanguage}
        />
        <Input
          value={fieldValue}
          type="text"
          onChange={(event) => {
            const formData = {
              $lang: {
                ...value,
                [selectedLanguage]: event.target.value,
              },
            };
            props.onChange(formData);
          }}
        />
      </div>
    </Form.Item>
  );
}
