import {
  Button,
  Card,
  Checkbox,
  Empty,
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
import userAgents from "./userAgents";
import EmailingForm from "./Forms/EmailingForm";
import copyText from "../../utils/copyText";
import { formatJobValues } from "./AutomatorService";

const { TabPane } = Tabs;

function AutomatorJobForm({ onFinish, api }) {
  const [formValues, setFormValues] = useState({});
  const [form] = Form.useForm();

  function isActionActive(action) {
    return formValues.actions?.[action]?.active;
  }

  function isNecessaryToUseProjectId() {
    return (
      (isActionActive("showcase") || isActionActive("gtm")) &&
      !isActionActive("provisioning")
    );
  }

  function getActionTab(action) {
    return (
      <>
        <Form.Item
          name={["actions", action, "active"]}
          valuePropName="checked"
          noStyle
        >
          <Checkbox />
        </Form.Item>
        &nbsp;
        {action}
      </>
    );
  }

  function approvalOption(action) {
    return (
      <Form.Item
        name={["actions", action, "approval", "email"]}
        initialValue={false}
        label="Requires your approval"
      >
        <Switch />
      </Form.Item>
    );
  }

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
          <Button
            type="default"
            htmlType="button"
            onClick={() =>
              copyText(
                JSON.stringify(formatJobValues(formValues, api.clientEmail))
              )
            }
          >
            Copy JSON
          </Button>,
        ]}
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
          name={["projectId"]}
          label="Project ID"
          required={isNecessaryToUseProjectId()}
          rules={[{ required: isNecessaryToUseProjectId() }]}
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
            {approvalOption("scanner")}
            <Form.Item
              name={["actions", "scanner", "maxTabs"]}
              label="Max Tabs"
              initialValue={4}
            >
              <InputNumber min={1} max={20} />
            </Form.Item>
            <Form.Item
              name={["actions", "scanner", "maxPages"]}
              label="Max Pages"
              initialValue={10}
            >
              <InputNumber min={0} max={1000} />
            </Form.Item>
            <Form.Item
              name={["actions", "scanner", "testCMP"]}
              initialValue={true}
              valuePropName="checked"
              label="Test the CMP compliance"
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
            {approvalOption("stylesheet")}
            <Empty description="There are no option available for this action" />
          </TabPane>
          <TabPane tab={getActionTab("provisioning")} key="provisioning">
            {approvalOption("provisioning")}
            <Form.Item
              name={["actions", "provisioning", "database"]}
              initialValue={
                process.env.NODE_ENV === "production" ? "prod" : "test"
              }
              label="Database"
              hidden={true}
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
            <Form.Item
              name={["actions", "provisioning", "metadata", "origin"]}
              initialValue={"campsi-admin/automator"}
            />
          </TabPane>
          <TabPane tab={getActionTab("showcase")} key="showcase">
            {approvalOption("showcase")}
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
                  userAgent: userAgents[0].value,
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
                          <Form.Item
                            {...field}
                            label="user agent"
                            name={[field.name, "userAgent"]}
                            key={[field.fieldKey, "userAgent"]}
                            required
                          >
                            <Select placeholder="">
                              {userAgents.map((ua) => (
                                <Select.Option value={ua.value} key={ua.value}>
                                  {ua.name}
                                </Select.Option>
                              ))}
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
            {approvalOption("gtm")}
            <Empty description="There are no option available for this action" />
          </TabPane>
          <TabPane tab={getActionTab("emailing")} key="emailing">
            <EmailingForm api={api} />
          </TabPane>
        </Tabs>
      </Card>
    </Form>
  );
}

export default AutomatorJobForm;
