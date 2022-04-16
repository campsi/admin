import { Component } from "react";
import { withAppContext } from "../../App";
import withParams from "../../utils/withParams";
import {Link} from "react-router-dom";


class ResourceListing extends Component {
  state = {
    perPage: 100,
    page: 1,
    items: [],
    totalCount: 0,
    lastPage: 1
  };
  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevProps.params !== this.props.params){
      this.fetchData();
    }
  }

  async fetchData() {
    const {api, service} = this.props;
    const {resourceName} = this.props.params;
    const {perPage, page} = this.state;
    const response = await api.client.get(
      `/${service.name}/${resourceName}?perPage=${perPage}&page=${page}`
    );
    this.setState({
      items: response.data,
      isFetching: false,
      lastPage: Number(response.headers["x-last-page"]),
      totalCount: Number(response.headers["x-total-count"]),
    });
  }

  render() {
    const { service } = this.props;
    const {resourceName} = this.props.params;
    const resource = service.resources[resourceName];
    const properties = Object.keys(resource.schema.properties || {}).map(
      (prop) => {
        return { name: prop, ...resource.schema.properties[prop] };
      }
    );
    return (
      <div>
        Resource listing{" "}
        <code>
          /{service.name}/{resourceName}
        </code>
        <div>
          Found {this.state.totalCount} elements
        </div>
        <table>
          <thead>
            <tr>
              <th/>
              <th>ID</th>
              <th>Created At</th>
              <th>Created By</th>
              {properties.map((property) => {
                return (
                  <th key={`th-${property.name}`}>
                    {property.label || property.name} <br /> {property.type}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {this.state.items.map((item) => (
              <tr key={item.id}>
                <td><input type="checkbox"/></td>
                <td title={item.id}>
                  <Link to={`/services/${service.name}/resources/${resourceName}/${item.id}`} key={item.id}>
                  {item.id.substring(20)}
                  </Link>
                </td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>{item.createdBy}</td>
                {properties.map((property) => {
                  const value = item.data[property.name];
                  return (
                    <td key={`${item.id}.${property.name}`}>{String(value)}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
export default withAppContext(withParams(ResourceListing));
