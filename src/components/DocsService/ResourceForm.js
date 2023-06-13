import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withAppContext } from '../../App';
import withParams from '../../utils/withParams';
import Form from '@rjsf/antd';
import { Button, Card, Descriptions, Empty, Layout, Modal, notification, Radio, Space, Table, Typography } from 'antd';
import { generateRelationField } from '../RelationField/RelationField';
import { cleanLocalizedValue } from '../LocalizedText/LocalizedText';
import { Navigate } from 'react-router-dom';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const { Title } = Typography;

class ResourceForm extends Component {
  state = {
    selectedState: undefined,
    users: [],
    doc: {},
  };

  formRef = React.createRef();

  usersColumns = [
    {
      title: "ID",
      dataIndex: "_id",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
  ];

  setStateAsync(state) {
    return new Promise((resolve) => this.setState(state, () => resolve()));
  }

  async componentDidMount() {
    if (this.props.params.id !== "new") {
      await this.fetchData();
    } else {
      this.setState({
        doc: {},
      });
    }
  }

  async fetchData() {
    const { api, service, params } = this.props;
    const { resourceName, id } = params;
    await this.setStateAsync({ isFetching: true });
    const response = await api.client.get(
      `${service.name}/${resourceName}/${id}`
    );
    this.setState({
      doc: response.data,
      isFetching: false,
    });
  }

  async fetchUsers() {
    const { api, service, params } = this.props;
    const { resourceName, id } = params;
    await this.setStateAsync({ isFetchingUsers: true });
    const response = await api.client.get(
      `${service.name}/${resourceName}/${id}/users`
    );
    this.setState({
      users: response.data.map((u) => {
        return { ...u, key: u._id };
      }),
    });
  }

  async deleteDocument() {
    const { api, service, params } = this.props;
    const { resourceName, id } = params;
    const response = await api.client.delete(
      `${service.name}/${resourceName}/${id}`
    );
    if (response.status === 200) {
      this.setState({
        redirectTo: `/services/${service.name}/resources/${resourceName}`,
      });
    }
  }

  updateDocument(newValue) {
    const { api, service, params } = this.props;
    const { doc } = this.state;
    const { resourceName } = params;

    return new Promise(async (resolve, reject) => {
      try {
        const method = doc.id ? "put" : "post";
        const url = doc.id
          ? `${service.name}/${resourceName}/${doc.id}`
          : `${service.name}/${resourceName}`;

        const response = await api.client[method](
          url,
          cleanLocalizedValue(newValue)
        );
        notification.success({ message: "Document saved" });
        this.setState(
          {
            doc: response.data,
            redirectTo: doc.id
              ? null // existing doc, no redirect
              : `/services/${service.name}/resources/${resourceName}/${response.data.id}`,
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
    const { service, params, customWidgets } = this.props;
    const { resourceName } = params;
    const resource = service.resources[resourceName];
    const result = {};
    const parseSchema = (schema, uiSchema) => {
      if (customWidgets[schema["ui:field"]]) {
        uiSchema["ui:field"] = customWidgets[schema["ui:field"]];
      } else if (customWidgets[schema["ui:widget"]]) {
        uiSchema["ui:widget"] = customWidgets[schema["ui:widget"]];
      } else if (schema["ui:relation"]) {
        uiSchema["ui:field"] = generateRelationField({
          ...schema["ui:relation"],
          perPage: 0,
        });
      } else if (schema.items) {
        uiSchema.items = {};
        parseSchema(schema.items, uiSchema.items);
      } else if (schema.properties) {
        Object.entries(schema.properties).forEach(
          ([propertyName, propertySchema]) => {
            uiSchema[propertyName] = propertySchema.virtual
              ? { "ui:readonly": true }
              : {};
            parseSchema(
              schema.properties[propertyName],
              uiSchema[propertyName]
            );
          }
        );
      }
      if (schema["classNames"]) {
        uiSchema["classNames"] = schema["classNames"];
      }
    };
    parseSchema(resource.schema, result);
    result["ui:submitButtonOptions"] = {
      norender: true,
    };
    return result;
  }

  render() {
    const { service, params } = this.props;
    const { resourceName } = params;
    const resource = service.resources[resourceName];
    const resourceClass = service.classes[resource.class];

    const {
      doc,
      selectedState = resourceClass.defaultState,
      users,
      redirectTo,
    } = this.state;

    if (!doc) {
      return <Empty description="No document" />;
    }

    return (
      <Layout style={{ padding: 30 }}>
        {redirectTo && window.location.pathname !== redirectTo && (
          <Navigate to={redirectTo} replace />
        )}
        <Title>Resource form</Title>
        <Space direction="vertical">
          <Card title="Document details">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Title" span={2}>
                {resource.schema.title}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {resource.schema.description}
              </Descriptions.Item>
              <Descriptions.Item label="Resource Path">
                {resourceName}
              </Descriptions.Item>
              <Descriptions.Item label="Resource Class">
                {resource.class}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(doc.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {`${doc.createdBy}`}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card
            title="Document data"
            extra={
              <Radio.Group
                value={selectedState}
                onChange={(event) => {
                  this.setState({ selectedState: event.target.value });
                }}
              >
                {Object.keys(resourceClass.states).map((state) => {
                  return (
                    <Radio.Button key={state} value={state}>
                      {state}
                    </Radio.Button>
                  );
                })}
              </Radio.Group>
            }
            actions={getActions.bind(this)(service, resourceName)}
          >
            <Form
              className="rjsf ant-form-vertical"
              schema={resource.schema}
              formData={doc.data}
              formContext={{
                id: doc.id,
                createdAt: doc.createdAt,
                createdBy: doc.createdBy,
              }}
              uiSchema={this.getUISchema()}
              ref={(ref) => {
                this.formRef = ref;
              }}
              liveValidate
              onSubmit={({ formData }) => this.updateDocument(formData)}
            />
          </Card>
          <Card
            title="Users"
            actions={[<Button onClick={() => this.fetchUsers()}>Fetch</Button>]}
          >
            <Table dataSource={users} columns={this.usersColumns} />
          </Card>
        </Space>
      </Layout>
    );
  }
}

ResourceForm.propTypes = {
  service: PropTypes.shape({
    name: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired,
  }).isRequired,
  customWidgets: PropTypes.objectOf(PropTypes.element),
  ...withParams.propTypes,
  ...withAppContext.propTypes,
};

ResourceForm.defaultProps = {
  customWidgets: {},
};

function getActions(service, resourceName) {
  return [
    <Button
      danger
      onClick={() => {
        confirm({
          title: "Do you Want to delete this document?",
          icon: <ExclamationCircleOutlined />,
          content: "The operation is definitive and irreversible",
          onOk: async () => {
            await this.deleteDocument();
          },
        });
      }}
    >
      Delete Document
    </Button>,
    <Button onClick={() => this.fetchData()}>Reload Document</Button>,
    <Button
      type={"primary"}
      onClick={() => {
        // @link https://github.com/rjsf-team/react-jsonschema-form/issues/2104
        this.formRef.formElement.dispatchEvent(
          new CustomEvent("submit", {
            cancelable: true,
            bubbles: true,
          })
        );
      }}
    >
      Submit
    </Button>,
    ...(service.resources[resourceName].schema["ui:approvalDoc"] ? [
      <Button danger onClick={async () => {
        const { api, service, params } = this.props;
        const { resourceName, id } = params;
        await this.setStateAsync({ isFetching: true });
        await api.client.post(
          `${service.name}/${resourceName}/${id}/disapprove`,
          {
            resource: {...this.state.doc.data, _id: this.state.doc.id},
          }
        );
        this.setState({
          doc: {},
          isFetching: false,
        });
      }}>
        Disapprove
      </Button>, <Button
        danger
        style={{ borderColor: "green", color: "green" }}
        onClick={async () => {
          const { api, service, params } = this.props;
          const { resourceName, id } = params;
          await this.setStateAsync({ isFetching: true });
          await api.client.post(
            `${service.name}/${resourceName}/${id}/approve`,
            {
              resource: {...this.state.doc.data, _id: this.state.doc.id},
            }
          );
          this.setState({
            doc: {},
            isFetching: false,
          });
        }}
      >
        Approve
      </Button>] : [])
  ];
}

export default withAppContext(withParams(ResourceForm));
