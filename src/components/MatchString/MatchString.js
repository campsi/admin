import PropTypes from "prop-types";
import { Input, Select, Space } from "antd";
import { useState } from "react";

export default function MatchString(props) {
  const [selectedOption, setSelectedOption] = useState("equals");
  const value = props.formData || {};
  const properties =
    !props.schema?.properties || MatchString.defaultProps.schema.properties;

  return (
    <Space direction="horizontal">
      <Select
        options={Object.keys(properties).map((name) => {
          return { value: name, text: props.schema.properties[name].title };
        })}
        value={selectedOption}
        onChange={setSelectedOption}
      />
      <Input
        type="text"
        value={value[selectedOption]}
        onChange={(e) => {
          props.onChange({
            ...value,
            [selectedOption]: e.target.value,
          });
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
