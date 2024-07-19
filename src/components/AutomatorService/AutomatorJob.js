import { withAppContext } from '../../App';
import { Button, Card, Descriptions, Empty, Tabs, Input } from 'antd';
import withParams from '../../utils/withParams';
import React, { Component } from 'react';
import StylesheetDetails from './Details/StylesheetDetails';
import ScannerDetails from './Details/ScannerDetails';
import ProvisioningDetails from './Details/ProvisioningDetails';
import ShowcaseDetails from './Details/ShowcaseDetails';
import GtmDetails from './Details/GtmDetails';
import {
  CheckCircleOutlined,
  DislikeOutlined,
  ExclamationCircleOutlined,
  LikeOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import AutomatorJobActions from './AutomatorJobActions';
import Meta from 'antd/es/card/Meta';
import copyText from '../../utils/copyText';
import { getDisplayedDuration } from './automatorHelpers';
import styled from 'styled-components';
import dayjs from 'dayjs';
const { TabPane } = Tabs;
const { TextArea } = Input;

function urlify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return '<a target="_blank" href="' + url + '">' + url + '</a>';
  });
  // or alternatively
  // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

const ButtonIcon = styled.button`
  height: auto;
  margin: 5px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);
  img {
    border-radius: 5px;
    margin-top: 3px;
    height: 40px;
    display: inline-flex;
  }
`;

class AutomatorJob extends Component {
  state = {
    job: {},
    isFetching: false
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
      const response = await api.client.get(`/${service.name}/jobs/${params.id}`);
      this.setState({
        job: response.data,
        isFetching: false
      });
    });
  }

  renderError(error = {}) {
    if (error.translations) {
      const tabList = [
        {
          key: 'en',
          tab: 'English'
        },
        {
          key: 'fr',
          tab: 'French'
        }
      ];
      const contentList = {
        en: <p dangerouslySetInnerHTML={{ __html: urlify(error.translations.en) }} />,
        fr: <p dangerouslySetInnerHTML={{ __html: urlify(error.translations.fr) }} />
      };
      return (
        <Card
          style={{ width: '100%', boxShadow: 'unset', color: 'red' }}
          headStyle={{ fontSize: '22px' }}
          title={'Error: ' + error.name}
          tabList={tabList}
          activeTabKey={this.state.activeTabKey}
          onTabChange={key => {
            this.setState({ activeTabKey: key });
          }}
        >
          {contentList[this.state.activeTabKey || 'en']}
        </Card>
      );
    }
    return (
      <TextArea
        readOnly
        rows={6}
        style={{ width: '100%', fontFamily: 'Monaco, monospace' }}
        defaultValue={JSON.stringify(error, null, 2)}
      />
    );
  }

  renderActionPanel(action) {
    const { job } = this.state;
    if (job.actions?.[action]?.result?.error) {
      return this.renderError(job.actions[action].result.error);
    }
    if (job.actions?.[action]?.preview && job.actions?.[action]?.approval.approved === undefined) {
      return (
        <Card
          title="Preview result"
          actions={[
            <Button
              danger
              style={{ borderColor: 'green', color: 'green' }}
              onClick={() => this.giveApprovalAction(job, action, true)}
            >
              Accept
            </Button>,
            <Button danger onClick={() => this.giveApprovalAction(job, action, false)}>
              Decline
            </Button>
          ]}
        >
          {this.actionDetails(job, action)}
        </Card>
      );
    }
    if (typeof job.actions?.[action]?.approval?.approved === 'boolean') {
      return (
        <Card cover={this.actionDetails(job, action)}>
          <Meta
            title={`${job.actions?.[action]?.approval.approved ? 'Approved' : 'Disapproved'} by ${
              job.actions?.[action]?.approval.approvedBy
            }`}
            style={{ 'text-align': 'center' }}
          />
        </Card>
      );
    }
    if (!job.actions?.[action]?.result) {
      return <Empty />;
    }
    return this.actionDetails(job, action);
  }

  giveApprovalAction(job, action, approve) {
    job.actions[action].approval.approved = approve;
    job.actions[action].approval.approvedBy = this.props.api.clientId;
    job.status = approve ? 'Pending' : 'Done';
    this.props.api.client
      .put(`/automator/jobs/${job._id + (approve ? '?push=true' : '')}`, job, {
        timeout: 10000
      })
      .then(() => {
        this.props.onFetching();
      });
    this.setState({ job });
  }

  actionDetails(job, action) {
    switch (action) {
      case 'stylesheet':
        return <StylesheetDetails result={job.actions[action].result ?? job.actions[action].preview} />;
      case 'scanner':
        return <ScannerDetails result={job.actions[action].result ?? job.actions[action].preview} />;
      case 'provisioning':
        return <ProvisioningDetails result={job.actions[action].result ?? job.actions[action].preview} />;
      case 'showcase':
        return <ShowcaseDetails result={job.actions[action].result ?? job.actions[action].preview} />;
      case 'gtm':
        return <GtmDetails result={job.actions[action].result ?? job.actions[action].preview} />;
      case 'emailing':
        return <></>;
      default:
        return <Empty />;
    }
  }

  getCloudWatchLink(job) {
    const env = process.env.REACT_APP_API_URL.includes('test') ? 'staging' : 'prod';
    const start = new dayjs(job.updatedAt).subtract(5, 'hour').valueOf();
    const end = new dayjs(job.updatedAt).add(5, 'hour').valueOf();
    return `https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#logsV2:log-groups/log-group/$252Faws$252Fecs$252Fautomator-v2-task-${env}/log-events$3FfilterPattern$3D${job._id}$26start$3D${start}$26end$3D${end}`;
  }
  getDatadogLink(job) {
    const env = process.env.REACT_APP_API_URL.includes('test') ? 'staging' : 'prod';
    const start = new dayjs(job.updatedAt).subtract(5, 'hour').valueOf();
    const end = new dayjs(job.updatedAt).add(5, 'hour').valueOf();
    return `https://app.datadoghq.eu/logs?query=service%3Aautomator-v2%20%40jobId%3A${job._id}%20env%3A${env}%20&agg_m=count&agg_m_source=base&agg_t=count&cols=host%2Cservice&fromUser=true&messageDisplay=inline&refresh_mode=paused&storage=hot&stream_sort=desc&viz=stream&from_ts=${start}&to_ts=${end}&live=false`;
  }
  render() {
    const { job, isFetching } = this.state;
    const allActions = Object.keys(AutomatorJobActions);
    const duration = getDisplayedDuration(job);

    if (isFetching) {
      return (
        <Card extra={<Button icon={<LoadingOutlined />} />}>
          <LoadingOutlined />
        </Card>
      );
    }

    function getTab(action) {
      if (job.actions?.[action]?.result?.error) {
        if (job.actions[action].result.error.translations) {
          return (
            <>
              <ExclamationCircleOutlined /> {action}
            </>
          );
        }
        return (
          <>
            <WarningOutlined /> {action}
          </>
        );
      }

      if (job.actions?.[action]?.approval?.approved) {
        return (
          <>
            <LikeOutlined /> {action}
          </>
        );
      }

      // don't use "!" because job.actions?.[action]?.approval?.approved can be undefined
      if (job.actions?.[action]?.approval?.approved === false) {
        return (
          <>
            <DislikeOutlined /> {action}
          </>
        );
      }

      if (job.actions?.[action]?.preview) {
        return (
          <>
            <QuestionCircleOutlined /> {action}
          </>
        );
      }

      if (!job.actions?.[action]?.result) {
        return action;
      }

      return (
        <>
          <CheckCircleOutlined /> {action}
        </>
      );
    }
    return (
      <Card title="Job detail" extra={<Button onClick={() => this.fetchData()} icon={<ReloadOutlined />} />}>
        <Tabs type="card" key={job._id}>
          <TabPane tab="job details" key="tab_details">
            {job.message?.error && this.renderError(job.message.error)}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="status">{job.status}</Descriptions.Item>
              <Descriptions.Item label="Custom ID">{job.params?.customId}</Descriptions.Item>
              <Descriptions.Item label="Domain">{job.params?.domain}</Descriptions.Item>
              <Descriptions.Item label="createdBy">{job.createdBy}</Descriptions.Item>
              <Descriptions.Item label="createdAt">{job.createdAt}</Descriptions.Item>
              <Descriptions.Item label="Links">
                <ButtonIcon type="default" htmlType="button">
                  <a target="_blank" href={this.getDatadogLink(job)} rel="noreferrer">
                    <img src="https://axeptio.imgix.net/2024/07/a35249c4-7a4f-4a42-8b3b-713315139d38.svg" alt={'datadog'} />
                  </a>
                </ButtonIcon>
                <ButtonIcon type="default" htmlType="button">
                  <a target="_blank" href={this.getCloudWatchLink(job)} rel="noreferrer">
                    <img src="https://axeptio.imgix.net/2024/07/ac58aaed-39f0-4ba6-aec1-6eeb88e1fb3f.png" alt={'cloudwatch'} />
                  </a>
                </ButtonIcon>
              </Descriptions.Item>
              {duration && <Descriptions.Item label="Duration">{duration}</Descriptions.Item>}
              <Descriptions.Item>
                <Button
                  type="default"
                  htmlType="button"
                  onClick={() => {
                    return copyText(
                      [
                        job._id,
                        job.status,
                        job.params?.domain,
                        job.params?.customId,
                        job.params?.priority,
                        job.createdAt,
                        job.createdBy
                      ].join('\t') //Google sheet do not support (,) but (/t), and this button is developper specialy for GSheet
                    );
                  }}
                >
                  Copy GSheet
                </Button>
              </Descriptions.Item>
            </Descriptions>
          </TabPane>
          {allActions.map(action => {
            return (
              <TabPane tab={getTab(action)} key={`tab_${action}`} disabled={typeof job.actions?.[action] === 'undefined'}>
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
