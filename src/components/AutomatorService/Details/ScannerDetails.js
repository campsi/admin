import { Descriptions, Button, Space, Table, Tag, Typography, Tabs } from "antd";
import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import { GlobalOutlined } from "@ant-design/icons";
import { withAppContext } from "../../../App";
import PropTypes from "prop-types";
import { Component } from "react";
import { downloadFile } from './GtmDetails';

const { Title } = Typography;
const { Item } = Descriptions;
const { TabPane } = Tabs;

function downloadPDF(result){
  downloadFile(JSON.stringify(result), 'rapport.pdf', 'application/pdf');
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
function ExpandedVendorRow({ vendor }) {
  const codeStyle = { fontFamily: "Monaco, Menlo, monospace", fontSize: 12 };
  const ulStyle = { ...codeStyle, margin: 0, paddingLeft: 10 };
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
    dataSource: this.props?.result.map((vendor) => {
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
            {this.state.categories.filter((c) => c.id === id)[0]?.data.name ||
              id}
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
    },
  ];


  render() {
    const { dataSource } = this.state;
    return (
      <Space size={"large"}>
      <Tabs tabPosition={"left"}>
        <TabPane tab="Result Verified" key="1">
        <Table
          columns={this.getColumns()}
          dataSource={dataSource}
          expandable={{
            expandedRowRender: (vendor) => <ExpandedVendorRow vendor={vendor} />,
          }}
        />
        </TabPane>
        <TabPane tab="Result Unverified" key="2">
          Content of Tab 2
        </TabPane>
        <TabPane tab="Result unknown " key="3">
          Content of Tab 3
        </TabPane>
      </Tabs>

      <Descriptions bordered column={3} size="medium">
        <Item label="Download PDF" span={3}>
          <Button
            icon={<VerticalAlignBottomOutlined />}
            onClick={() => downloadPDF("lien")}
          />
        </Item>
        <Item label="nbPagesParsed" span={2}>
          f
        </Item>
        <Item label="nbPagesParsed">
          f
        </Item>
      </Descriptions>
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
