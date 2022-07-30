import { useState, useEffect, useMemo } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Badge, Alert } from "antd";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

export default function JsonTextArea({ formData, schema, name, onChange }) {
  const [code, setCode] = useState(JSON.stringify(formData, null, 2));
  const [isValid, setValid] = useState(true);
  const [schemaErrors, setSchemaErrors] = useState([]);

  const validate = useMemo(() => ajv.compile(schema), [schema]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(code);
      setValid(validate(parsed));
      setSchemaErrors(Array.isArray(validate.errors) ? validate.errors : []);
      onChange(parsed);
    } catch (err) {
      setValid(false);
      setSchemaErrors([{ message: "JSON is not valid" }]);
    }
  }, [code, onChange, validate]);

  return (
    <div>
      <label>
        {name} <Badge dot status={isValid ? "success" : "error"} />
      </label>

      <CodeEditor
        value={code}
        language="json"
        placeholder={schema["ui:placeholder"]}
        onChange={(evn) => setCode(evn.target.value)}
        padding={15}
        style={{
          fontSize: 12,
          backgroundColor: "#f5f5f5",
          fontFamily:
            "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
        }}
      />
      {schemaErrors.length > 0 && (
        <div>
          <label>Errors</label>
          {schemaErrors.map((err) => (
            <Alert
              style={{ fontSize: 12, marginBottom: -1 }}
              key={err}
              type="error"
              message={
                <>
                  {err.dataPath && <code>{err.dataPath}</code>}
                  {err.message}
                  {err.params && <code>{JSON.stringify(err.params)}</code>}
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
