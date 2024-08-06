import { Button, Descriptions } from 'antd';
import { withAppContext } from '../../../App';
import { VerticalAlignBottomOutlined } from '@ant-design/icons';

const { Item } = Descriptions;

function PDFdetails(PDFAction) {
  let body;
  if (PDFAction.result.pdfURL) {
    body = (
      <Item label="PDF">
        <a href={PDFAction.result.pdfURL} target={'_blank'} download rel="noreferrer">
          <Button icon={<VerticalAlignBottomOutlined />} />
        </a>
      </Item>
    );
  } else if (PDFAction.result.pdfURLs) {
    body = Object.entries(PDFAction.result.pdfURLs).map(([key, value]) => (
      <Item key={key} label={key}>
        <a href={value} target={'_blank'} download rel="noreferrer">
          <Button icon={<VerticalAlignBottomOutlined />} />
        </a>
      </Item>
    ));
  }
  return (
    <Descriptions bordered column={1}>
      {body}
    </Descriptions>
  );
}

export default withAppContext(PDFdetails);
