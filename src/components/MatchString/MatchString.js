import { Form, Input, Select } from "antd";
import { useState } from "react";
const Option = { Select };

export default function MatchString(props) {
  console.info(props);
  const [selectedOption, setSelectedOption] = useState("equals");

  return (
    <Form.Item label={props.name}>
      <div style={{ display: "inline-flex" }}>
        <Select
          value={selectedOption}
          onChange={(value) => setSelectedOption(value)}
        >
          {Object.keys(props.schema.properties).map((name) => (
            <Option key={name} value={name}>
              {props.schema.properties[name].title}
            </Option>
          ))}
        </Select>
        <Input
          type="text"
          value={props.formData[selectedOption]}
          onChange={(e) => {
            props.onChange({
              [selectedOption]: e.target.value,
            });
          }}
        />
      </div>
    </Form.Item>
  );
}
