import { Component } from "react";
import { withAppContext } from "../../App";
import withParams from "../../utils/withParams";
import { Link } from "react-router-dom";
import { CheckOutlined, FileOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Layout,
  Typography,
  Table,
  notification,
  Card,
  Space,
  Button,
  Select,
  Input,
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
    filters: {},
  };

  async componentDidMount() {
    await this.updateVisibleProperties();
    await this.fetchData();
  }

  async quickUpdate(id, propertyName, value) {
    const { api, service, params } = this.props;
    const { resourceName } = params;

    await api.client.patch(`${service.name}/${resourceName}/${id}`, {
      [propertyName]: value,
    });

    await this.fetchData();
  }

  generateFilterDropdown({ name, title, ...property }) {
    return ({ setSelectedKeys, selectedKeys, confirm }) => {
      const current = selectedKeys[0] || {
        operator: "*",
        value: "",
        isLocalizedString: property["ui:field"] === "LocalizedString",
      };
      return (
        <Space style={{ padding: 8 }} direction="horizontal">
          <Select
            value={current.operator}
            onChange={(value) => {
              setSelectedKeys([{ ...current, operator: value }]);
            }}
          >
            <Option value="">Exact match</Option>
            <Option value="*">Contains</Option>
            <Option value="^">Starts With</Option>
            <Option value="$">Ends With</Option>
          </Select>
          <Input
            placeholder={`Search ${title || name}`}
            value={current.value}
            onChange={(e) =>
              setSelectedKeys(
                e.target.value ? [{ ...current, value: e.target.value }] : []
              )
            }
            onPressEnter={() => confirm({ closeDropdown: true })}
          />
          <Button
            type="primary"
            onClick={() => confirm({ closeDropdown: true })}
            icon={<SearchOutlined />}
            size="small"
          >
            Search
          </Button>
        </Space>
      );
    };
  }
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.params.resourceName !== this.props.params.resourceName) {
      await this.updateVisibleProperties();
      await this.fetchData();
    }
  }

  async fetchData(filters = {}, sorter = {}) {
    /* Destructuring the props object. */
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

    const params = new URLSearchParams({
      perPage: perPage,
      page: page,
      //with: "creator", currently not working with sort
    });

    Object.keys(filters)
      .filter((key) => {
        return filters[key]?.length > 0;
      })
      .forEach((key) => {
        const propertyPath = filters[key][0].isLocalizedString
          ? `${key}.$lang.en`
          : key;
        params.append(
          `${propertyPath}${filters[key][0].operator}`,
          filters[key][0].value
        );
      });

    if (sorter.field) {
      const field = Array.isArray(sorter.field)
        ? sorter.field.join(".")
        : sorter.field;
      params.append("sort", `${sorter.order === "ascend" ? "" : "-"}${field}`);
    }

    const response = await api.client.get(
      `/${service.name}/${resourceName}?${params.toString()}`
    );
    this.setState({
      items: response.data,
      isFetching: false,
      lastPage: Number(response.headers["x-last-page"]),
      totalCount: Number(response.headers["x-total-count"]),
    });
  }

  handleTableChange = async (pagination, filters, sorter) => {
    await this.fetchData(filters, sorter);
  };

  async updateVisibleProperties() {
    return new Promise((resolve) => {
      const { service } = this.props;
      const { resourceName } = this.props.params;
      const resource = service.resources[resourceName];
      this.setState(
        {
          visibleProperties: resource.schema["ui:defaultColumns"] ?? [],
        },
        () => resolve()
      );
    });
  }

  renderPropertyOptions(properties) {
    return properties.map((p) => {
      return (
        <Option value={p.name} key={`option_${p.name}`}>
          {p.title}
        </Option>
      );
    });
  }

  getColumnRender(property, language) {
    return (value, row) => {
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
            return this.renderStringInCell(value.$lang[language]);
          }
          if (value?.url && value?.detectedMimeType) {
            if (value.detectedMimeType.includes("image")) {
              return (
                <img
                  src={value?.url}
                  style={{ maxHeight: 30, maxWidth: 50 }}
                  alt={value?.originalName}
                />
              );
            }
            return <FileOutlined title={value.originalName} />;
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
          return this.renderStringInCell(property, value, row);
        case "number":
        default:
          return value;
      }
    };
  }

  renderStringInCell(property, string, row) {
    let str = String(string || "");
    if (str.indexOf("http") === 0 && !property.enum) {
      return (
        <a href={string} target="_blank" rel="noreferrer">
          {str}
        </a>
      );
    }
    if (property.enum?.length > 0) {
      return (
        <Select
          showSearch
          placeholder={property.name}
          value={string}
          onChange={async (value) => {
            await this.quickUpdate(row.id, property.name, value);
          }}
        >
          {property.enum.map((option) => {
            return (
              <Option key={option} value={option} selected={option === string}>
                {option}
              </Option>
            );
          })}
        </Select>
      );
    }
    return str;
  }

  render() {
    const { service } = this.props;
    const { resourceName } = this.props.params;
    const { language, visibleProperties } = this.state;
    const resource = service.resources[resourceName];

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
        sorter: true,
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
        sorter: true,
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
      /*
      currently not working with sort. Need Campsi fix
      {
        title: "Creator",
        sorter: true,
        dataIndex: ['creator', 'email']
      },
      */
    ];

    properties.forEach((property) => {
      columns.push({
        title: property.title || property.name,
        dataIndex: ["data", property.name],
        ellipsis: true,
        filterDropdown: this.generateFilterDropdown(property),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        sorter: true,
        render: this.getColumnRender(property, language),
      });
    });

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
                {this.renderPropertyOptions(allProperties)}
              </Select>
            </Space>
          </Card>
          <div className="site-layout-background">
            <Table
              columns={columns}
              rowKey={(item) => item.id}
              dataSource={this.state.items}
              onChange={this.handleTableChange}
              current={this.state.page}
              totalSize={this.state.totalCount}
              pagination={{
                pageSize: this.state.perPage,
                current: this.state.page,
                total: this.state.totalCount,
                pageSizeOptions: [25, 50, 100, 200],
                onChange: (page, pageSize) => {
                  this.setState(
                    {
                      perPage: pageSize,
                      page,
                    },
                    this.handleTableChange
                  );
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
