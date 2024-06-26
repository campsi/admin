import { Form, Input, Select } from 'antd';
import { useEffect, useState } from 'react';

export default function EmailingForm({ api }) {
  const [campaigns, setCampaigns] = useState([]);
  const [emailCheck, setEmailCheck] = useState(undefined);
  const [groups, setGroups] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(undefined);
  const [, setSelectedGroup] = useState(undefined);
  const [, setSender] = useState(undefined);
  const [provider, setProvider] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!provider) {
      setCampaigns([]);
      return;
    }
    api.client.get(`/automator/emailing/${provider}/campaigns`).then(response => setCampaigns(response.data));
    api.client.get(`/automator/emailing/${provider}/groups`).then(response => setGroups(response.data));
  }, [provider, api.client]);

  useEffect(() => {
    if (!email) {
      return;
    }

    api.client
      .get(`/automator/emailing/${provider}/email?email=${email}&campaign=${selectedCampaign}`)
      .then(response => setEmailCheck(response.data))
      .catch(err => {
        console.error('Something wrong happened when fetching lead from provider', err);
        setEmailCheck(null);
      });
  }, [api.client, provider, selectedCampaign, email]);

  return (
    <>
      <Form.Item name={['actions', 'emailing', 'provider']} label="Provider" help="Choose your provider">
        <Select
          onChange={value => {
            setProvider(value);
          }}
        >
          <Select.Option value="sendgrid">Sendgrid</Select.Option>
          <Select.Option value="hubspot">Hubspot</Select.Option>
          <Select.Option value="sendinblue" disabled>
            SendInBlue
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        name={['actions', 'emailing', 'recipient']}
        label="Recipient"
        help={emailCheck ? `Email OK ${emailCheck}` : 'Email KO'}
      >
        <Input onBlur={event => setEmail(event.target.value)} />
      </Form.Item>
      <Form.Item name={['actions', 'emailing', 'sender']} label="Sender">
        <Input placeHolder={'Automator 🍪 <noreply@axeptio.eu>'} onBlur={event => setSender(event.target.value)} />
      </Form.Item>
      <Form.Item name={['actions', 'emailing', 'campaign']} label="Campaign">
        <Select onChange={value => setSelectedCampaign(value)}>
          {campaigns.map(c => (
            <Select.Option value={c.id} key={c.id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name={['actions', 'emailing', 'groupId']}
        label="Unsubscription Group"
        help={'To choose in the case of a prospection/newsletter...'}
      >
        <Select onChange={value => setSelectedGroup(value)}>
          {groups.map(c => (
            <Select.Option value={c.id} key={c.id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
}
