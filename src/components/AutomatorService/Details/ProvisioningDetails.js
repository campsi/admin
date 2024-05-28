import { Descriptions, Input } from 'antd';
import { withAppContext } from '../../../App';
import { getDisplayedDuration } from '../automatorHelpers';
import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
const { TextArea } = Input;
const { Item } = Descriptions;

const getEmbedCode = ({ projectId, version, googleConsentModeV2 }) => {
  const lines = [
    `window.axeptioSettings = {`,
    `  clientId: "${projectId}",`,
    version ? `  cookiesVersion: "${version}",` : null,
    ...(googleConsentModeV2
      ? [
          '  googleConsentMode: {',
          '   default: {',
          '     analytics_storage: "denied",',
          '     ad_storage: "denied",',
          '     ad_user_data: "denied",',
          '     ad_personalization: "denied",',
          '     wait_for_update: 500,',
          '   }',
          ' }'
        ]
      : ['']),
    `};`,
    `(function(d, s) {`,
    `  var t = d.getElementsByTagName(s)[0], e = d.createElement(s);`,
    `  e.async = true; e.src = "//static.axept.io/sdk.js";`,
    `  t.parentNode.insertBefore(e, t);`,
    `})(document, "script");`
  ];
  return lines.filter(l => !!l).join('\n');
};

function ProvisioningDetails({ result, api }) {
  const duration = getDisplayedDuration(result);
  return (
    <Descriptions bordered column={2}>
      <Item label="ProjectId" span={2}>
        <a href={`https://admin.axeptio.eu/projects/${result.projectId}?access_token=${api.accessToken}`}>{result.projectId}</a>
      </Item>
      {result.cookies && (
        <Item label="Cookies ids" span={2}>
          {result.cookies?.join(', ')}
        </Item>
      )}
      {result.googleConsentModeV2 && (
        <Item label="Google Consent ModeV2" span={2}>
          <CheckCircleOutlined />
        </Item>
      )}
      {result.publishId && (
        <Item label="PublishId" span={2}>
          {result.publishId}
        </Item>
      )}
      {duration && (
        <Item label="Duration" span={2}>
          {duration}
        </Item>
      )}
      <Item label="Embed code">
        <TextArea
          style={{
            fontFamily: 'Menlo, Monaco, monospace',
            fontSize: 11,
            width: '100%'
          }}
          defaultValue={getEmbedCode(result)}
          rows={10}
        />
      </Item>
    </Descriptions>
  );
}

export default withAppContext(ProvisioningDetails);
