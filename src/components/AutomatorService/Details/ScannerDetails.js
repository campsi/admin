import { Descriptions, Button, Space, Table, Tag, Typography } from "antd";
import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import { GlobalOutlined } from "@ant-design/icons";
import { withAppContext } from "../../../App";
import PropTypes from "prop-types";
import { Component } from "react";
import { downloadFile } from './GtmDetails';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';


const { Title } = Typography;
const { Item } = Descriptions;
function downloadPDF(result){
  downloadFile(JSON.stringify(result), 'rapport.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

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
function ExpandedVendorRow({ vendor, isKnown = true }) {
  const codeStyle = { fontFamily: "Monaco, Menlo, monospace", fontSize: 12 };
  const ulStyle = { ...codeStyle, margin: 0, paddingLeft: 10 };

  if(!isKnown){
    return <div>
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
      this.props?.result.knownVendors.map(vendor => vendors.push(vendor));
      this.props?.result.unknownVendors.map(vendor => vendors.push(vendor));
      return vendors.map((vendor) => {
        return { key: vendor.name, ...vendor };
    })
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
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      key: "name",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (value) => value? value: ""
    },
    {
      title: "Categories",
      dataIndex: "categoryIds",
      key: "Categories",
      render: (categoryIds) => {
        if(!categoryIds){
          return "";
        }
        categoryIds.map((id) => (
          <Tag key={id}>
            {this.state.categories.filter((c) => c.id === id)[0]?.data.name ||
              id}
          </Tag>
        ))},
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
      render: (value) => value? value: ""
    },
    {
      title: "IsDetectedAfterConsent",
      dataIndex: ["detectedAfterConsent"],
      sorter: (a, b) => (a.detectedAfterConsent === b.detectedAfterConsent)? 0 : a.detectedAfterConsent? -1 : 1,
      key: "detectedAfterConsent",
      render: (value) => value? <CheckCircleOutlined style={{ color: "green"}} /> : <CloseCircleOutlined style={{ color: "red"}} />
    },
    {
      title: "IsExemptedOfConsent",
      dataIndex: ["consentExemption"],
      sorter: (a, b) => (a.consentExemption === b.consentExemption)? 0 : a.consentExemption? -1 : 1,
      key: "consentExemption",
      render: (value) => value? <CheckCircleOutlined style={{ color: "green"}} /> : <CloseCircleOutlined style={{ color: "red"}}/>
    },
  ];



  render() {
    const { dataSource, metadata } = this.state;
    return (
      <Space size={"large"} direction={"vertical"}>
        <Descriptions bordered column={3} size="medium">
          <Item label="nbPagesParsed" span={2}>
            {metadata.nbPagesParsed}
          </Item>
          <Item label="Vendor(s) Found" span={2}>
            {Object.keys(dataSource.call(this)).length}
          </Item>
          <Item label="Download Excel" span={3}>
            <Button
              icon={<VerticalAlignBottomOutlined />}
              onClick={() => downloadPDF(metadata.xlsxURL)}
            />
          </Item>
        </Descriptions>
        <Table
          columns={this.getColumns()}
          dataSource={dataSource.call(this)}
          expandable={{
            expandedRowRender: (vendor) => <ExpandedVendorRow vendor={vendor} isKnown={vendor.detectedAfterConsent} />,
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
