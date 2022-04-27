
import {Descriptions, Space, Table, Tag, Typography} from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { withAppContext } from "../../../App";
import PropTypes from "prop-types";
import { Component } from "react";

const { Title } = Typography;
const { Item } = Descriptions;

/**
 *
 * {
 *           "hrefs": [
 *             "https://www.googletagmanager.com/gtm.js?id=GTM-MVQR8J8",
 *             "https://www-googletagmanager.l.google.com/gtm.js?id=GTM-MVQR8J8"
 *           ],
 *           "hosts": [
 *             "www.googletagmanager.com",
 *             "www-googletagmanager.l.google.com"
 *           ],
 *           "pathname": "/gtm.js",
 *           "hint": {
 *             "host": {
 *               "$endsWith": "google.com"
 *             }
 *           }
 *         },
 *
 * @param vendor
 * @returns {JSX.Element}
 * @constructor
 */
function ExpandedVendorRow({ vendor }) {
  return (
    <div>
      <Title level={3}>Detection hints</Title>
      <Title level={4}>Cookies</Title>
      <Title level={4}>Resources</Title>
      {vendor.detectionHints.resources.map((resource, index) => {
        return (
          <Descriptions key={`resource_${index}`} size="small" bordered col={2}>
            <Item label="hrefs">{resource.hrefs.join(", ")}</Item>
            <Item label="hosts">{resource.hosts.join(", ")}</Item>
            <Item label="pathname">{resource.pathname}</Item>
            <Item label="hint">{JSON.stringify(resource.hint)}</Item>
          </Descriptions>
        );
      })}
    </div>
  );
}

class ScannerDetails extends Component {
  state = {
    categories: [],
    dataSource: this.props.result.map((vendor) => {
      return { key: vendor.name, ...vendor };
    }),
  };
  componentDidMount() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.props.api.client.get("/vendors/categories").then((response) => {
      this.setState({
        categories: response.data,
      });
    });
  }
  getColumns = () => [
    {
      title: "Technical name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Categories",
      dataIndex: "categoryIds",
      key: "Categories",
      render: (categoryIds) =>
        categoryIds.map((id) => (
          <Tag key={id}>
            {this.state.categories.filter((c) => c.id === id)[0]?.data.name || id}
          </Tag>
        )),
    },
    {
      title: "Policy URL",
      dataIndex: "policyUrl",
      key: "policyUrl",
      render: (value) => {
        if (typeof value === "string") {
          return (
            <a href={value}>
              <GlobalOutlined />
            </a>
          );
        }
        if (typeof value === "object") {
          return (
            <Space>
              {Object.keys(value.$lang || {}).map((language) => {
                return (
                    <a key={language} href={value.$lang[language]}>{language}</a>
                );
              })}
            </Space>
          );
        }
      },
    },
    {
      title: "Company",
      dataIndex: ["company", "name"],
    },
  ];

  render() {
    const { dataSource } = this.state;
    return (
      <Table
        columns={this.getColumns()}
        dataSource={dataSource}
        expandable={{
          expandedRowRender: (vendor) => <ExpandedVendorRow vendor={vendor} />,
        }}
      />
    );
  }
}

ScannerDetails.propTypes = {
  result: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      categoryIds: PropTypes.arrayOf(PropTypes.string),
      company: PropTypes.shape(
        PropTypes.shape({
          name: PropTypes.string,
        })
      ),
    })
  ),
};
export default withAppContext(ScannerDetails);
