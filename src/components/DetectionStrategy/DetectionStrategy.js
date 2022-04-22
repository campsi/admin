import { Select, Space } from "antd";
import { useState } from "react";
import MatchString from "../MatchString/MatchString";
const { Option } = Select;

/**
 * @param {"cookies"|"resources"} type
 * @returns {React.ReactNode[]}
 */
function getOptions(type) {
  const options = {
    cookie: {
      name: "Cookie Name",
      domain: "Cookie Domain",
    },
    resource: {
      pathname: "Pathname",
      href: "Href",
      host: "Host",
    },
  };
  return Object.keys(options[type]).map((name) => {
    return (
      <Option name={name} key={`${type}_${name}`}>
        {options[type][name]}
      </Option>
    );
  });
}

export default function DetectionStrategy(props) {
  const { onChange, formData = {} } = props;
  const { type = "cookie" } = formData;
  let defaultPart = type === "cookie" ? "domain" : "host";
  const [part, setPart] = useState(
    Object.keys(formData).filter((k) => k !== "type")[0] || defaultPart
  );

  console.info(formData);
  const setType = (type) => {
    onChange({
      ...formData,
      type,
    });
  };

  const setMatch = (match) => {
    onChange({
      ...formData,
      [part]: match,
    });
  };

  return (
    <div className="detection-strategy">
      <Space direction={"horizontal"}>
        <Select value={type} onChange={setType}>
          <Option value="cookie">Cookie</Option>
          <Option value="resource">Resource</Option>
        </Select>
        <Select value={part} onChange={setPart}>
          {getOptions(type)}
        </Select>
        <MatchString onChange={setMatch} formData={formData[part]} />
      </Space>
    </div>
  );
}
