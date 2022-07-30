import Form from "@rjsf/antd";
import { Card } from "antd";
import LocalizedText from "../LocalizedText/LocalizedText";
import MatchString from "../MatchString/MatchString";
import JsonTextArea from "../JsonTextArea/JsonTextArea";

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    child: {
      type: "object",
      additionalProperties: false,
      properties: {
        childName: {
          type: "string",
        },
        active: {
          type: "boolean",
        },
        description: {
          type: "string",
        },
      },
    },

    json: {
      type: "object",
      additionalProperties: false,
      properties: {
        childName: {
          type: "string",
        },
        active: {
          type: "boolean",
        },
        description: {
          type: "string",
        },
      },
    },
    match: {
      title: "Match string",
      isMatchString: true,
      type: "object",
      properties: {
        equals: { type: "string", title: "Equals" },
        startsWith: { type: "string", title: "Starts with" },
        endsWith: { type: "string", title: "Ends with" },
        contains: { type: "string", title: "Contains" },
        regex: { type: "string", title: "Match" },
      },
    },
    title: {
      isLocalizedString: true,
      type: "object",
      properties: {
        $lang: {
          title: "Language",
          type: "object",
          patternProperties: {
            "^[a-z]{2}$": { type: "string" },
          },
          additionalProperties: {
            type: "string",
          },
        },
      },
      required: ["$lang"],
    },
  },
};

const uiSchema = {
  child: {
    active: {
      "ui:widget": "checkbox",
    },
    description: {
      "ui:widget": "textarea",
    },
  },
  json: {
    "ui:field": JsonTextArea,
  },
  match: {
    "ui:field": MatchString,
  },
  title: {
    "ui:field": LocalizedText,
  },
};

const formData = {
  json: {
    childName: "Field 242A",
    active: true,
    description: "Child of field 123C",
  },
};

function Playground() {
  return (
    <Card title="Playground" style={{ margin: 30 }}>
      <Form schema={schema} uiSchema={uiSchema} formData={formData} />
    </Card>
  );
}

export default Playground;
