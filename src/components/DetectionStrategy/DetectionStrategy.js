import { Select, Space } from 'antd';
import { useState } from 'react';
import MatchString from '../MatchString/MatchString';
const { Option } = Select;

const options = {
  cookie: {
    props: {
      name: 'Cookie Name',
      domain: 'Cookie Domain'
    },
    default: 'name'
  },
  resource: {
    props: {
      pathname: 'Pathname',
      href: 'Href',
      host: 'Host'
    },
    default: 'host'
  },
  identifier: {
    props: {
      value: 'Identifier value',
      system: 'System'
    },
    default: 'value'
  }
};

/**
 * @param {"cookies"|"resources"} type
 * @param {Object} formData
 * @returns {React.ReactNode[]}
 */
function getOptions(type, formData) {
  return Object.keys(options[type].props).map(name => {
    return (
      <Option value={name} key={`${type}_${name}`}>
        {options[type].props[name]}
        {formData[name] ? '*' : ''}
      </Option>
    );
  });
}

export default function DetectionStrategy(props) {
  const { onChange, formData = {} } = props;
  const { type = 'cookie' } = formData;
  let defaultPart = options[type].default;
  const [part, setPart] = useState(Object.keys(formData).filter(k => k !== 'type')[0]);

  const setType = type => {
    onChange({
      ...formData,
      type
    });
  };

  const setMatch = match => {
    onChange({
      ...formData,
      [part]: match,
      type
    });
  };

  return (
    <div className="detection-strategy">
      <Space direction={'horizontal'}>
        <Select value={type} onChange={setType}>
          <Option value="cookie">Cookie</Option>
          <Option value="resource">Resource</Option>
          <Option value="identifier">Identifier</Option>
        </Select>
        <Select defaultValue={defaultPart} value={part} onChange={setPart} key={`select-${type}`}>
          {getOptions(type, formData)}
        </Select>
        <MatchString onChange={setMatch} formData={formData[part]} />
      </Space>
    </div>
  );
}
