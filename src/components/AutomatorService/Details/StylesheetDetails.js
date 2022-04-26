import { Descriptions } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
const { Item } = Descriptions;

function Color({ value }) {
  return (
    <div style={{display: "inline-block", border: "1px solid #CCC", padding: "3px" }}>
      <div
        style={{
          height: "20px",
          width: "35px",
          background: `#${value}`,
        }}
      />
    </div>
  );
}

function StylesheetDetails({ result }) {
  return (
    <Descriptions bordered column={2}>
      <Item label="Font" span={2}>{result.font}</Item>
      <Item label="Is Dark Mode">
        {result.isDarkMode ? <CheckCircleOutlined /> : ""}
      </Item>
      <Item label="Is Monochrome">
        {result.isMonochrome ? <CheckCircleOutlined /> : ""}
      </Item>
      <Item label="Dark Color">
        <Color value={result.darkColor}/>
      </Item>
      <Item label="Light Color">
        <Color value={result.lightColor}/>
      </Item>
      <Item label="Theme Color">
        <Color value={result.themeColor}/>
      </Item>
    </Descriptions>
  );
}

export default StylesheetDetails;
