import React, { Component } from 'react';
import { withAppContext } from '../../App';
import withParams from '../../utils/withParams';
import { Link } from 'react-router-dom';
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined, FileOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Layout, Typography, Table, notification, Card, Space, Button, Select, Input, Radio, Flex, Modal } from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

class ResourceListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      perPage: 25,
      page: 1,
      items: [],
      totalCount: 0,
      lastPage: 1,
      selectedState: undefined,
      language: 'en',
      visibleProperties: [],
      filters: {}
    };
    this.handlePopState = this.handlePopState.bind(this);
  }

  async componentDidMount() {
    window.addEventListener('popstate', this.handlePopState);

    if (window?.location?.search) {
      const urlParams = new URLSearchParams(window.location.search);
      const page = parseInt(urlParams.get('page'));
      const perPage = parseInt(urlParams.get('perPage'));

      if (this.state.perPage !== perPage) {
        this.setState({ perPage });
      }
      if (this.state.page !== page) {
        this.setState({ page });
      }
    }

    await this.updateVisibleProperties();
    await this.fetchData();
  }

  async componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }

  async handlePopState(event) {
    const urlParams = new URLSearchParams(window?.location?.search);
    const page = parseInt(urlParams.get('page'));
    const perPage = parseInt(urlParams.get('perPage'));

    if (this.state.perPage !== perPage || this.state.page !== page) {
      if (this.state.perPage !== perPage) {
        this.setState({ perPage });
      }
      if (this.state.page !== page) {
        this.setState({ page });
      }
      await this.fetchData({}, {}, { current: page, pageSize: perPage });
    }
  }

  async quickUpdate(id, propertyName, value) {
    const { api, service, params } = this.props;
    const { resourceName } = params;

    await api.client.patch(`${service.name}/${resourceName}/${id}`, {
      [propertyName]: value
    });

    await this.fetchData();
  }

  generateFilterDropdown({ name, title, ...property }) {
    return ({ setSelectedKeys, selectedKeys, confirm }) => {
      const current = selectedKeys[0] || {
        operator: '*',
        value: '',
        isLocalizedString: property['ui:field'] === 'LocalizedString'
      };
      return (
        <Space style={{ padding: 8 }} direction="horizontal">
          <Select
            value={current.operator}
            onChange={value => {
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
            onChange={e => setSelectedKeys(e.target.value ? [{ ...current, value: e.target.value }] : [])}
            onPressEnter={() => confirm({ closeDropdown: true })}
          />
          <Button type="primary" onClick={() => confirm({ closeDropdown: true })} icon={<SearchOutlined />} size="small">
            Search
          </Button>
        </Space>
      );
    };
  }
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.params.resourceName !== this.props.params.resourceName) {
      // reset state when changing resource
      this.setState({
        isFetching: true,
        perPage: 25,
        page: 1,
        items: [],
        totalCount: 0,
        lastPage: 1,
        selectedState: undefined,
        language: 'en',
        visibleProperties: [],
        filters: {}
      });
      await this.updateVisibleProperties();
      await this.fetchData();
    }
  }

  async fetchData(filters = {}, sorter = {}, pagination, selectedState) {
    /* Destructuring the props object. */
    const { api, service, authenticated } = this.props;
    const { visibleProperties } = this.state;
    const { resourceName } = this.props.params;
    const resource = service.resources[resourceName];
    const resourceClass = service.classes[resource.class];
    selectedState = selectedState ?? this.state.selectedState ?? resourceClass.defaultState;
    let { perPage, page } = this.state;
    if (pagination) {
      perPage = pagination.pageSize;
      page = pagination.current;
    }
    const properties = visibleProperties.map(prop => {
      return { name: prop, ...resource.schema.properties[prop] };
    });
    const allowedMethods = resourceClass.permissions[authenticated ? 'owner' : 'public']?.[selectedState];
    if (!allowedMethods) {
      if (authenticated) {
        notification.open({
          message: 'Resource is not available',
          description: 'This resource cannot be fetched when logged in'
        });
      } else {
        notification.open({
          message: 'Resource is not public',
          description: 'This resource cannot be fetched anonymously, please log in first.'
        });
      }
      return;
    }

    this.setState({ isFetching: true });

    const urlParams = new URLSearchParams(window?.location?.search);

    if (urlParams && urlParams.has('page') && urlParams.has('perPage')) {
      if (parseInt(urlParams.get('page')) !== page) {
        urlParams.set('page', page);
      }
      if (parseInt(urlParams.get('perPage')) !== perPage) {
        urlParams.set('perPage', perPage);
      }
      if (urlParams.toString() !== new URLSearchParams(window?.location?.search).toString()) {
        window.history.pushState({}, '', window.location.pathname + '?' + urlParams.toString());
      }
    } else {
      urlParams.append('page', page);
      urlParams.append('perPage', perPage);
      window.history.replaceState({}, '', window.location.pathname + '?' + urlParams.toString());
    }

    const params = new URLSearchParams({
      perPage: perPage,
      page: page,
      embed: `${properties.map(p => p.name).join(',')}`
    });

    Object.keys(filters)
      .filter(key => {
        return filters[key]?.length > 0;
      })
      .forEach(key => {
        let propertyPath = key;
        if (filters[key][0].isLocalizedString) {
          propertyPath = filters[key][0].__lang ? `${key}.__lang.en` : key;
        }

        params.append(`${propertyPath}${filters[key][0].operator}`, filters[key][0].value);
      });

    if (sorter.field) {
      const field = Array.isArray(sorter.field) ? sorter.field.join('.') : sorter.field;
      params.append('sort', `${sorter.order !== 'ascend' ? `-states.${selectedState}.` : `states.${selectedState}.`}${field}`);
    }
    params.append('state', selectedState);
    const response = await api.client.get(`/${service.name}/${resourceName}?${params.toString()}`);
    this.setState({
      items: response.data,
      isFetching: false,
      lastPage: Number(response.headers['x-last-page']),
      totalCount: Number(response.headers['x-total-count']),
      selectedState: selectedState
    });
  }

  handleTableChange = async (pagination, filters, sorter) => {
    await this.fetchData(filters, sorter, pagination);
  };

  async updateVisibleProperties() {
    return new Promise(resolve => {
      const { service } = this.props;
      const { resourceName } = this.props.params;
      const resource = service.resources[resourceName];
      this.setState(
        {
          visibleProperties: resource.schema['ui:defaultColumns'] ?? []
        },
        () => resolve()
      );
    });
  }

  renderPropertyOptions(properties) {
    return properties.map(p => {
      return (
        <Option value={p.name} key={`option_${p.name}`}>
          {p.title}
        </Option>
      );
    });
  }

  getColumnRender(property, language) {
    return (value, row) => {
      if (property['ui:relation']) {
        const { service, resource, labelIndex, embeddedIndex } = property['ui:relation'];
        if (!value) {
          return '';
        }
        return (
          <Link to={`/services/${service}/resources/${resource}/${value}`}>
            {row[embeddedIndex]?.[labelIndex] || row.data[embeddedIndex]?.[labelIndex] || value}
          </Link>
        );
      }

      let type = property.type;
      if (!property.type && Array.isArray(property.oneOf)) {
        type = typeof value;
      }
      switch (type) {
        case 'boolean':
          return value ? <CheckOutlined /> : <CloseOutlined />;
        case 'object':
          if (value?.__lang) {
            return this.renderStringInCell(value.__lang?.[language]);
          }
          if (value?.url && value?.detectedMimeType) {
            if (value.detectedMimeType.includes('image')) {
              return <img src={value?.url} style={{ maxHeight: 30, maxWidth: 50 }} alt={value?.originalName} />;
            }
            return <FileOutlined title={value.originalName} />;
          }
          return JSON.stringify(value);
        case 'array':
          const length = Array.from(value || []).length;
          switch (length) {
            case 0:
              return 'Empty';
            case 1:
              return '1 item';
            default:
              return `${length} items`;
          }
        case 'string':
          return this.renderStringInCell(value, property, row);
        case 'number':
        default:
          return value;
      }
    };
  }

  renderStringInCell(string, property = {}, row) {
    let str = String(string || '');
    if ((str.indexOf('http') === 0 || property.format === 'hostname') && !property.enum) {
      return (
        <a href={str.indexOf('http') === 0 ? str : `https://${str}`} target="_blank" rel="noreferrer">
          {str.indexOf('http') === 0 ? str : `https://${str}`}
        </a>
      );
    }
    if (!property.virtual && property.enum?.length > 0) {
      return (
        <Select
          showSearch
          placeholder={property.name}
          value={string}
          onChange={async value => {
            await this.quickUpdate(row.id, property.name, value);
          }}
        >
          {property.enum.map(option => {
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
    const { service, api } = this.props;
    const { resourceName } = this.props.params;
    const { language, visibleProperties, selectedState } = this.state;
    const resource = service.resources[resourceName];
    const resourceClass = service.classes[resource.class];

    const allProperties = Object.keys(resource.schema.properties).map(prop => {
      return { name: prop, ...resource.schema.properties[prop] };
    });
    const properties = visibleProperties.map(prop => {
      return { name: prop, ...resource.schema.properties[prop] };
    });

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        render: value => <Link to={`/services/${service.name}/resources/${resourceName}/${value}`}>{value.substring(20)}</Link>
      },
      {
        title: 'Created At',
        sorter: true,
        dataIndex: 'createdAt',
        render: value => {
          const date = dayjs(value);
          return <span title={date.format('HH:mm:ss')}>{date.format('YYYY/MM/DD')}</span>;
        }
      }
    ];

    properties.forEach(property => {
      columns.push({
        title: property.title || property.name,
        dataIndex: ['data', property.name],
        ellipsis: true,
        filterDropdown: this.generateFilterDropdown(property),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        sorter: true,
        render: this.getColumnRender(property, language)
      });
    });

    return (
      <Layout.Content style={{ padding: 30 }}>
        <Title>
          {service.name}/{resourceName}
        </Title>
        <Space direction="vertical">
          <Card>
            <Space style={{ marginBottom: '20px' }}>
              <Link to={`/services/${service.name}/resources/${resourceName}/new`}>
                <Button>Create new document</Button>
              </Link>
              <Select
                mode="tags"
                style={{ minWidth: 400 }}
                value={visibleProperties}
                onChange={selection => {
                  this.setState({ visibleProperties: selection });
                }}
              >
                {this.renderPropertyOptions(allProperties)}
              </Select>
            </Space>
            <Flex justify="space-between" align="center">
              <Radio.Group
                value={selectedState}
                onChange={event => {
                  const { page, perPage } = this.state;
                  const toUpdate = {
                    selectedState: event.target.value
                  };
                  this.setState(toUpdate);
                  this.fetchData(this.state.filters, {}, { current: page, pageSize: perPage }, event.target.value);
                }}
              >
                {Object.keys(resourceClass.states).map(state => {
                  return (
                    <Radio.Button key={state} value={state}>
                      {state}
                    </Radio.Button>
                  );
                })}
              </Radio.Group>
              <ButtonGroup>
                {resource.schema['ui:functions']?.map(func => {
                  return (
                    <Button
                      key={func.name}
                      onClick={async () => {
                        const executeFunc = async () => {
                          try {
                            const resp = await api.client.get(func.url);
                            notification.success({ message: resp.data.message ?? 'Success' });
                          } catch (error) {
                            notification.error({ message: error.response.data.message ?? error.message });
                          }
                        };
                        if (func.warning) {
                          confirm({
                            title: func.warning.title,
                            icon: <ExclamationCircleOutlined />,
                            content: func.warning.content,
                            onOk: executeFunc
                          });
                        } else {
                          await executeFunc();
                        }
                      }}
                      danger={func.warning}
                    >
                      {func.name}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </Flex>
          </Card>
          <div className="site-layout-background">
            <Table
              columns={columns}
              rowKey={item => item.id}
              dataSource={this.state.isFetching ? [] : this.state.items}
              onChange={this.handleTableChange}
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
                    page
                  });
                }
              }}
            />
          </div>
        </Space>
      </Layout.Content>
    );
  }
}
export default withAppContext(withParams(ResourceListing));
