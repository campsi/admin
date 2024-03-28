import { Descriptions } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getDisplayedDuration } from '../automatorHelpers';
import React from 'react';
const { Item } = Descriptions;

function Color({ value }) {
  return (
    <div
      style={{
        display: 'inline-block',
        border: '1px solid #CCC',
        padding: '3px',
        marginBottom: '-7px'
      }}
    >
      <div
        style={{
          height: '20px',
          width: '35px',
          background: `#${value}`
        }}
      />
    </div>
  );
}

function StylesheetDetails({ result }) {
  const duration = getDisplayedDuration(result);
  return (
    <Descriptions bordered column={3} size="small">
      <Item label="Font" span={3}>
        {result.font}
      </Item>
      <Item label="Is Dark Mode">{result.isDarkMode ? <CheckCircleOutlined /> : <CloseCircleOutlined />}</Item>
      <Item label="Is Monochrome" span={2}>
        {result.isMonochrome ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
      </Item>
      <Item label="Dark Color">
        <Color value={result.darkColor} />
      </Item>
      <Item label="Light Color">
        <Color value={result.lightColor} />
      </Item>
      <Item label="Theme Color">
        <Color value={result.themeColor} />
      </Item>
      {duration ? <Item label="Duration">{duration}</Item> : ''}
    </Descriptions>
  );
}

export default StylesheetDetails;
