import { Component } from "react";
import { withAppContext } from "../../App";

class AuthService extends Component {
  state = {
    me: null,
    providers: [],
    hasLocalProvider: false,
  };

  componentDidMount() {
    this.fetchProviders();
    if (this.props.accessToken) {
      this.fetchMe();
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
    this.setState(
      {
        providers: response.data,
        hasLocalProvider:
          response.data.map((p) => p.name).indexOf("local") !== -1,
      }
    );
  }

  render() {
    const { api, service, setAccessToken, revokeAccessToken } = this.props;
    const { me } = this.state;
    return (
      <div>
        <h1>Auth</h1>
        {me && (
          <div>
            <h2>Me</h2>
            <button onClick={() => revokeAccessToken()}>Sign out</button>
            <textarea defaultValue={JSON.stringify(me, null, 2)} />
          </div>
        )}
        <h2>Providers</h2>
        {this.state.providers
          .filter((p) => p.name !== "local")
          .map((provider) => (
            <div key={provider.name}>
              <button
                onClick={() => {
                  window.location.href = `${api.client.defaults.baseURL}/${service.name}/${provider.name}`;
                }}
              >
                {provider.name}
              </button>
            </div>
          ))}
        {this.state.hasLocalProvider && (
          <div>
            <h2>Local</h2>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const email =
                  event.target.querySelector("input[type=email]").value;
                const password = event.target.querySelector(
                  "input[type=password]"
                ).value;
                const response = await api.client.post(
                  `${service.name}/local/signin`,
                  {
                    username: email,
                    email,
                    password,
                    mode: "signin",
                  }
                );
                if (response.data?.token) {
                  setAccessToken(response.data?.token);
                  this.fetchMe();
                }
              }}
            >
              <h3>Sign in</h3>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  defaultValue="romainbessuges+admin@gmail.com"
                />
              </div>
              <div>
                <label>Password</label>
                <input type="password" defaultValue="test" />
              </div>
              <div>
                <button>Log in</button>
              </div>
            </form>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const email =
                  event.target.querySelector("input[type=email]").value;
                const password = event.target.querySelector(
                  "input[type=password]"
                ).value;
                const response = await api.client.post(
                  `${service.name}/local/signup`,
                  {
                    username: email,
                    displayName: email,
                    email,
                    password,
                  }
                );
                console.info(response);
              }}
            >
              <h3>Signup</h3>
              <div>
                <label>Email</label>
                <input type="email" />
              </div>
              <div>
                <label>Password</label>
                <input type="password" />
              </div>
              <div>
                <button>Sign up</button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }
}

export default withAppContext(AuthService);
//export default AuthService;
