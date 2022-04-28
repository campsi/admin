import { Component } from "react";
import {
  Typography,
  Layout,
  Table,
  Tag,
  Card,
  Space,
  Form,
  Input,
  Tabs,
  Checkbox,
  Badge,
  Select,
  Button,
} from "antd";
import { withAppContext } from "../../App";
import PropTypes from "prop-types";
import { Link, Route, Routes } from "react-router-dom";
import AutomatorJob from "./AutomatorJob";
import {
  LoadingOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
const { Title } = Typography;
const { TabPane } = Tabs;

/**
 * Nota: this is an Axeptio only service. It will need to be moved
 * to an Axeptio/Admin repo once we're ready to publish the campsi/admin
 * as a standalone npm package
 */
class AutomatorService extends Component {
  state = {
    activeActions: [],
    jobs: [],
    isFetching: false,
    columns: [
      {
        title: "ID",
        dataIndex: "_id",
        render: (value = "") => (
          <Link to={`/services/${this.props.service.name}/jobs/${value}`}>
            {value.substring(20)}
          </Link>
        ),
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        render: (value) => (
          <span title={new Date(value).toTimeString()}>
            {new Date(value).toDateString()}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (value) => {
          return <Tag>{value}</Tag>;
        },
      },
      {
        title: "Domain",
        dataIndex: ["params", "domain"],
      },
      {
        title: "Actions",
        dataIndex: "actions",
        render: (value) => {
          const actions = [
            "scanner",
            "stylesheet",
            "provisioning",
            "showcase",
            "gtm",
          ];
          return (
            <div>
              {actions.map((action) => {
                if (!value[action]) {
                  return null;
                }
                let color = "default";

                if (value[action].result?.error) {
                  color = "red";
                } else if (value[action].result) {
                  color = "green";
                }
                if (value[action].progress) {
                  color = "blue";
                }
                return (
                  <Tag color={color} key={action}>
                    {action}
                  </Tag>
                );
              })}
            </div>
          );
        },
      },
    ],
    sort: "",
    perPage: 25,
    page: 1,
    totalCount: 0,
    pollingStart: null,
    pollingInterval: 10000,
    pollingDuration: 500000,
  };

  async startJob(job) {
    const { api, service } = this.props;
    await api.client.post(`/${service.name}/jobs`, job);
    await this.fetchData();
  }

  async componentDidMount() {
    if (this.props.authenticated) {
      await this.fetchData();
    }
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.state.page !== prevState.page ||
      this.state.perPage !== prevState.perPage
    ) {
      await this.fetchData();
    }
  }

  async fetchData() {
    const { service, api } = this.props;
    const { perPage, page, sort } = this.state;
    return new Promise((resolve) => {
      this.setState({ isFetching: true }, async () => {
        const response = await api.client.get(
          `${service.name}/jobs?perPage=${perPage}&page=${page}&sort=${sort}`,
          { timeout: 20000 }
        );
        this.setState(
          {
            jobs: response.data.map((j) => {
              return { ...j, key: j._id };
            }),
            totalCount: response.headers["X-Total-Count"],
            isFetching: false,
          },
          () => resolve()
        );
      });
    });
  }

  startPolling() {
    this.setState({ pollingStart: new Date() }, async () => {
      await this.pollData();
    });
  }

  async stopPolling() {
    this.setState({ pollingStart: null });
  }

  async pollData() {
    const { pollingInterval, pollingDuration, pollingStart } = this.state;

    // No need to continue if polling has been cancelled
    if (null === pollingStart) {
      return;
    }

    await this.fetchData();
    await new Promise((resolve) => setTimeout(resolve, pollingInterval));
console.info('diff',new Date() - pollingStart);
    if (new Date() - pollingStart < pollingDuration) {
      await this.pollData();
    } else {
      this.setState({ pollingStart: null });
    }
  }

  getActionTab(action) {
    return (
      <>
        {this.state.activeActions.indexOf(action) !== -1 && (
          <Badge dot status={"success"} />
        )}
        {action}
      </>
    );
  }
  render() {
    const { service } = this.props;
    const { jobs, columns, pollingStart, isFetching } = this.state;

    return (
      <Layout.Content style={{ padding: 30 }}>
        <Title>Automator Service</Title>
        <Space direction="vertical">
          <Routes>
            <Route
              path={`jobs/:id`}
              element={<AutomatorJob service={service} />}
            />
          </Routes>
          <Card
            title="Jobs"
            extra={
              <>
                <Button onClick={() => this.fetchData()}>
                  {isFetching ? <LoadingOutlined /> : <ReloadOutlined />}
                </Button>
                <Button
                  onClick={() => {
                    pollingStart ? this.stopPolling() : this.startPolling();
                  }}
                >
                  {pollingStart ? "Stop polling" : "Start polling"}
                </Button>
              </>
            }
          >
            <Table
              dataSource={jobs}
              columns={columns}
              pagination={{
                pageSize: this.state.perPage,
                current: this.state.page,
                total: this.state.totalCount,
                pageSizeOptions: [25, 50, 100, 200],
                onChange: (page, pageSize) => {
                  this.setState({
                    perPage: pageSize,
                    page,
                  });
                },
              }}
            />
          </Card>
          <Card title="Start a new job">
            <Form
              onFinish={(job) => this.startJob(job)}
              onValuesChange={(valuesChanges, allValues) =>
                this.setState({
                  activeActions: Object.keys(allValues.actions).filter(
                    (key) => allValues.actions[key].active
                  ),
                })
              }
            >
              <Title level={5}>Shared Params</Title>
              <Form.Item label="Domain" name={["params", "domain"]} required>
                <Input />
              </Form.Item>
              <Form.Item label="Priority" name={["params", "priority"]}>
                <Select>
                  <Select.Option value="low">Low</Select.Option>
                  <Select.Option value="normal">Normal</Select.Option>
                  <Select.Option value="high">High</Select.Option>
                </Select>
              </Form.Item>
              <Title level={5}>Actions</Title>
              <Tabs>
                <TabPane tab={this.getActionTab("scanner")} key="scanner">
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
                <TabPane tab={this.getActionTab("stylesheet")} key="stylesheet">
                  <Form.Item
                    name={["actions", "stylesheet", "active"]}
                    valuePropName="checked"
                  >
                    <Checkbox>Active</Checkbox>
                  </Form.Item>
                </TabPane>
                <TabPane
                  tab={this.getActionTab("provisioning")}
                  key="provisioning"
                >
                  <Form.Item
                    name={["actions", "provisioning", "active"]}
                    valuePropName="checked"
                  >
                    <Checkbox>Active</Checkbox>
                  </Form.Item>
                  <Form.Item
                    name={["actions", "provisioning", "database"]}
                    initialValue={"test"}
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
                    required
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Languages"
                    name={["actions", "provisioning", "languages"]}
                    required
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
                </TabPane>
                <TabPane tab={this.getActionTab("showcase")} key="showcase">
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
                                    <Select.Option value="GIF">
                                      Gif
                                    </Select.Option>
                                    <Select.Option value="WEBM">
                                      Webm
                                    </Select.Option>
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
                <TabPane tab={this.getActionTab("gtm")} key="gtm">
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
            {/*
            <Form
              formContext={{

                labelCol:{ span: 8 },
                wrapperCol:{ span: 16 },
                layout: "inline",
                colon: true
              }}
              schema={
                service.paths["/jobs"].post.requestBody.content[
                  "application/json"
                ].schema
              }
            />
            */}
          </Card>
        </Space>
      </Layout.Content>
    );
  }
}

AutomatorService.propTypes = {
  ...withAppContext.propTypes,
  service: PropTypes.shape({
    name: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired,
  }).isRequired,
};

export default withAppContext(AutomatorService);
