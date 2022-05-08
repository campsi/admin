import { Component } from "react";
import { Button, Descriptions } from "antd";
import { withAppContext } from "../../App";
const { Item } = Descriptions;

class ClearbitSync extends Component {
  async sync() {
    const { api, formContext } = this.props;
    const response = await api.client.post(
      `/vendors/companies/${formContext.id}/enrichment`
    );
    console.info(response.data);
  }
  render() {
    const { formData } = this.props;
    return (
      <Descriptions>
        <Item label="Synced at">{formData.syncedAt}</Item>
        <Item>
          <Button onClick={() => this.sync()}>Sync now</Button>
        </Item>
      </Descriptions>
    );
  }
}

export default withAppContext(ClearbitSync);
