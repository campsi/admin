import { withAppContext } from "../../App";
import { Button, Card, Descriptions, Space, Tabs } from "antd";
import withParams from "../../utils/withParams";
import React, { Component } from "react";
import StylesheetDetails from "./Details/StylesheetDetails";
import ScannerDetails from "./Details/ScannerDetails";
import ProvisioningDetails from "./Details/ProvisioningDetails";
import ShowcaseDetails from "./Details/ShowcaseDetails";
import TextArea from "antd/lib/input/TextArea";
import copy from "copy-to-clipboard";

const { TabPane } = Tabs;

class AutomatorJob extends Component {
  state = {
    job: {},
    copyButtonText: "Copy to clipboard",
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

    const installationScript =
      'window.axeptioSettings= { clientId:"' +
      job.actions?.provisioning?.result?.projectId +
      '", }; (function(d,s) { var t = d.getElementsByTagName(s)[0], e = d.createElement(s); e.async = true; e.src = "//static.axept.io/sdk.js"; t.parentNode.insertBefore(e, t); })(document, "script");';

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
                      {action === "stylesheet" && (
                        <StylesheetDetails
                          result={job.actions[action].result}
                        />
                      )}
                      {action === "scanner" && (
                        <ScannerDetails result={job.actions[action].result} />
                      )}
                      {action === "provisioning" && (
                        <ProvisioningDetails
                          result={job.actions[action].result}
                        />
                      )}
                      {action === "showcase" && (
                        <ShowcaseDetails result={job.actions[action].result} />
                      )}
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
                          border: 0,
                        }}
                      />
                    </TabPane>
                  </Tabs>
                </TabPane>
              );
            })}
            {Array.from(actions).includes("provisioning") && (
              <TabPane
                tab={"installationScript"}
                key={`tab_installationScript`}
              >
                <TextArea
                  value={installationScript}
                  rows={30}
                  style={{
                    width: "100%",
                    fontFamily: "'Menlo', 'Monaco', monospace",
                    fontSize: 11,
                    border: 0,
                  }}
                />

                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => {
                    copy(installationScript);
                    this.setState({ copyButtonText: "Done" });
                    setTimeout(
                      () =>
                        this.setState({ copyButtonText: "Copy to clipboard" }),
                      5000
                    );
                  }}
                >
                  {this.state.copyButtonText}
                </Button>
              </TabPane>
            )}
          </Tabs>
        </Space>
      </Card>
    );
  }
}

export default withAppContext(withParams(AutomatorJob));
