import { Component } from "react";
import { withAppContext } from "../../App";
import withParams from "../../utils/withParams";
import { Link } from "react-router-dom";
import { CheckOutlined } from "@ant-design/icons";
import { Layout, Typography, Table } from "antd";
const { Title } = Typography;

class ResourceListing extends Component {
  state = {
    perPage: 25,
    page: 1,
    items: [],
    totalCount: 0,
    lastPage: 1,
    selectedState: undefined,
    language: "en",
  };
  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.params.resourceName !== this.props.params.resourceName ||
      this.state.page !== prevState.page ||
      this.state.perPage !== prevState.perPage
    ) {
      this.fetchData();
    }
  }

  async fetchData() {
    const { api, service, notify, authenticated } = this.props;
    const { resourceName } = this.props.params;
    const resource = service.resources[resourceName];
    const resourceClass = service.classes[resource.class];
    const {
      perPage,
      page,
      selectedState = resourceClass.defaultState,
    } = this.state;

    const allowedMethods =
      resourceClass.permissions[authenticated ? "owner" : "public"]?.[
        selectedState
      ];
    if (!allowedMethods) {
      if (authenticated) {
        notify({
          title: "Resource is not available",
          message: "This resource cannot be fetched when logged in",
        });
      } else {
        notify({
          title: "Resource is not public",
          message:
            "This resource cannot be fetched anonymously, please log in first.",
        });
      }
      return;
    }

    const discardNotification = notify({ title: "Fetching Documents" });
    const response = await api.client.get(
      `/${service.name}/${resourceName}?perPage=${perPage}&page=${page}`
    );
    this.setState(
      {
        items: response.data,
        isFetching: false,
        lastPage: Number(response.headers["x-last-page"]),
        totalCount: Number(response.headers["x-total-count"]),
      },
      discardNotification
    );
  }

  render() {
    const { service } = this.props;
    const { resourceName } = this.props.params;
    const { language } = this.state;
    const resource = service.resources[resourceName];
    const properties = Object.keys(resource.schema.properties || {}).map(
      (prop) => {
        return { name: prop, ...resource.schema.properties[prop] };
      }
    );

    const columns = [
      {
        title: "ID",
        dataIndex: "id",
        render: (value) => (
          <Link
            to={`/services/${service.name}/resources/${resourceName}/${value}`}
          >
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
    ];

    properties.forEach((property) => {
      columns.push({
        title: property.label || property.name,
        dataIndex: property.name,
        render: (value) => {
          let type = property.type;
          if (!property.type && Array.isArray(property.oneOf)) {
            type = typeof value;
          }
          switch (type) {
            case "boolean":
              return value ? <CheckOutlined /> : null;
            case "object":
              if (value?.$lang) {
                return value.$lang[language];
              }
              return "{...}";
            case "array":
              const length = Array.from(value || []).length;
              switch (length) {
                case 0:
                  return "Empty";
                case 1:
                  return "1 item";
                default:
                  return `${length} items`;
              }
            case "string":
            case "number":
            default:
              return value;
          }
        },
      });
    });

    return (
      <Layout.Content style={{ padding: 30 }}>
        <Title>
          {service.name}/{resourceName}
        </Title>
        <div>
          <Link to={`/services/${service.name}/resources/${resourceName}/new`}>
            Create new document
          </Link>
        </div>
        <div className="site-layout-background">
          <Table
            columns={columns}
            dataSource={this.state.items.map((i) => {
              return { id: i.id, createdAt: i.createdAt, ...i.data };
            })}
            scroll={{ x: 1300 }}
            current={this.state.page}
            totalSize={this.state.totalCount}
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
        </div>
      </Layout.Content>
    );
  }
}
export default withAppContext(withParams(ResourceListing));
