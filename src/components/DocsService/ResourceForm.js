import { Component } from "react";
import { withAppContext } from "../../App";
import withParams from "../../utils/withParams";
import Form from "@rjsf/antd";
import {
  Button,
  Card,
  Descriptions,
  Layout,
  Radio,
  Space,
  Table,
  Typography,
} from "antd";
import LocalizedText from "../LocalizedText/LocalizedText";
import MatchString from "../MatchString/MatchString";
const { Title } = Typography;
class ResourceForm extends Component {
  state = {
    selectedState: undefined,
    users: [],
    mode: "edit",
  };

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

  componentDidMount() {
    if (this.props.params.id !== "new") {
      this.fetchData();
    } else {
      this.setState({
        mode: "create",
        doc: {},
      });
    }
  }

  async fetchData() {
    const { api, service, params } = this.props;
    const { resourceName, id } = params;
    const response = await api.client.get(
      `${service.name}/${resourceName}/${id}`
    );
    this.setState({
      doc: response.data,
    });
  }

  async fetchUsers() {
    const { api, service, params } = this.props;
    const { resourceName, id } = params;
    const response = await api.client.get(
      `${service.name}/${resourceName}/${id}/users`
    );
    this.setState({
      users: response.data.map((u) => {
        return { ...u, key: u._id };
      }),
    });
  }

  async patchItem(patch) {}

  async deleteItem() {}

  async updateItem(newValue) {}

  getUISchema() {
    const { service, params } = this.props;
    const { resourceName } = params;
    const resource = service.resources[resourceName];
    const result = {};
    const parseSchema = (schema, uiSchema) => {
      if (schema.isLocalizedString) {
        uiSchema["ui:field"] = LocalizedText;
      } else if (schema.isMatchString) {
        uiSchema["ui:field"] = MatchString;
      } else if (schema.properties) {
        Object.keys(schema.properties).forEach((propertyName) => {
          uiSchema[propertyName] = {};
          parseSchema(schema.properties[propertyName], uiSchema[propertyName]);
        });
      }
    };
    parseSchema(resource.schema, result);
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
    } = this.state;

    if (!doc) {
      return null;
    }

    return (
      <Layout style={{ padding: 30 }}>
        <Title>Resource form</Title>
        <Space direction="vertical">
          <Card title="Document details">
            <Descriptions bordered>
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
                {doc.createdBy}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="Document data">
            <Radio.Group
              value={selectedState}
              onChange={(event) => {
                this.setState({ selectedState: event.target.value });
              }}
              style={{ marginBottom: 16 }}
            >
              {Object.keys(resourceClass.states).map((state) => {
                return (
                  <Radio.Button key={state} value={state}>
                    {state}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
            <Form
              className="rjsf ant-form-vertical"
              schema={resource.schema}
              formData={doc.data}
              uiSchema={this.getUISchema()}
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

export default withAppContext(withParams(ResourceForm));
