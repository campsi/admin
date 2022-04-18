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
import { Link } from "react-router-dom";
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
    const { perPage, page, sort } = this.state;
    const response = await this.props.api.client.get(
      `${this.props.service.name}/jobs?perPage=${perPage}&page=${page}&sort=${sort}`
    );
    this.setState({
      jobs: response.data.map((j) => {
        return { ...j, key: j._id };
      }),
      totalCount: response.headers["X-Total-Count"],
    });
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
    const { jobs, columns } = this.state;
    return (
      <Layout.Content style={{ padding: 30 }}>
        <Title>Automator Service</Title>
        <Space direction="vertical">
          <Card title="Jobs">
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
                    name="projectId"
                    label="Project ID"
                    help="Fill this field to use an existing project"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="organizationId" label="Organization ID">
                    <Input />
                  </Form.Item>
                  <Form.Item name="name" label="Project Name">
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
