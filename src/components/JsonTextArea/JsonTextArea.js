import { Component } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Badge, Alert } from "antd";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });
const jsonEq = (a, b) => {
  return JSON.stringify(a) !== JSON.stringify(b);
};

export default class JsonTextArea extends Component {
  state = {
    isValid: true,
    schemaErrors: [],
    ...this.getStateFromProps(),
  };

  getStateFromProps() {
    return {
      code: JSON.stringify(this.props.formData, null, 2),
      validate: ajv.compile(this.props.schema),
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      jsonEq(prevProps.formData, this.props.formData) ||
      jsonEq(prevProps.schema, this.props.schema)
    ) {
      this.setState(this.getStateFromProps());
    }

    if (prevState.code !== this.state.code) {
      try {
        const parsed = JSON.parse(this.state.code);
        const isValid = this.state.validate(parsed);
        this.setState({
          isValid,
          schemaErrors: Array.isArray(this.state.validate.errors)
            ? this.state.validate.errors
            : [],
        });
        if (isValid) {
          this.props.onChange(parsed);
        }
      } catch (err) {
        this.setState({
          isValid: false,
          schemaErrors: [{ message: "JSON is not valid" }],
        });
      }
    }
  }
  render() {
    const { isValid, schemaErrors, code } = this.state;
    const { name, schema } = this.props;
    return (
      <div>
        <label>
          {name} <Badge dot status={isValid ? "success" : "error"} />
        </label>

        <CodeEditor
          value={code}
          language="json"
          placeholder={schema["ui:placeholder"]}
          onChange={(e) => this.setState({ code: e.target.value })}
          padding={15}
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
}
