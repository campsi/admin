import { withAppContext } from "../../App";
import { Card, Descriptions, Space, Tabs } from "antd";
import withParams from "../../utils/withParams";
import React, { Component } from "react";
import StylesheetDetails from "./Details/StylesheetDetails";

const { TabPane } = Tabs;

const ActionDetails = {
  stylesheet: StylesheetDetails
};

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
        <Space direction="vertical">
          <Descriptions bordered column={2}>
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
                  <Tabs tabPosition="right" size="small">
                    <TabPane tab="Pretty" key={`tab_${action}_pretty`}>
                      {ActionDetails[action]
                        ? React.createElement(ActionDetails[action], {
                            result: job.actions[action].result,
                          })
                        : null}
                    </TabPane>
                    <TabPane tab="Raw" key={`tab_${action}_raw`}>
                      <textarea
                        defaultValue={JSON.stringify(
                          job.actions[action].result,
                          null,
                          2
                        )}
                        rows={30}
                        style={{
                          width: "100%",
                          fontFamily: "'Menlo', 'Monaco', monospace",
                          fontSize: 11,
                        }}
                      />
                    </TabPane>
                  </Tabs>
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
