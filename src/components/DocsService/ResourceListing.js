import { Component } from "react";
import { withAppContext } from "../../App";
import withParams from "../../utils/withParams";
import { Link } from "react-router-dom";
import { CheckOutlined } from "@ant-design/icons";
import {
  Layout,
  Typography,
  Table,
  notification,
  Card,
  Space,
  Button,
  Select,
} from "antd";
const { Title } = Typography;
const { Option } = Select;

class ResourceListing extends Component {
  state = {
    perPage: 25,
    page: 1,
    items: [],
    totalCount: 0,
    lastPage: 1,
    selectedState: undefined,
    language: "en",
    visibleProperties: [],
  };

  componentDidMount() {
    const { service } = this.props;
    const { resourceName } = this.props.params;
    const resource = service.resources[resourceName];

    if(resource.schema['ui:defaultColumns']){
      this.setState({
        visibleProperties: resource.schema['ui:defaultColumns']
      })
    }

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
    const { api, service, authenticated } = this.props;
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
        notification.open({
          message: "Resource is not available",
          description: "This resource cannot be fetched when logged in",
        });
      } else {
        notification.open({
          message: "Resource is not public",
          description:
            "This resource cannot be fetched anonymously, please log in first.",
        });
      }
      return;
    }

    const response = await api.client.get(
      `/${service.name}/${resourceName}?perPage=${perPage}&page=${page}`
    );
    this.setState({
      items: response.data,
      isFetching: false,
      lastPage: Number(response.headers["x-last-page"]),
      totalCount: Number(response.headers["x-total-count"]),
    });
  }

  render() {
    const { service } = this.props;
    const { resourceName } = this.props.params;
    const { language, visibleProperties } = this.state;
    const resource = service.resources[resourceName];

    function renderStringInCell(string) {
      if (!string) {
        return "";
      }
      let str = String(string);
      if (str.indexOf("http") === 0) {
        return (
          <a href={string} target="_blank" rel="noreferrer">
            {str}
          </a>
        );
      }
      return str;
    }

    const allProperties = Object.keys(resource.schema.properties).map(
      (prop) => {
        return { name: prop, ...resource.schema.properties[prop] };
      }
    );
    const properties = visibleProperties.map((prop) => {
      return { name: prop, ...resource.schema.properties[prop] };
    });

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
        render: (value) => {
          const d = new Date(value);
          return (
            <span title={new Date(value).toTimeString()}>
              {d.getFullYear()}/{d.getMonth() + 1}/{d.getDay()}
            </span>
          );
        },
      },
    ];

    properties.forEach((property) => {
      columns.push({
        title: property.label || property.name,
        dataIndex: property.name,
        ellipsis: true,
        render: (value, row) => {
          if (property["ui:relation"]) {
            const { service, resource, labelIndex, embeddedIndex } =
              property["ui:relation"];
            if (!value) {
              return "";
            }
            return (
              <Link to={`/services/${service}/resources/${resource}/${value}`}>
                {row[embeddedIndex]?.[labelIndex] || value}
              </Link>
            );
          }

          let type = property.type;
          if (!property.type && Array.isArray(property.oneOf)) {
            type = typeof value;
          }
          switch (type) {
            case "boolean":
              return value ? <CheckOutlined /> : null;
            case "object":
              if (value?.$lang) {
                return renderStringInCell(value.$lang[language]);
              }
              return JSON.stringify(value);
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
              return renderStringInCell(value);
            case "number":
            default:
              return value;
          }
        },
      });
    });

    function renderPropertyOptions(properties) {
      return properties.map((p) => {
        return (
          <Option value={p.name} key={`option_${p.name}`}>
            {p.title}
          </Option>
        );
      });
    }
    return (
      <Layout.Content style={{ padding: 30 }}>
        <Title>
          {service.name}/{resourceName}
        </Title>
        <Space direction="vertical">
          <Card>
            <Space>
              <Link
                to={`/services/${service.name}/resources/${resourceName}/new`}
              >
                <Button>Create new document</Button>
              </Link>
              <Select
                mode="tags"
                style={{ minWidth: 400 }}
                value={visibleProperties}
                onChange={(selection) => {
                  this.setState({ visibleProperties: selection });
                }}
              >
                {renderPropertyOptions(allProperties)}
              </Select>
            </Space>
          </Card>
          <div className="site-layout-background">
            <Table
              columns={columns}
              dataSource={this.state.items.map((i) => {
                return {
                  id: i.id,
                  createdAt: i.createdAt,
                  ...i.data,
                  key: i.id,
                };
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
        </Space>
      </Layout.Content>
    );
  }
}
export default withAppContext(withParams(ResourceListing));
