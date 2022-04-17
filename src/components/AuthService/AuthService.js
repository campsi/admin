import { Component } from "react";
import { withAppContext } from "../../App";
import { Layout, Form, Typography, Button, Input, Card, Space } from "antd";
const { Title } = Typography;

class AuthService extends Component {
  state = {
    me: null,
    providers: [],
    hasLocalProvider: false,
  };

  componentDidMount() {
    this.fetchProviders();
    if (this.props.authenticated) {
      this.fetchMe();
    }
  }

  async fetchMe() {
    const { api, service, notify } = this.props;
    const discardNotification = notify({ title: "Fetching user details" });
    const response = await api.client.get(`${service.name}/me`);
    this.setState({ me: response.data }, discardNotification);
  }

  async fetchProviders() {
    const { api, service, notify } = this.props;
    const discardNotification = notify({ title: "Fetching Providers" });
    const response = await api.client.get(`${service.name}/providers`);
    this.setState(
      {
        providers: response.data,
        hasLocalProvider:
          response.data.map((p) => p.name).indexOf("local") !== -1,
      },
      discardNotification
    );
  }

  async login(event) {
    const { api, service, setAccessToken } = this.props;

    event.preventDefault();
    const email = event.target.querySelector("input[type=email]").value;
    const password = event.target.querySelector("input[type=password]").value;
    const response = await api.client.post(`${service.name}/local/signin`, {
      username: email,
      email,
      password,
      mode: "signin",
    });
    if (response.data?.token) {
      setAccessToken(response.data?.token);
      await this.fetchMe();
    }
  }

  async register(event) {
    const { api, service, setAccessToken } = this.props;

    event.preventDefault();
    const email = event.target.querySelector("input[type=email]").value;
    const password = event.target.querySelector("input[type=password]").value;
    const response = await api.client.post(`${service.name}/local/signup`, {
      username: email,
      displayName: email,
      email,
      password,
    });

    if (response.data?.token) {
      setAccessToken(response.data?.token);
      await this.fetchMe();
    }
  }
  render() {
    const { api, service, revokeAccessToken } = this.props;
    const { me } = this.state;
    return (
      <Layout.Content className="main-page-content">
        <Title>Auth</Title>
        {me && (
          <div>
            <h2>Me</h2>
            <button onClick={() => revokeAccessToken()}>Sign out</button>
            <textarea defaultValue={JSON.stringify(me, null, 2)} />
          </div>
        )}
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Card title="Identify providers">
            <Button.Group>
              {this.state.providers
                .filter((p) => p.name !== "local")
                .map((provider) => (
                  <Button
                    key={provider.name}
                    onClick={() => {
                      window.location.href = `${api.client.defaults.baseURL}/${service.name}/${provider.name}`;
                    }}
                  >
                    {provider.name}
                  </Button>
                ))}
            </Button.Group>
          </Card>
          {this.state.hasLocalProvider && (
            <>
              <Card title="Log in">
                <Form onSubmit={(event) => this.login(event)}>
                  <Form.Item label="Email">
                    <Input
                      type="email"
                      defaultValue="romainbessuges+admin@gmail.com"
                    />
                  </Form.Item>
                  <Form.Item label="Password">
                    <Input type="password" defaultValue="test" />
                  </Form.Item>
                  <Button>Log in</Button>
                </Form>
              </Card>
              <Card title="Create Account">
                <Form
                  onSubmit={(event) => this.register(event)}
                >
                  <Form.Item label="Email">
                    <Input type="email" />
                  </Form.Item>
                  <Form.Item label="Password">
                    <Input type="password" />
                  </Form.Item>
                  <Button>Sign up</Button>
                </Form>
              </Card>
            </>
          )}
        </Space>
      </Layout.Content>
    );
  }
}

export default withAppContext(AuthService);
//export default AuthService;
