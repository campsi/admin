import { Button, Descriptions } from 'antd';
import { withAppContext } from '../../../App';
import { VerticalAlignBottomOutlined } from '@ant-design/icons';

const { Item } = Descriptions;

function downloadGtmJson(container) {
  downloadFile(JSON.stringify(container), 'GTMContainer.json', 'application/json');
}

function downloadFile(content, fileName, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}


function GtmDetails(result) {
  return (
    <Descriptions bordered column={1}>
      <Item label='GTM container'>
        <Button
          icon={<VerticalAlignBottomOutlined />}
          onClick={() => downloadGtmJson(result)}
        />
      </Item>
    </Descriptions>
  );
}


export default withAppContext(GtmDetails);