import { Select } from 'antd';
import * as iso3166 from 'iso-3166-2';

const { Option, OptGroup } = Select;

function SubdivisionSelect({ value = 'default', activeSubdivisions = [], currentCountry = 'default', style = {}, onChange }) {
  const subdivisions = currentCountry !== 'default' ? iso3166.country(currentCountry).sub : {};
  const subdivisionCodeToOption = code => {
    return (
      <Option value={code} key={code}>
        {subdivisions[`${currentCountry}-${code}`].name}
      </Option>
    );
  };

  const activeSubdivisionsOptions = activeSubdivisions.map(subdivisionCodeToOption);
  const otherSubdivisionsOptions = Object.keys(subdivisions)
    .map(code => code.split('-')[1])
    .filter(code => activeSubdivisions.indexOf(code) === -1)
    .map(subdivisionCodeToOption);

  return (
    <Select
      showSearch
      filterOption={(input, option) => {
        return String(option.children).toLowerCase().includes(input.toLowerCase());
      }}
      value={value}
      onChange={onChange}
      style={style}
    >
      <OptGroup label="Active subdivisions">
        <Option value="default" key="default">
          Default
        </Option>
        {activeSubdivisionsOptions}
      </OptGroup>
      <OptGroup label="All subdivisions">{otherSubdivisionsOptions}</OptGroup>
    </Select>
  );
}

export default SubdivisionSelect;
