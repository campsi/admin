import { withAppContext } from "../../App";
import { Card, Descriptions, Space, Tabs } from "antd";
import withParams from "../../utils/withParams";
import React, { Component } from "react";
import StylesheetDetails from "./Details/StylesheetDetails";
import ScannerDetails from "./Details/ScannerDetails";
import ProvisioningDetails from "./Details/ProvisioningDetails";
import ShowcaseDetails from "./Details/ShowcaseDetails";

const { TabPane } = Tabs;

class AutomatorJob extends Component {
  state = {
    job: {},
  };
  componentDidMount() {
    this.fetchData();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.params.id !== this.props.params.id) {
      this.fetchData();
    }
  }

  async fetchData() {
    const { api, service, params } = this.props;
    const response = await api.client.get(`/${service.name}/jobs/${params.id}`);
    this.setState({
      job: response.data,
    });
  }

  render() {
    const { job } = this.state;
    const actions = Object.keys(job.actions || {}).filter(
      (a) => job.actions?.[a]?.active
    );

    return (
      <Card title={`Automator Job ${this.props.params.id}`}>
        <Space direction="vertical" style={{width: '100%'}}>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="status">{job.status}</Descriptions.Item>
            <Descriptions.Item label="createdBy">
              {job.createdBy}
            </Descriptions.Item>
            <Descriptions.Item label="createdAt">
              {job.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="Domain">
              {job.params?.domain}
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              {job.params?.priority}
            </Descriptions.Item>
          </Descriptions>
          <Tabs>
            {actions.map((action) => {
              return (
                <TabPane tab={action} key={`tab_${action}`}>
                  {action === "stylesheet" && (
                    <StylesheetDetails result={job.actions[action].result} />
                  )}
                  {action === "scanner" && (
                    <ScannerDetails result={job.actions[action].result} />
                  )}
                  {action === "provisioning" && (
                    <ProvisioningDetails result={job.actions[action].result} />
                  )}
                  {action === "showcase" && (
                    <ShowcaseDetails result={job.actions[action].result} />
                  )}
                </TabPane>
              );
            })}
          </Tabs>
        </Space>
      </Card>
    );
  }
}

export default withAppContext(withParams(AutomatorJob));
