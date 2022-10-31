import PropTypes from "prop-types";
import { Component } from "react";
import { withAppContext } from "../../App";
import {
  Layout,
  Form,
  Typography,
  Button,
  Input,
  Card,
  Space,
  Tag,
} from "antd";
const { Title } = Typography;

class AuthService extends Component {
  state = {
    me: null,
    providers: [],
    hasLocalProvider: false,
  };

  async componentDidMount() {
    await this.fetchProviders();
    if (this.props.authenticated) {
      await this.fetchMe();
    }
  }

  async fetchMe() {
    const { api, service } = this.props;
    const response = await api.client.get(`${service.name}/me`);
    this.setState({ me: response.data });
  }

  async fetchProviders() {
    const { api, service } = this.props;
    const response = await api.client.get(`${service.name}/providers`);
    this.setState({
      providers: response.data,
      hasLocalProvider:
        response.data.map((p) => p.name).indexOf("local") !== -1,
    });
  }

  async login(values) {
    const { api, service, setAccessToken } = this.props;
    const response = await api.client.post(`${service.name}/local/signin`, {
      username: values.email,
      email: values.email,
      password: values.password,
      mode: "signin",
    });
    if (response.data?.token) {
      setAccessToken(response.data.token);
      await this.fetchMe();
    }
  }

  async register(formData) {
    const { api, service, setAccessToken } = this.props;

    const email = formData.email;
    const password = formData.password;
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
    const { api, service, revokeAccessToken, setAccessToken } = this.props;
    const { me } = this.state;
    return (
      <Layout.Content className="main-page-content">
        <Title>Auth</Title>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Card title="Me">
            <Form
              onFinish={async (values) => {
                setAccessToken(values.accessToken);
                await this.fetchMe();
              }}
            >
              <Form.Item
                label="Access Token"
                name="accessToken"
                initialValue={api.accessToken}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Access Token
                </Button>
              </Form.Item>
            </Form>
            {me && (
              <Form.Item>
                <Tag color={"green"} key={"Connected"}>
                  {"Connected"}
                </Tag>
                <Button
                  type="ghost"
                  color={"red"}
                  onClick={async () => {
                    await revokeAccessToken();
                    this.setState({ me: null });
                  }}
                >
                  Sign out
                </Button>
              </Form.Item>
            )}
          </Card>
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
                <Form onFinish={(values) => this.login(values)}>
                  <Form.Item label="Email" name="email">
                    <Input type="email" />
                  </Form.Item>
                  <Form.Item label="Password" name="password">
                    <Input type="password" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Log in
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
              <Card title="Create Account">
                <Form onFinish={(formData) => this.register(formData)}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true }, { type: "email" }]}
                  >
                    <Input type="email" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true }]}
                  >
                    <Input type="password" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    Sign up
                  </Button>
                </Form>
              </Card>
            </>
          )}
        </Space>
      </Layout.Content>
    );
  }
}

AuthService.propTypes = {
  service: PropTypes.shape({
    name: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired,
    providers: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
      })
    ),
  }),
  ...withAppContext.propTypes,
};

export default withAppContext(AuthService);
