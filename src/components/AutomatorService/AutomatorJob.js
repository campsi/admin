import { withAppContext } from "../../App";
import { Button, Card, Descriptions, Empty, Tabs } from "antd";
import withParams from "../../utils/withParams";
import React, { Component } from "react";
import StylesheetDetails from "./Details/StylesheetDetails";
import ScannerDetails from "./Details/ScannerDetails";
import ProvisioningDetails from "./Details/ProvisioningDetails";
import ShowcaseDetails from "./Details/ShowcaseDetails";
import {CheckCircleOutlined, LoadingOutlined, ReloadOutlined} from "@ant-design/icons";
import AutomatorJobActions from "./AutomatorJobActions";

const { TabPane } = Tabs;

class AutomatorJob extends Component {
  state = {
    job: {},
    isFetching: false,
  };
  componentDidMount() {
    this.fetchData();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.params.id !== this.props.params.id) {
      this.fetchData();
    }
  }

  fetchData() {
    const { api, service, params } = this.props;
    this.setState({ isFetching: true }, async () => {
      const response = await api.client.get(
        `/${service.name}/jobs/${params.id}`
      );
      this.setState({
        job: response.data,
        isFetching: false,
      });
    });
  }

  renderActionPanel(action) {
    const { job } = this.state;
    if (!job.actions?.[action]?.result) {
      return <Empty />;
    }
    switch (action) {
      case "stylesheet":
        return <StylesheetDetails result={job.actions[action].result} />;
      case "scanner":
        return <ScannerDetails result={job.actions[action].result} />;
      case "provisioning":
        return <ProvisioningDetails result={job.actions[action].result} />;
      case "showcase":
        return <ShowcaseDetails result={job.actions[action].result} />;
      default:
        return <Empty />;
    }
  }

  render() {
    const { job, isFetching } = this.state;
    const allActions = Object.keys(AutomatorJobActions);

    if (isFetching) {
      return (
        <Card extra={<Button icon={<LoadingOutlined />} />}>
          <LoadingOutlined />
        </Card>
      );
    }

    return (
      <Card
        extra={
          <Button onClick={() => this.fetchData()} icon={<ReloadOutlined />} />
        }
      >
        <Tabs type="card" key={job.id}>
          <TabPane tab="job details" key="tab_details">
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
          </TabPane>
          {allActions.map((action) => {
            return (
              <TabPane
                tab={job.actions?.[action]?.result ? <><CheckCircleOutlined /> {action}</> : action}
                key={`tab_${action}`}
                disabled={typeof job.actions?.[action] === "undefined"}
              >
                {this.renderActionPanel(action)}
              </TabPane>
            );
          })}
        </Tabs>
      </Card>
    );
  }
}

export default withAppContext(withParams(AutomatorJob));
