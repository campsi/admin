import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
dayjs.extend(relativeTime);

export function getDisplayedDuration(result) {
  const duration = !result?.startedAt || !result?.endedAt ? '' : dayjs.duration(dayjs(result.endedAt).diff(result.startedAt));
  console.log('duration', { result, duration });
  return typeof duration === 'object'
    ? duration['$ms'] < 60000
      ? `${Math.round(duration.asSeconds())} seconds`
      : duration.humanize()
    : duration;
}
