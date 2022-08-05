import { Component } from "react";
import { withAppContext } from "../../App";
import { Typography, Layout, Space, Card, Button, Table } from "antd";
import { Link } from "react-router-dom";

const { Title } = Typography;

class NotificationListing extends Component {
  state = {
    totalCount: 0,
    notifications: [],
    isFetching: false,
    columns: [
      {
        title: "ID",
        dataIndex: "_id",
        render: (value) => (
          <Link to={`/services/${this.props.service.name}/${value}`}>
            {value}
          </Link>
        ),
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        render: (value) => {
          const d = new Date(value);
          return (
            <span title={new Date(value).toTimeString()}>
              {d.getFullYear()}/{("0" + (d.getMonth() + 1)).slice(-2)}/
              {("0" + d.getDate()).slice(-2)}
            </span>
          );
        },
      },
    ],
  };

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, () => resolve());
    });
  }

  async fetchData() {
    const { service, api } = this.props;
    await this.setStateAsync({ isFetching: true });

    const response = await api.client.get(`${service.name}/notifications`, {
      timeout: 20000,
    });

    await this.setStateAsync({
      notifications: response.data.notifications,
      totalCount: response.data.notifications.length,
      isFetching: false,
    });
  }

  handleTableChange = async (pagination, filters, sorter) => {
    await this.fetchData(filters, sorter);
  };

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { service } = this.props;
    const { notifications, columns } = this.state;

    return (
      <Layout.Content style={{ padding: 30, width: "100%" }}>
        <Title>Notifications service</Title>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Card>
            <Link to={`/services/${service.name}/new`}>
              <Button>Create new document</Button>
            </Link>
          </Card>
          <div className="site-layout-background">
            <Table
              dataSource={notifications}
              columns={columns}
              rowKey={(item) => item._id}
              onChange={this.handleTableChange}
            />
          </div>
        </Space>
      </Layout.Content>
    );
  }
}

export default withAppContext(NotificationListing);
