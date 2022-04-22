import { withAppContext } from "../../App";
import { Component } from "react";
import { Select } from "antd";
/**
 *
 * @param {object} properties
 * @param {string} properties.resource
 * @param {string} properties.service
 * @returns {function(*)}
 */
function generateRelationField(properties) {
  const { resource, service, labelIndex = 'name' } = properties;

  class RelationField extends Component {
    state = {
      items: [],
      perPage: 100,
      page: 1,
      totalCount: 0,
    };

    async componentDidMount() {
      await this.fetchData()
    }

    async fetchData() {
      const { api } = this.props;
      const { perPage, page, totalCount } = this.state;
      const response = await api.client.get(
        `${service}/${resource}?perPage=${perPage}&page=${page}&totalCount=${totalCount}`
      );
      this.setState({
        items: response.data,
        totalCount: response.headers["X-Total-Count"],
      });
    }

    render() {
      return (
        <div>
          <Select
            value={this.props.formData}
            options={this.state.items.map((doc) => {
              return {
                key: doc.id,
                value: doc.id,
                label: doc.data[labelIndex],
              };
            })}
          />
        </div>
      );
    }
  }

  return withAppContext(RelationField);
}

export { generateRelationField };
