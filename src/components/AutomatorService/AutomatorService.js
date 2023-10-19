import { Component } from 'react';
import { Typography, Layout, Table, Tag, Card, Space, Button, Modal, Form, Input, Tooltip } from 'antd';
import { withAppContext } from '../../App';
import PropTypes from 'prop-types';
import { Link, Route, Routes } from 'react-router-dom';
import AutomatorJob from './AutomatorJob';
import { DeleteOutlined, EyeOutlined, LoadingOutlined, ReloadOutlined, UndoOutlined } from '@ant-design/icons';
import AutomatorJobForm from './AutomatorJobForm';
import actions from './AutomatorJobActions';
import BulkJobCreationForm from './BulkJobCreationForm';
import { debounce } from '../../utils/debounce';
const { Title } = Typography;

function BulkJobCreationModal({ api, services, ...props }) {
  const [form] = Form.useForm();

  return (
    <Modal width={800} {...props} okText="Submit" cancelText="Leave" onOk={() => form.submit()} title="Create Jobs in bulk">
      <BulkJobCreationForm api={api} services={services} form={form} />
    </Modal>
  );
}

/**
 * Nota: this is an Axeptio only service. It will need to be moved
 * to an Axeptio/Admin repo once we're ready to publish the campsi/admin
 * as a standalone npm package
 */
class AutomatorService extends Component {
  constructor(props) {
    super(props);
    this.fetchData = this.fetchData.bind(this);
  }
  state = {
    bulkJobCreationModalOpen: false,
    activeActions: [],
    jobs: [],
    isFetching: false,
    columns: [
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        render: value => <span title={new Date(value).toTimeString()}>{new Date(value).toDateString()}</span>
      },
      {
        title: 'Status',
        render: job => {
          return (
            <div>
              <Tag
                color={job.status === 'Error' ? 'red' : job.status === 'Done' ? 'green' : job.status === 'Active' ? 'blue' : ''}
              >
                {job.status}
              </Tag>
              {job.params?.origin === 'caas-styleguide' && (
                <img
                  src={
                    'https://axeptio.imgix.net/2023/03/de7c1b1f-2f01-45d8-b272-d95ec95a186f.png?auto=format&fit=crop&w=35&h=auto&dpr=1'
                  }
                  alt={''}
                />
              )}
            </div>
          );
        }
      },
      {
        title: () => {
          return (
            <Input
              placeholder={`Search domain`}
              onChange={debounce(async e => {
                await this.setState({ domainFilter: e.target.value });
                this.fetchData();
              }, 800)}
            />
          );
        },
        dataIndex: ['params', 'domain']
      },
      {
        title: 'Actions',
        dataIndex: 'actions',
        render: value => {
          const actionNames = Object.keys(actions);
          return (
            <div>
              {actionNames.map(action => {
                if (!value || !value[action]) {
                  return null;
                }
                let color = 'default';

                if (value[action].result?.error) {
                  color = 'red';
                } else if (value[action].result) {
                  color = 'green';
                } else if (value[action].preview) {
                  // value[action].approval.approved can be undefine
                  if (value[action].approval?.approved === false) {
                    color = 'lightgrey';
                  } else if (!value[action].approval?.approved) {
                    color = 'blue';
                  }
                }
                return (
                  <Tag color={color} key={action}>
                    {action}
                  </Tag>
                );
              })}
            </div>
          );
        }
      },
      {
        title: '',
        render: job => (
          <Space>
            {this.state.jobsDeleting.includes(job._id) ? (
              <Button disabled icon={<LoadingOutlined />} />
            ) : (
              <Button danger title={'delete the job'} icon={<DeleteOutlined />} onClick={() => this.deleteJob(job._id)} />
            )}
            {job.status === 'Done' || job.status === 'Error' ? (
              this.state.jobsToRestart.includes(job._id) ? (
                <Button disabled icon={<LoadingOutlined />} />
              ) : (
                <Tooltip placement="bottom" title={'Restart the job'}>
                  <Button icon={<UndoOutlined />} onClick={() => this.restartJob(job)} />
                </Tooltip>
              )
            ) : (
              ''
            )}
            <Link to={`/services/${this.props.service.name}/jobs/${job._id}`}>
              <Tooltip placement="bottom" title={'View the job'}>
                <Button icon={<EyeOutlined />} />
              </Tooltip>
            </Link>
          </Space>
        )
      }
    ],
    sort: '-_id',
    perPage: 5,
    page: 1,
    domainFilter: '',
    totalCount: 0,
    jobsDeleting: [],
    jobsToRestart: [],
    pollingStart: null,
    pollingInterval: 10000,
    pollingDuration: 500000
  };

  setStateAsync(state) {
    return new Promise(resolve => {
      this.setState(state, () => resolve());
    });
  }

  async startJob(job) {
    const { api, service } = this.props;
    await api.client.post(`/${service.name}/jobs`, formatJobValues(job, this.props.api.clientEmail));
    await this.fetchData();
  }

  async deleteJob(id) {
    const { api, service } = this.props;
    if (this.state.jobsDeleting.includes(id)) {
      return;
    }
    await this.setStateAsync({
      jobsDeleting: [...this.state.jobsDeleting, id]
    });
    await api.client.delete(`/${service.name}/jobs/${id}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.setStateAsync({
      jobsDeleting: this.state.jobsDeleting.filter(jobId => jobId !== id),
      jobs: this.state.jobs.filter(job => job._id !== id)
    });
    if (this.state.jobsDeleting.length === 0) {
      await this.fetchData();
    }
  }

  async restartJob(jobToRestart) {
    const { api, service } = this.props;
    if (this.state.jobsToRestart.includes(jobToRestart._id)) {
      return;
    }
    await this.setStateAsync({
      jobsToRestart: [...this.state.jobsToRestart, jobToRestart._id]
    });
    await api.client.put(`/${service.name}/jobs/${jobToRestart._id}?push=true`, formatJobValues(jobToRestart, api.clientEmail));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.setStateAsync({
      jobsToRestart: this.state.jobsToRestart.filter(jobId => jobId !== jobToRestart._id)
    });
    if (this.state.jobsToRestart.length === 0) {
      await this.fetchData();
    }
  }

  async componentDidMount() {
    if (this.props.authenticated) {
      await this.fetchData();
    }
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.page !== prevState.page || this.state.perPage !== prevState.perPage) {
      await this.fetchData();
    }
  }

  async fetchData() {
    const { service, api } = this.props;
    const { perPage, page, sort } = this.state;
    await this.setStateAsync({ isFetching: true });
    const response = await api.client.get(
      `${service.name}/jobs?perPage=${perPage}&page=${page}&sort=${sort}${
        this.state.domainFilter ? '&domain=' + this.state.domainFilter : ''
      }`,
      { timeout: 20000 }
    );
    await this.setStateAsync({
      jobs: response.data.map(j => {
        return { ...j, key: j._id };
      }),
      totalCount: response.headers['x-total-count'],
      isFetching: false
    });
  }

  async startPolling() {
    await this.setStateAsync({ pollingStart: new Date() });
    await this.pollData();
  }

  async stopPolling() {
    this.setState({ pollingStart: null });
  }

  async pollData() {
    const { pollingInterval, pollingDuration, pollingStart } = this.state;

    // No need to continue if polling has been cancelled
    if (null === pollingStart) {
      return;
    }

    await this.fetchData();
    await new Promise(resolve => setTimeout(resolve, pollingInterval));
    if (new Date() - pollingStart < pollingDuration) {
      await this.pollData();
    } else {
      this.setState({ pollingStart: null });
    }
  }

  render() {
    const { services, service, api } = this.props;
    const { jobs, columns, pollingStart, isFetching, jobsDeleting, bulkJobCreationModalOpen } = this.state;

    return (
      <Layout.Content style={{ padding: 30, width: '100%' }}>
        <Title>Automator Service</Title>
        <Button
          type="primary"
          style={{ 'box-shadow': '0 0 8px #a4abb6' }}
          onClick={() => this.setState({ bulkJobCreationModalOpen: true })}
        >
          Bulk creation
        </Button>
        <BulkJobCreationModal
          visible={bulkJobCreationModalOpen}
          api={api}
          services={services}
          onCancel={() => {
            this.setState({ bulkJobCreationModalOpen: false });
          }}
        />
        <Space direction="vertical" style={{ width: '100%' }}>
          <Routes>
            <Route
              path={`jobs/:id`}
              element={
                <AutomatorJob
                  onFetching={() => {
                    this.fetchData();
                  }}
                  service={service}
                />
              }
            />
          </Routes>
          <Card
            title="Jobs"
            extra={
              <>
                <Button style={{ margin: '10px' }} onClick={() => this.fetchData()}>
                  {isFetching ? <LoadingOutlined /> : <ReloadOutlined />}
                </Button>
                <Button onClick={() => this.startPolling()}>{pollingStart ? 'Stop polling' : 'Start polling'}</Button>
              </>
            }
          >
            <Table
              dataSource={jobs.map(j => {
                return { ...j, isBeingDeleted: jobsDeleting.includes(j._id) };
              })}
              rowClassName={value => (value.isBeingDeleted ? 'fade' : '')}
              columns={columns}
              pagination={{
                pageSize: this.state.perPage,
                current: this.state.page,
                total: this.state.totalCount,
                pageSizeOptions: [25, 50, 100, 200],
                onChange: (page, pageSize) => {
                  this.setState({
                    perPage: pageSize,
                    page
                  });
                }
              }}
            />
          </Card>
          <AutomatorJobForm onFinish={job => this.startJob(job)} api={this.props.api} />
        </Space>
      </Layout.Content>
    );
  }
}

AutomatorService.propTypes = {
  ...withAppContext.propTypes,
  service: PropTypes.shape({
    name: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired
  }).isRequired
};

export function formatJobValues(job, email) {
  let updatedValues = {
    status: 'Pending',
    params: job.params,
    actions: {},
    projectId: job.projectId
  };
  if (!new RegExp('^[a-f\\d]{24}$').test(updatedValues.projectId)) {
    delete updatedValues.projectId;
  }
  for (const [actionName, value] of Object.entries(job.actions)) {
    if (value.active) {
      updatedValues.actions[actionName] = value;
      if (value.approval?.email) {
        updatedValues.actions[actionName].approval.email = email;
      } else {
        delete updatedValues.actions[actionName].approval;
      }
    }
    if (updatedValues.actions[actionName]?.result) {
      delete updatedValues.actions[actionName].result;
    }
  }
  return updatedValues;
}

export default withAppContext(AutomatorService);
