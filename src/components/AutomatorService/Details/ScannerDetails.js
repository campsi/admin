import { Descriptions, Button, Space, Table, Tag, Typography } from "antd";
import { VerticalAlignBottomOutlined } from "@ant-design/icons";
import { GlobalOutlined } from "@ant-design/icons";
import { withAppContext } from "../../../App";
import PropTypes from "prop-types";
import { Component } from "react";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";

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
 * @param isKnown
 * @returns {JSX.Element}
 * @constructor
 */
function ExpandedVendorRow({ vendor, isKnown = true }) {
  const codeStyle = { fontFamily: "Monaco, Menlo, monospace", fontSize: 12 };
  const ulStyle = { ...codeStyle, margin: 0, paddingLeft: 10 };

  if (!isKnown) {
    return (
      <div>
        <Title level={1}>Pages</Title>
        {Object.keys(vendor.pagesFound).map((resource, index) => {
          return (
            <Descriptions
              key={`resource_${index}`}
              size="small"
              bordered
              column={1}
              style={{ marginBottom: 16 }}
            >
              <Item label="hrefs">
                <ul style={ulStyle}>
                  <li key={index} title={resource}>
                    {resource.substring(0, 100)}
                  </li>
                </ul>
              </Item>
            </Descriptions>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <Title level={3}>Detection hints</Title>
      <Title level={4}>Cookies</Title>
      <Title level={4}>Resources</Title>
      {vendor.detectionHints.resources.map((resource, index) => {
        return (
          <Descriptions
            key={`resource_${index}`}
            size="small"
            bordered
            column={1}
            style={{ marginBottom: 16 }}
          >
            <Item label="hrefs">
              <ul style={ulStyle}>
                {resource.hrefs.map((href) => (
                  <li key={href} title={href}>
                    {href.substring(0, 100)}
                  </li>
                ))}
              </ul>
            </Item>
            <Item label="hosts">
              {
                <ul style={ulStyle}>
                  {resource.hosts.map((host) => (
                    <li key={host} title={host}>
                      {host.substring(0, 100)}
                    </li>
                  ))}
                </ul>
              }
            </Item>
            <Item label="pathname">
              <span style={codeStyle} title={resource.pathname}>
                {resource.pathname.substring(0, 200)}
              </span>
            </Item>
            <Item label="hint">
              <span style={codeStyle}>
                {JSON.stringify(resource.hint, null, 2)}
              </span>
            </Item>
          </Descriptions>
        );
      })}
    </div>
  );
}

class ScannerDetails extends Component {
  state = {
    categories: [],
    metadata: this.props?.result,
    dataSource: () => {
      let vendors = [];
      this.props?.result.knownVendors.map((vendor) =>
        vendors.push({ isKnown: true, ...vendor })
      );
      this.props?.result.unknownVendors.map((vendor) =>
        vendors.push({ isKnown: false, ...vendor })
      );
      return vendors.map((vendor) => {
        return { key: vendor.name, ...vendor };
      });
    },
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
      key: "name",
      render: (vendor) => {
        if (vendor.id) {
          return (
            <a href={`/services/vendors/resources/solutions/${vendor.id}`}>
              {vendor.name}
            </a>
          );
        }
        return vendor.name;
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (value) => {
        return value ? value.$lang?.en ?? value : "";
      },
    },
    {
      title: "Categories",
      dataIndex: "categories",
      key: "Categories",
      render: (categories) => {
        if (!categories) {
          return "";
        }
        return categories.map((category) => {
          return (
            <Tag key={category.id}>
              {this.state.categories.filter((c) => c.id === category.id)[0]
                ?.data.name || category.id}
            </Tag>
          );
        });
      },
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
                  <a key={language} href={value.$lang[language]}>
                    {language}
                  </a>
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
      key: "Company",
      render: (value) => (value ? value : ""),
    },
    {
      title: " After Consent",
      dataIndex: ["detectedAfterConsent"],
      sorter: (a, b) =>
        a.detectedAfterConsent === b.detectedAfterConsent
          ? 0
          : a.detectedAfterConsent
          ? -1
          : 1,
      key: "detectedAfterConsent",
      render: (value) =>
        value ? (
          <CheckOutlined style={{ color: "green" }} />
        ) : (
          <CloseOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "Exempted of consent",
      dataIndex: ["consentExemption"],
      sorter: (a, b) =>
        a.consentExemption === b.consentExemption
          ? 0
          : a.consentExemption
          ? -1
          : 1,
      key: "consentExemption",
      render: (value) => (value ? <CheckOutlined /> : <CloseOutlined />),
    },
    {
      title: "Known",
      dataIndex: ["isKnown"],
      sorter: (a, b) => (a.isKnown === b.isKnown ? 0 : a.isKnown ? -1 : 1),
      key: "isKnown",
      render: (value) =>
        value ? (
          <CheckOutlined style={{ color: "green" }} />
        ) : (
          <CloseOutlined style={{ color: "red" }} />
        ),
    },
  ];

  getCmp(dataSource) {
    return (
      dataSource()
        //Get known vendor
        .filter((vendor) => {
          return vendor.isKnown;
        })
        //Search for CMP
        .map((vendor) => {
          for (let i = 0; i < vendor.categories.length; i++) {
            if (vendor.categories[i].name === "CMP") {
              return vendor;
            }
          }
          return "";
        })
        .filter((vendor) => {
          return vendor;
        })[0]?.name || "Not Found"
    );
  }

  render() {
    const { dataSource, metadata } = this.state;
    return (
      <Space size={"middle"} direction={"vertical"} style={{ width: "100%" }}>
        <Descriptions bordered column={3} size="large">
          <Item label="nbPagesParsed" span={2}>
            {metadata.nbPagesParsed}
          </Item>
          <Item label="Vendor(s) Found" span={2}>
            {Object.keys(dataSource.call(this)).length}
          </Item>
          <Item label="Download Excel" span={2}>
            <a href={metadata.xlsxURL} download>
              <Button icon={<VerticalAlignBottomOutlined />} />
            </a>
          </Item>
          <Item label="CMP Found" span={2}>
            {this.getCmp(dataSource)}
          </Item>
        </Descriptions>
        <Table
          columns={this.getColumns()}
          dataSource={dataSource.call(this)}
          expandable={{
            expandedRowRender: (vendor) => (
              <ExpandedVendorRow vendor={vendor} isKnown={vendor.isKnown} />
            ),
          }}
        />
      </Space>
    );
  }
}

ScannerDetails.propTypes = {
  result: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      categoryIds: PropTypes.arrayOf(PropTypes.string),
      company: PropTypes.shape({
        name: PropTypes.string,
      }),
    })
  ),
};
export default withAppContext(ScannerDetails);
