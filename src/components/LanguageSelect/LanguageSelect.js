import { Select } from "antd";
const { Option } = Select;

function LanguageSelect({ value = "universal", onChange }) {
  return (
    <Select value={value} onChange={onChange} style={{width: 150}}>
      <Option value="en">🇺🇸 English</Option>
      <Option value="fr">🇫🇷 French</Option>
    </Select>
  );
}

export default LanguageSelect;
