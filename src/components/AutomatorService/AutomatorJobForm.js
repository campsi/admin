import {
  Badge,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tabs,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";

const { TabPane } = Tabs;

function AutomatorJobForm({ onFinish }) {
  const [formValues, setFormValues] = useState({});
  const [form] = Form.useForm();

  function isActionActive(action) {
    return formValues.actions?.[action]?.active;
  }

  function isNecessaryToUseProjectId() {
    return (
      (
        isActionActive('showcase') ||
        isActionActive('gtm')
      ) &&
      !isActionActive('provisioning')
    );
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
    "params",
    "projectId",
  ]);

  return (
    <Form
      labelAlign="right"
      labelCol={{ span: 6 }}
      labelWrap={true}
      form={form}
      onFinish={onFinish}
      onValuesChange={(valuesChanges, allValues) => {
        setFormValues(allValues);
      }}
    >
      <Card
        title="Create a new automator job"
        actions={[
          <Button type="primary" htmlType="submit">
            Start Job
          </Button>,
        ]}
      >
        <Form.Item
          label="Domain & subdomains"
          name={["params", "domains"]}
          required
          rules={[{ required: true, message: "A website domain is mandatory" }]}
        >
          <Select mode="tags" />
        </Form.Item>
        <Form.Item
            name={["params", "projectId"]}
            label="Project ID"
            required={isNecessaryToUseProjectId()}
            rules={[{ required: isNecessaryToUseProjectId()}]}
            help="Fill this field to use an existing project or leave blank if you want to creat a new project with provisioning"
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
        <Tabs type="card">
          <TabPane tab={getActionTab("scanner")} key="scanner">
            <Form.Item
              name={["actions", "scanner", "active"]}
              valuePropName="checked"
              label="Activate Scanner Action"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name={["actions", "scanner", "maxTabs"]}
              label="Max Tabs"
              initialValue={4}
            >
              <InputNumber min={1} max={10} />
            </Form.Item>
            <Form.Item
              name={["actions", "scanner", "maxPages"]}
              label="Max Pages"
              initialValue={10}
            >
              <InputNumber min={1} max={1000} />
            </Form.Item>
            <Form.Item
              name={["actions", "scanner", "acceptCMP"]}
              initialValue={true}
              valuePropName="checked"
              label="Accept CMP"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name={["actions", "scanner", "followSubDomains"]}
              initialValue={false}
              valuePropName="checked"
              label="Follow subdomains"
            >
              <Switch />
            </Form.Item>
          </TabPane>
          <TabPane tab={getActionTab("stylesheet")} key="stylesheet">
            <Form.Item
              name={["actions", "stylesheet", "active"]}
              valuePropName="checked"
              label="Activate Stylesheet Action"
            >
              <Switch />
            </Form.Item>
          </TabPane>
          <TabPane tab={getActionTab("provisioning")} key="provisioning">
            <Form.Item
              name={["actions", "provisioning", "active"]}
              valuePropName="checked"
              label="Activate Provisioning Action"
            >
              <Switch />
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
              required={isActionActive("provisioning")}
              initialValue={["en"]}
              rules={[{ required: isActionActive("provisioning") }]}
            >
              <Select mode="tags" />
            </Form.Item>
            <Form.Item
              name={["actions", "provisioning", "organizationId"]}
              label="Organization ID"
              help="Check if your ID is in the correct database"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={"Contextual Consent Wall"}
              name={["actions", "provisioning", "withContextualConsentWall"]}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Invitation email"
              name={["actions", "provisioning", "invitationsEmail"]}
            >
              <Select mode="tags" />
            </Form.Item>
          </TabPane>
          <TabPane tab={getActionTab("showcase")} key="showcase">
            <Form.Item
              name={["actions", "showcase", "active"]}
              label="Activate Showcase Action"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
                name={["actions", "showcase", "publishProject"]}
                initialValue={true}
                valuePropName="checked"
                label="Publish the project before launch the showcase"
            >
              <Switch />
            </Form.Item>
            <Form.List
              name={["actions", "showcase", "output"]}
              initialValue={[
                {
                  name: "animated_gif",
                  format: "GIF",
                  viewport: { width: 1600, height: 900 },
                  dimensions: { width: 800, height: 450 },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <Space direction="vertical">
                  <Space direction="horizontal" wrap>
                    {fields.map((field, index) => {
                      return (
                        <Card
                          title={`Output #${index + 1}`}
                          key={field.key}
                          extra={
                            <MinusCircleOutlined
                              className="dynamic-delete-button"
                              onClick={() => remove(field.name)}
                            />
                          }
                        >
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
                              <Select.Option value="GIF">GIF</Select.Option>
                              <Select.Option value="WEBM">WEBM</Select.Option>
                              <Select.Option value="PNG">PNG</Select.Option>
                              <Select.Option value="MPEG">MPEG</Select.Option>
                            </Select>
                          </Form.Item>
                          <Space align="center">
                            <span>Viewport</span>
                            <Form.Item
                              {...field}
                              name={[field.name, "viewport", "width"]}
                              required
                              key={[field.fieldKey, "viewport", "width"]}
                            >
                              <InputNumber placeholder="width" />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, "viewport", "height"]}
                              required
                              key={[field.fieldKey, "viewport", "height"]}
                            >
                              <InputNumber placeholder="height" />
                            </Form.Item>
                          </Space>
                          <Space align="center">
                            <span>Dimensions</span>
                            <Form.Item
                              {...field}
                              name={[field.name, "dimensions", "width"]}
                              required
                              key={[field.fieldKey, "dimensions", "width"]}
                            >
                              <InputNumber placeholder="width" />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, "dimensions", "height"]}
                              required
                              key={[field.fieldKey, "dimensions", "height"]}
                            >
                              <InputNumber placeholder="height" />
                            </Form.Item>
                          </Space>
                        </Card>
                      );
                    })}
                  </Space>

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
              label="Activate GTM Action"
            >
              <Switch />
            </Form.Item>
          </TabPane>
        </Tabs>
      </Card>
    </Form>
  );
}

export default AutomatorJobForm;
