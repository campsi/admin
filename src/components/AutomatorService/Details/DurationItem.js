import dayjs from 'dayjs';
import { Descriptions } from 'antd';
const { Item } = Descriptions;

/**
 * @param {Object}  result  action result
 */
const DurationItem = ({ result, span }) => {
  console.log('result', result);
  return '';
  const duration = !result?.startedAt || !result?.endedAt ? '' : dayjs.duration(dayjs(result.endedAt).diff(result.startedAt));
  const displayedDuration =
    typeof duration === 'object'
      ? duration['$ms'] < 60000
        ? `${Math.round(duration.asSeconds())} seconds`
        : duration.humanize()
      : duration;
  console.log('duration', { duration, displayedDuration });
  return duration ? (
    <Item label="Duration" span={span}>
      {displayedDuration}
    </Item>
  ) : (
    ''
  );
};

export default DurationItem;
