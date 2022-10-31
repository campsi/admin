import { Button, Descriptions } from "antd";
import { withAppContext } from "../../../App";
import { VerticalAlignBottomOutlined } from "@ant-design/icons";

const { Item } = Descriptions;

function GtmDetails(gtmAction) {
  return (
    <Descriptions bordered column={1}>
      <Item label="GTM container">
        <a href={gtmAction.result} download>
          <Button icon={<VerticalAlignBottomOutlined />} />
        </a>
      </Item>
    </Descriptions>
  );
}

export default withAppContext(GtmDetails);
