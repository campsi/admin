import { withAppContext } from "../../App";
import { Component } from "react";
import {Divider, Form, Input, Select, Space, Typography} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
/**
 *
 * @param {object} properties
 * @param {string} properties.resource
 * @param {string} properties.service
 * @returns {React.Component}
 */
function generateRelationField(properties) {
  const { resource, service, labelIndex = "name" } = properties;

  class RelationField extends Component {
    state = {
      items: [],
      perPage: 100,
      page: 1,
      totalCount: 0,
      newItemName: "",
      isCreatingNewItem: false,
    };

    async componentDidMount() {
      await this.fetchData();
    }

    async fetchData() {
      const { api } = this.props;
      const { perPage, page, totalCount } = this.state;
      const response = await api.client.get(
        `${service}/${resource}?perPage=${perPage}&page=${page}&totalCount=${totalCount}`
      );
      this.setState({
        items: response.data,
        totalCount: response.headers["X-Total-Count"],
      });
    }

    onNewItemNameChange(e) {
      e.preventDefault();
      this.setState({ newItemName: e.target.value });
    }

    addNewItem(e) {
      e.preventDefault();
      const { items, newItemName } = this.state;
      const { api, onChange } = this.props;
      this.setState({ isCreatingNewItem: true }, async () => {
        const response = await api.client.post(`${service}/${resource}`,{
          [labelIndex]: newItemName,
        });
        if (response.data) {
          this.setState(
            {
              items: items.concat([response.data]),
              isCreatingNewItem: false,
            },
            () => {
              onChange(response.data.id);
            }
          );
        }
      });
    }

    render() {
      const { formData, onChange, schema } = this.props;
      const { newItemName, items, isCreatingNewItem } = this.state;
      return (
        <Form.Item label={schema.title}>
          <Select
            showSearch
            value={formData}
            optionFilterProp="children"
            onChange={onChange}
            filterOption={(input, option) => {
              return String(option.label)
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
            options={items.map((doc) => {
              return {
                key: doc.id,
                value: doc.id,
                label: doc.data[labelIndex],
              };
            })}
            dropdownRender={(menu) => {
              return (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Space align="center" style={{ padding: "0 8px 4px" }}>
                    <Input
                      placeholder="Please enter item"
                      value={newItemName}
                      onChange={(e) => this.onNewItemNameChange(e)}
                    />
                    <Typography.Link
                      onClick={(e) => this.addNewItem(e)}
                      style={{ whiteSpace: "nowrap" }}
                      disabled={isCreatingNewItem}
                    >
                      {isCreatingNewItem ? (
                        <LoadingOutlined />
                      ) : (
                        <PlusOutlined />
                      )}
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
