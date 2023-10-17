import { withAppContext } from '../../App';
import { Component } from 'react';
import { Divider, Form, Input, Select, Space, Typography } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
/**
 *
 * @todo implement pagination
 * @todo disable item creation with a schema property
 * @todo implement server-side filtering
 *
 * @param {*&{perPage: number}} properties
 * @param {string} properties.resource
 * @param {string} properties.service
 * @returns {React.Component}
 */
function generateRelationField(properties) {
  const { resource, service, labelIndex = 'name', perPage } = properties;

  class RelationField extends Component {
    state = {
      items: [],
      perPage: perPage ?? 100,
      page: 1,
      totalCount: 0,
      newItemData: {},
      isCreatingNewItem: false
    };

    async componentDidMount() {
      await this.fetchData();
    }

    setStateAsync(state) {
      return new Promise(resolve => this.setState(state, () => resolve()));
    }

    async fetchData() {
      const { api } = this.props;
      const { perPage, page, totalCount } = this.state;
      const response = await api.client.get(`${service}/${resource}?perPage=${perPage}&page=${page}&totalCount=${totalCount}`);
      this.setState({
        items: response.data,
        totalCount: response.headers['X-Total-Count']
      });
    }

    async addNewItem(e) {
      e.preventDefault();
      const { items, newItemData } = this.state;
      const { api, onChange } = this.props;
      await this.setStateAsync({ isCreatingNewItem: true });
      try {
        const response = await api.client.post(`${service}/${resource}`, newItemData);
        if (response.data) {
          await this.setStateAsync({
            items: items.concat([response.data]),
            isCreatingNewItem: false
          });
          onChange(response.data.id);
        }
      } catch (error) {
        await this.setStateAsync({
          isCreatingNewItem: false
        });
        console.error(error);
      }
    }

    render() {
      const { formData, onChange, schema, services, formItemProps } = this.props;
      const relSchema = services[service].resources[resource].schema;
      const requiredProperties =
        relSchema.required?.map(propertyName => {
          return { name: propertyName, ...relSchema.properties[propertyName] };
        }) || [];
      const { items, isCreatingNewItem, newItemData } = this.state;
      return (
        <Form.Item label={schema.title} {...formItemProps}>
          <Select
            showSearch
            value={formData}
            optionFilterProp="children"
            onChange={value => onChange(value, items.filter(item => value === item.id)[0])}
            filterOption={(input, option) => {
              // implement querying
              return String(option.label).toLowerCase().includes(input.toLowerCase());
            }}
            options={items.map(doc => {
              return {
                key: doc.id,
                value: doc.id,
                label: doc.data[labelIndex]
              };
            })}
            dropdownRender={menu => {
              return (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space align="center" style={{ padding: '0 8px 4px' }}>
                    {requiredProperties.map(propSchema => {
                      return (
                        <div key={propSchema.name}>
                          <Input
                            type="text"
                            name={propSchema.name}
                            placeholder={propSchema.title}
                            required
                            value={newItemData[propSchema.name]}
                            onChange={e => {
                              this.setState({
                                newItemData: {
                                  ...newItemData,
                                  [e.target.name]: e.target.value
                                }
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                    <Typography.Link
                      onClick={e => this.addNewItem(e)}
                      style={{ whiteSpace: 'nowrap' }}
                      disabled={isCreatingNewItem}
                    >
                      {isCreatingNewItem ? <LoadingOutlined /> : <PlusOutlined />}
                      Add item
                    </Typography.Link>
                  </Space>
                </>
              );
            }}
          />
        </Form.Item>
      );
    }
  }

  return withAppContext(RelationField);
}

export { generateRelationField };
