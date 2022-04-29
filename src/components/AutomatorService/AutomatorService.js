import { Component } from "react";
import { Typography, Layout, Table, Tag, Card, Space, Button } from "antd";
import { withAppContext } from "../../App";
import PropTypes from "prop-types";
import { Link, Route, Routes } from "react-router-dom";
import AutomatorJob from "./AutomatorJob";
import {
  DeleteOutlined,
  EyeOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import AutomatorJobForm from "./AutomatorJobForm";
import actions from "./AutomatorJobActions";
const { Title } = Typography;

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
          const actionNames = Object.keys(actions);
          return (
            <div>
              {actionNames.map((action) => {
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
      {
        title: "Delete",
        dataIndex: "_id",
        render: (id) => (
          <Space>
            <Button
              icon={<DeleteOutlined />}
              onClick={() => this.deleteJob(id)}
            />
            <Link to={`/services/${this.props.service.name}/jobs/${id}`}>
              <Button icon={<EyeOutlined />} />
            </Link>
          </Space>
        ),
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

  async deleteJob(id) {
    const { api, service } = this.props;
    await api.client.delete(`/${service.name}/jobs/${id}`);
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
    if (new Date() - pollingStart < pollingDuration) {
      await this.pollData();
    } else {
      this.setState({ pollingStart: null });
    }
  }
  render() {
    const { service } = this.props;
    const { jobs, columns, pollingStart, isFetching } = this.state;

    return (
      <Layout.Content style={{ padding: 30, width: "100%" }}>
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
            <AutomatorJobForm onFinish={(job) => this.startJob(job)} />
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
