import { Form, Input, Select } from "antd";
import { useEffect, useState } from "react";

export default function EmailingForm({ api }) {
  const [campaigns, setCampaigns] = useState([]);
  const [lead, setLead] = useState(undefined);
  const [provider, setProvider] = useState("lemlist");

  useEffect(() => {
    api.client
      .get(`/automator/emailing/campaigns?provider=${provider}`)
      .then((response) => setCampaigns(response.data));
  }, [provider, api.client]);

  function fetchLeadFromProvider(email) {
    api.client
      .get(`/automator/emailing/${provider}/lead?email=${email}`)
      .then((response) => setLead(response.data))
      .catch((err) => {
        console.error(
          "Something wrong happened when fetching lead from provider",
          err
        );
        setLead(null);
      });
  }

  return (
    <>
      <Form.Item
        name={["actions", "emailing", "provider"]}
        initialValue="lemlist"
        label="Provider"
        help="Choose your provider"
      >
        <Select
          onChange={(value) => {
            setProvider(value);
          }}
        >
          <Select.Option value="lemlist">Lemlist</Select.Option>
          <Select.Option value="hubspot" disabled>
            Hubspot
          </Select.Option>
          <Select.Option value="sendinblue" disabled>
            SendInBlue
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        name={["actions", "emailing", "recipient"]}
        label="Recipient"
        help={lead ? "Lead found" : "Lead not found"}
      >
        <Input onBlur={(event) => fetchLeadFromProvider(event.target.value)} />
      </Form.Item>
      <Form.Item name={["actions", "emailing", "campaign"]} label="Campaign">
        <Select>
          {campaigns.map((c) => (
            <Select.Option value={c._id} key={c._id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
}