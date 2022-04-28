import { Descriptions, Input } from "antd";
const { TextArea } = Input;
const { Item } = Descriptions;

const getEmbedCode = ({ projectId, version }) => {
  const lines = [
    `window.axeptioSettings = {`,
    `  clientId: "${projectId}"`,
    version ? `  cookiesVersion: "${version}"` : null,
    `};`,
    `(function(d, s) {`,
    `  var t = d.getElementsByTagName(s)[0], e = d.createElement(s);`,
    `  e.async = true; e.src = "//static.axept.io/sdk.js";`,
    `  t.parentNode.insertBefore(e, t);`,
    `})(document, "script");`,
  ];
  return lines.filter((l) => !!l).join("\n");
};

function ProvisioningDetails({ result }) {
  return (
    <Descriptions bordered column={2}>
      <Item label="ProjectId" span={2}>
        <a href={`https://admin.axeptio.eu/projects/${result.projectId}`}>
          {result.projectId}
        </a>
      </Item>
      <Item label="PublishId" span={2}>
        {result.publishId}
      </Item>
      <Item label="Embed code">
        <TextArea
          style={{
            fontFamily: "Menlo, Monaco, monospace",
            fontSize: 11,
            width: "100%",
          }}
          defaultValue={getEmbedCode(result)}
          rows={10}
        />
      </Item>
    </Descriptions>
  );
}

export default ProvisioningDetails;
