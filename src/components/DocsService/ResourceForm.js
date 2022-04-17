import { Component } from "react";
import { withAppContext } from "../../App";
import withParams from "../../utils/withParams";
import Form from "@rjsf/antd";
import { Layout, Radio, Typography } from "antd";
const { Title } = Typography;
class ResourceForm extends Component {
  state = {
    selectedState: undefined,
    mode: "edit",
  };

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

  async patchItem(patch) {}

  async deleteItem() {}

  async updateItem(newValue) {}

  render() {
    const { service, params } = this.props;
    const { resourceName } = params;
    const resource = service.resources[resourceName];
    const resourceClass = service.classes[resource.class];

    const { doc, selectedState = resourceClass.defaultState } = this.state;

    if (!doc) {
      return null;
    }

    return (
      <Layout style={{ padding: 30 }}>
        <Title>Resource form</Title>

        <table>
          <tbody>
            <tr>
              <th>Resource</th>
              <td>{resourceName}</td>
            </tr>
            <tr>
              <th>Created At</th>
              <td>{new Date(doc.createdAt).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Created By</th>
              <td>{doc.createdBy}</td>
            </tr>
          </tbody>
        </table>
        <div>
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
        </div>
        <div className="site-layout-background main-page-content">
          <Form schema={resource.schema} formData={doc.data} />
        </div>
      </Layout>
    );
  }
}

export default withAppContext(withParams(ResourceForm));
