import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withAppContext } from '../../App';
import withParams from '../../utils/withParams';
import Form from '@rjsf/antd';
import { Button, Card, Descriptions, Layout, notification, Space, Typography, Modal } from 'antd';
import { generateRelationField } from '../RelationField/RelationField';
import { cleanLocalizedValue } from '../LocalizedText/LocalizedText';
import { Navigate } from 'react-router-dom';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const { Title } = Typography;
class NotificationForm extends Component {
  state = {
    mode: 'edit'
  };

  formRef = React.createRef();

  setStateAsync(state) {
    return new Promise(resolve => this.setState(state, () => resolve()));
  }

  async componentDidMount() {
    if (this.props.params.id !== 'new') {
      await this.fetchData();
    } else {
      this.setState({
        mode: 'create',
        notification: {}
      });
    }
  }

  async fetchData() {
    const { api, service, params } = this.props;
    const { id } = params;
    await this.setStateAsync({ isFetching: true });
    const response = await api.client.get(`${service.name}/notifications/${id}`);
    this.setState({
      notification: response.data.notification,
      isFetching: false
    });
  }

  async deleteDocument() {
    const { api, service, params } = this.props;
    const { id } = params;
    const response = await api.client.delete(`${service.name}/notifications/${id}`);
    if (response.status === 200) {
      this.setState({
        redirectTo: `/services/${service.name}`
      });
    }
  }

  updateDocument(newValue) {
    const { api, service, params } = this.props;
    const { mode } = this.state;
    const { id } = params;

    return new Promise(async (resolve, reject) => {
      try {
        const method = mode === 'create' ? 'post' : 'put';
        const url = mode === 'create' ? `${service.name}/notifications/` : `${service.name}/notifications/${id}`;

        const response = await api.client[method](url, cleanLocalizedValue(newValue));
        notification.success({ message: 'Document saved' });
        if (mode === 'create') {
          return (window.location.href = `/services/${service.name}/${response.data.notification._id}`);
        }

        this.setStateAsync(
          {
            notification: response.data.notification
          },
          resolve
        );
      } catch (error) {
        notification.error({ message: error.message });
        reject(error);
      }
    });
  }

  getUISchema() {
    const { service, customWidgets } = this.props;
    const resource = service.resources.notifications;
    const result = {};
    const parseSchema = (schema, uiSchema) => {
      if (customWidgets[schema['ui:field']]) {
        uiSchema['ui:field'] = customWidgets[schema['ui:field']];
      } else if (customWidgets[schema['ui:widget']]) {
        uiSchema['ui:widget'] = customWidgets[schema['ui:widget']];
      } else if (schema['ui:relation']) {
        uiSchema['ui:field'] = generateRelationField(schema['ui:relation']);
      } else if (schema.items) {
        uiSchema.items = {};
        parseSchema(schema.items, uiSchema.items);
      } else if (schema.properties) {
        Object.keys(schema.properties).forEach(propertyName => {
          uiSchema[propertyName] = {};
          parseSchema(schema.properties[propertyName], uiSchema[propertyName]);
        });
      }
    };
    parseSchema(resource.schema, result);
    result['ui:submitButtonOptions'] = {
      norender: true
    };

    return result;
  }

  render() {
    const { service } = this.props;
    const resource = service.resources.notifications;

    const { notification, redirectTo } = this.state;

    if (redirectTo) {
      return <Navigate to={redirectTo} />;
    }

    if (!notification) {
      return null;
    }

    return (
      <Layout style={{ padding: 30 }}>
        <Title>Notification form</Title>
        <Space direction="vertical">
          <Card title="Document details">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Title" span={2}>
                {resource.schema.title}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {resource.schema.description}
              </Descriptions.Item>
              <Descriptions.Item label="Resource Path">{'notifications'}</Descriptions.Item>
              <Descriptions.Item label="Resource Class">{'--'}</Descriptions.Item>
              <Descriptions.Item label="Created At">{new Date(notification.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Created By">{notification.createdBy || '--'}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card
            title="Document data"
            actions={[
              <Button
                danger
                onClick={() => {
                  confirm({
                    title: 'Do you Want to delete this document?',
                    icon: <ExclamationCircleOutlined />,
                    content: 'The operation is definitive and irreversible',
                    onOk: async () => {
                      try {
                        await this.deleteDocument();
                      } catch (error) {
                        notification.error({ message: error.message });
                      }
                    }
                  });
                }}
              >
                Delete Document
              </Button>,
              <Button
                type={'primary'}
                onClick={() => {
                  // @link https://github.com/rjsf-team/react-jsonschema-form/issues/2104
                  this.formRef.formElement.dispatchEvent(
                    new CustomEvent('submit', {
                      cancelable: true,
                      bubbles: true
                    })
                  );
                }}
              >
                Submit
              </Button>
            ]}
          >
            <Form
              className="rjsf ant-form-vertical"
              schema={resource.schema}
              formData={notification.data}
              formContext={{
                id: notification._id,
                createdAt: notification.createdAt,
                createdBy: notification.createdBy
              }}
              uiSchema={this.getUISchema()}
              ref={ref => {
                this.formRef = ref;
              }}
              liveValidate
              onSubmit={({ formData }) => this.updateDocument(formData)}
            />
          </Card>
        </Space>
      </Layout>
    );
  }
}

NotificationForm.propTypes = {
  service: PropTypes.shape({
    name: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired
  }).isRequired
};

NotificationForm.defaultProps = {
  customWidgets: {}
};

export default withAppContext(withParams(NotificationForm));
