import { Descriptions } from "antd";
const { Item } = Descriptions;

function ProvisioningDetails({ result }) {
  return (
    <Descriptions bordered column={2}>
      <Item label="ProjectId" span={2}>
        {result.projectId}
      </Item>
      <Item label="ProjectId" span={2}>
        {result.publishId}
      </Item>
    </Descriptions>
  );
}

export default ProvisioningDetails;
