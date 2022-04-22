import { Select } from "antd";
import languages from "@cospired/i18n-iso-languages";
languages.registerLocale(require("@cospired/i18n-iso-languages/langs/en.json"));

const { Option, OptGroup } = Select;

function LanguageSelect({
  value = "universal",
  activeLanguages = [],
  onChange,
}) {
  const languageNames = languages.getNames("en");
  const languageCodeToOption = (code) => {
    return (
      <Option value={code} key={code}>
        {languageNames[code]}
      </Option>
    );
  };
  const activeLanguagesOptions = activeLanguages.map(languageCodeToOption);
  const otherLanguagesOptions = Object.keys(languageNames)
    .filter((code) => activeLanguages.indexOf(code) === -1)
    .map(languageCodeToOption);
  return (
    <Select
      showSearch
      filterOption={(input, option) => {
        return String(option.label).toLowerCase().includes(input.toLowerCase());
      }}
      value={value}
      onChange={onChange}
      style={{ width: 150 }}
    >
      <OptGroup label="Active languages">{activeLanguagesOptions}</OptGroup>
      <OptGroup label="All languages">{otherLanguagesOptions}</OptGroup>
    </Select>
  );
}

export default LanguageSelect;
