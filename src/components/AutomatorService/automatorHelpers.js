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
    item.status || '',
    item.params?.domain || '',
    'CMP custom', // Assuming static value for CMP Found
    item.actions?.scanner?.result?.nbVendorsFound || 0,
    item.actions?.scanner?.result?.vendorsWellConfigured || 0,
    item.actions?.scanner?.result?.vendorsTriggeredWithoutConsent || 0,
    'https://example.com/en.PDF', // Placeholder for PDF URL EN
    'https://example.com/fr.PDF', // Placeholder for PDF URL FR
    item.actions?.scanner?.result?.vendorsTriggeredWithoutConsent || 0,
    item.actions?.scanner?.result?.vendorsExemptOfConsent || 0,
    item.actions?.showcase?.result?.media?.[0]?.url || '',
    item.actions?.showcase?.result?.media?.[1]?.url || ''
  ]);

  return headers.join(',') + '\n' + rows.map(row => row.join(',')).join('\n');
}
