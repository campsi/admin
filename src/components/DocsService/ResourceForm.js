import { Component } from "react";
import { withAppContext } from "../../App";
import withParams from "../../utils/withParams";
import Form from "@rjsf/core";

class ResourceForm extends Component {
  state = {
    fetching: {
      users: false,
      data: false,
    },
    data: {},
  };

  componentDidMount() {
    this.fetchData();
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
      <div>
        <h1>Resource form</h1>

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
          {Object.keys(resourceClass.states).map((state) => {
            return (
              <button key={state}>
                {state} {state === selectedState ? "*" : ""}
              </button>
            );
          })}
        </div>
        <div>
          <Form schema={resource.schema} formData={doc.data} />
        </div>
      </div>
    );
  }
}

export default withAppContext(withParams(ResourceForm));
