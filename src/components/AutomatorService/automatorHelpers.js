import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export function getDisplayedDuration(result) {
  const duration = !result?.startedAt || !result?.endedAt ? '' : dayjs.duration(dayjs(result.endedAt).diff(result.startedAt));
  return typeof duration === 'object'
    ? duration['$ms'] < 60000
      ? `${Math.round(duration.asSeconds())} seconds`
      : duration.humanize()
    : duration;
}

export function convertJobsToCSVString(jsonData) {
  const headers = [
    'Status',
    'Domain',
    'CMP Found',
    'Vendors',
    'Vendors Well Configured',
    'Vendors Bad Configured',
    'pdfurlEN',
    'pdfurlFR',
    'Vendors Triggered Without Consent',
    'Vendors Consentement Not Required',
    'Media 1',
    'Media 2'
  ];

  const rows = jsonData.map(item => [
    item.status,
    item.params?.domain,
    item.actions?.scanner?.result?.CMP,
    item.actions?.scanner?.result?.nbVendorsFound,
    item.actions?.scanner?.result?.vendorsWellConfigured,
    item.actions?.scanner?.result?.vendorsTriggeredWithoutConsent,
    item.actions?.scanner?.result?.pdfURLs?.en,
    item.actions?.scanner?.result?.pdfURLs?.fr,
    item.actions?.scanner?.result?.vendorsTriggeredWithoutConsent,
    item.actions?.scanner?.result?.vendorsExemptOfConsent,
    item.actions?.showcase?.result?.media?.[0]?.url,
    item.actions?.showcase?.result?.media?.[1]?.url
  ]);

  return headers.join(',') + '\n' + rows.map(row => row.join(',')).join('\n');
}
