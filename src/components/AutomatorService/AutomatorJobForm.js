import {
  Badge,
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Space,
  Tabs,
  Typography,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";

const { TabPane } = Tabs;
const { Title } = Typography;

function AutomatorJobForm({ onFinish }) {
  const [formValues, setFormValues] = useState({});
  const [form] = Form.useForm();

  function isActionActive(action) {
    return formValues.actions?.[action]?.active;
  }
  function getActionTab(action) {
    return (
      <>
        {isActionActive(action) && <Badge dot status={"success"} />}
        {action}
      </>
    );
  }

  const hasProjectId = form.getFieldValue([
    "actions",
    "provisioning",
    "projectId",
  ]);

  return (
    <Form
      form={form}
      onFinish={onFinish}
      onValuesChange={(valuesChanges, allValues) => {
        setFormValues(allValues);
      }}
    >
      <Form.Item
        label="Domain"
        name={["params", "domain"]}
        required
        rules={[{ required: true, message: "A website domain is mandatory" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Priority"
        name={["params", "priority"]}
        initialValue="normal"
      >
        <Select>
          <Select.Option value="low">Low</Select.Option>
          <Select.Option value="normal">Normal</Select.Option>
          <Select.Option value="high">High</Select.Option>
        </Select>
      </Form.Item>
      <Title level={5}>Actions</Title>
      <Tabs>
        <TabPane tab={getActionTab("scanner")} key="scanner">
          <Form.Item
            name={["actions", "scanner", "active"]}
            valuePropName="checked"
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>
          <Form.Item
            name={["actions", "scanner", "maxTabs"]}
            label="Max Tabs"
            initialValue={4}
          >
            <Input type="number" min={1} max={10} />
          </Form.Item>
          <Form.Item
            name={["actions", "scanner", "maxPages"]}
            label="Max Pages"
            initialValue={10}
          >
            <Input type="number" min={1} max={1000} />
          </Form.Item>
          <Form.Item
            name={["actions", "scanner", "acceptCMP"]}
            initialValue={true}
            valuePropName="checked"
          >
            <Checkbox>Accept CMP</Checkbox>
          </Form.Item>
          <Form.Item
            name={["actions", "scanner", "followSubDomains"]}
            initialValue={false}
            valuePropName="checked"
          >
            <Checkbox>Follow subdomains</Checkbox>
          </Form.Item>
        </TabPane>
        <TabPane tab={getActionTab("stylesheet")} key="stylesheet">
          <Form.Item
            name={["actions", "stylesheet", "active"]}
            valuePropName="checked"
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>
        </TabPane>
        <TabPane tab={getActionTab("provisioning")} key="provisioning">
          <Form.Item
            name={["actions", "provisioning", "active"]}
            valuePropName="checked"
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>
          <Form.Item
            name={["actions", "provisioning", "database"]}
            initialValue="test"
            label="Database"
            help="Do not spam the production for testing purposes."
          >
            <Select>
              <Select.Option value="prod">Production</Select.Option>
              <Select.Option value="test">Test</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name={["actions", "provisioning", "name"]}
            label="Project Name"
            required={!hasProjectId && isActionActive("provisioning")}
            rules={[
              {
                required: !hasProjectId && isActionActive("provisioning"),
                message: "A project name is required only if you create one",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Languages"
            name={["actions", "provisioning", "languages"]}
            required={isActionActive('provisioning')}

          >
            <Select initialValue={["en", "fr"]} mode="tags" />
          </Form.Item>
          <Form.Item
            name={["actions", "provisioning", "projectId"]}
            label="Project ID"
            help="Fill this field to use an existing project"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["actions", "provisioning", "organizationId"]}
            label="Organization ID"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["actions", "provisioning", "withContextualConsentWall"]}
            valuePropName="checked"
          >
            <Checkbox>Create a Contextual Consent Wall</Checkbox>
          </Form.Item>
        </TabPane>
        <TabPane tab={getActionTab("showcase")} key="showcase">
          <Form.Item
            name={["actions", "showcase", "active"]}
            valuePropName="checked"
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>
          <Form.List
            name={["actions", "showcase", "output"]}
            initialValue={[
              {
                name: "animated_gif",
                format: "GIF",
                viewport: { width: 1600, height: 900 },

              },
            ]}
          >
            {(fields, { add, remove }) => (
              <Space direction="vertical">
                <div>
                  {fields.map((field) => {
                    return (
                      <Space key={field.key} direction="vertical">
                        {fields.length > 1 ? (
                          <MinusCircleOutlined
                            className="dynamic-delete-button"
                            onClick={() => remove(field.name)}
                          />
                        ) : null}
                        <Form.Item
                          {...field}
                          name={[field.name, "name"]}
                          key={[field.fieldKey, "name"]}
                          label="name"
                          required
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          label="format"
                          name={[field.name, "format"]}
                          key={[field.fieldKey, "format"]}
                          required
                        >
                          <Select placeholder="Media Type *">
                            <Select.Option value="GIF">Gif</Select.Option>
                            <Select.Option value="WEBM">Webm</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, "viewport", "height"]}
                          required
                          key={[field.fieldKey, "viewport", "height"]}
                          label="Height"
                        >
                          <Input type="number" placeholder="height" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, "viewport", "width"]}
                          required
                          key={[field.fieldKey, "viewport", "width"]}
                          label="Width"
                        >
                          <Input type="number" placeholder="width" />
                        </Form.Item>
                      </Space>
                    );
                  })}
                </div>

                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  Add output
                </Button>
              </Space>
            )}
          </Form.List>
        </TabPane>
        <TabPane tab={getActionTab("gtm")} key="gtm">
          <Form.Item
            name={["actions", "gtm", "active"]}
            valuePropName="checked"
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>
        </TabPane>
      </Tabs>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Start Job
        </Button>
      </Form.Item>
    </Form>
  );
}

export default AutomatorJobForm;
