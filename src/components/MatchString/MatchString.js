import PropTypes from "prop-types";
import { Input, Select, Space } from "antd";
import { useState } from "react";

function cleanMatchString(value) {
  const cleaned =  Object.keys(value).reduce((cleanedValue, key) => {
    if (value[key]) {
      return { ...cleanedValue, [key]: value[key] };
    }
    return cleanedValue;
  }, {});
  if(Object.keys(cleaned).length > 0){
    return cleaned;
  }
  return undefined;
}

export default function MatchString(props) {
  const value = props.formData || {};
  const [selectedOption, setSelectedOption] = useState(
    Object.keys(value)[0] || "equals"
  );

  const properties =
    !props.schema?.properties || MatchString.defaultProps.schema.properties;

  /**
   * If a value exists for the given option, we append a "*" character
   * @param name
   * @returns {string}
   */
  function getOptionLabel(name) {
    return `${properties[name].title}${value[name] ? " *" : ""}`;
  }

  return (
    <Space direction="horizontal">
      <Select
        options={Object.keys(properties).map((name) => {
          return { value: name, label: getOptionLabel(name) };
        })}
        value={selectedOption}
        onChange={setSelectedOption}
      />
      <Input
        type="text"
        value={value[selectedOption]}
        onChange={(e) => {
          props.onChange(
            cleanMatchString({
              ...value,
              [selectedOption]: e.target.value,
            })
          );
        }}
      />
    </Space>
  );
}

MatchString.propTypes = {
  onChange: PropTypes.func.isRequired,
  schema: PropTypes.shape({
    properties: PropTypes.objectOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
      })
    ),
  }),
  formData: PropTypes.object,
};

MatchString.defaultProps = {
  schema: {
    title: "Match string",
    isMatchString: true,
    type: "object",
    properties: {
      equals: {
        type: "string",
        title: "Equals",
      },
      startsWith: {
        type: "string",
        title: "Starts with",
      },
      endsWith: {
        type: "string",
        title: "Ends with",
      },
      contains: {
        type: "string",
        title: "Contains",
      },
      regex: {
        type: "string",
        title: "Match",
      },
    },
    additionalProperties: false,
    anyOf: [
      {
        required: ["equals"],
      },
      {
        required: ["startsWith"],
      },
      {
        required: ["endsWith"],
      },
      {
        required: ["contains"],
      },
      {
        required: ["regex"],
      },
    ],
  },
};
