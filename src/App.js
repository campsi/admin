import PropTypes from 'prop-types';
import Api from './Api';
import { Component, createContext } from 'react';
import AdminMenu from './components/AdminMenu/AdminMenu';
import Service from './components/Service/Service';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import Playground from './components/Playground/Playground';

export const AppContext = createContext({
  services: {},
  api: null,
  authenticated: false,
  setAccessToken: async () => {},
  revokeAccessToken: async () => {}
});

export function withAppContext(Component) {
  function WrappedComponent(props) {
    return <AppContext.Consumer>{context => <Component {...context} {...props} />}</AppContext.Consumer>;
  }
  WrappedComponent.displayName = `withAppContext(${Component.name})`;
  return WrappedComponent;
}

withAppContext.propTypes = {
  services: PropTypes.object,
  authenticated: PropTypes.bool,
  api: PropTypes.instanceOf(Api),
  setAccessToken: PropTypes.func,
  revokeAccessToken: PropTypes.func
};

const accessToken = localStorage ? localStorage.getItem('access_token') : null;

/**
 * The App class is the root Component for the Campsi/Admin
 */
class App extends Component {
  state = {
    services: {},
    authenticated: accessToken !== null,
    api: new Api({ apiUrl: process.env.REACT_APP_API_URL, accessToken }),
    /**
     * Set the accessToken in the local storage and set it for the API as well
     * We keep it in here to make check if the user is authenticated or not,
     * in the components using the AppContext
     * @param {string} accessToken
     */
    setAccessToken: async accessToken => {
      localStorage.setItem('access_token', accessToken);
      this.state.api.setAccessToken(accessToken);
      return new Promise(resolve => {
        this.setState({ authenticated: true }, resolve);
      });
    },
    /**
     * Equivalent to a sign out. Clears the access_token from the API and the local storage
     */
    revokeAccessToken: async () => {
      localStorage.removeItem('access_token');
      this.state.api.revokeAccessToken();
      return new Promise(resolve => {
        this.setState({ authenticated: false }, resolve);
      });
    }
  };

  async componentDidMount() {
    await this.fetchData();
    const params = new URLSearchParams(window.location.search);
    if (params.get('access_token')) {
      this.state.setAccessToken(params.get('access_token'));
    }
  }

  async fetchData() {
    try {
      const services = await this.state.api.getServices();
      this.setState({ services });
    } catch (err) {
      if (this.state.authenticated) {
        await this.state.revokeAccessToken();
        await this.fetchData();
      }
    }
  }

  render() {
    const { services } = this.state;
    return (
      <BrowserRouter>
        <AppContext.Provider value={this.state}>
          {services && (
            <Layout hasSider style={{ minHeight: '100vh' }}>
              <AdminMenu services={services} />
              <Layout>
                <Routes>
                  <Route path="/services/:serviceName/*" element={<Service services={services} />} />
                  <Route path="/playground" element={<Playground />} />
                </Routes>
              </Layout>
            </Layout>
          )}
        </AppContext.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
