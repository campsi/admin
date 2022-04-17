import PropTypes from "prop-types";
import Api from "./Api";
import { Component, createContext } from "react";
import AdminMenu from "./components/AdminMenu/AdminMenu";
import Service from "./components/Service/Service";
import {
  NotificationCenter,
} from "./components/Elements";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { v4 } from "uuid";
import Notification from "./components/Notification/Notification";
import 'antd/dist/antd.css';
import {Layout} from "antd";
const { Header } = Layout;

const NOTIFICATION_TIMEOUT = Number(process.env.REACT_APP_NOTIFICATION_TIMEOUT) || 5000;
export const AppContext = createContext({ service: new Api(), api: null });

export function withAppContext(Component) {
  function WrappedComponent(props) {
    return (
      <AppContext.Consumer>
        {(context) => <Component {...context} {...props} />}
      </AppContext.Consumer>
    );
  }
  WrappedComponent.displayName = `withAppContext(${Component.name})`;
  return WrappedComponent;
}

withAppContext.propTypes = {
  services: PropTypes.object,
  authenticated: PropTypes.bool,
  api: PropTypes.instanceOf(Api),
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      message: PropTypes.string,
      id: PropTypes.string,
      createdAt: PropTypes.date,
    })
  ),
  notify: PropTypes.func,
  removeNotification: PropTypes.func,
  setAccessToken: PropTypes.func,
  revokeAccessToken: PropTypes.func,
};

const accessToken = localStorage ? localStorage.getItem("access_token") : null;

/**
 * The App class is the root Component for the Campsi/Admin
 */
class App extends Component {
  state = {
    services: {},
    authenticated: accessToken !== null,
    api: new Api({ apiUrl: process.env.REACT_APP_API_URL, accessToken }),
    notifications: [],
    /**
     *
     * @param notification
     * @returns {string} the id of the notification
     */
    notify: (notification) => {
      const id = v4();
      this.setState({
        notifications: this.state.notifications.concat([
          { ...notification, id, createdAt: new Date() },
        ]),
      });
      setTimeout(
        () => {
          this.state.removeNotification(id)
        },
        NOTIFICATION_TIMEOUT
      );
      return () => {
        this.state.removeNotification(id);
      };
    },
    removeNotification: (id, immediately = false) => {
      const notification = this.state.notifications.find((n) => n.id === id);
      if (!notification) {
        return;
      }

      const minimumTime = 1000;
      const now = new Date();
      const timeLeft = minimumTime - (now - notification.createdAt);
      if (timeLeft > 0 && !immediately) {
        setTimeout(() => {
          this.state.removeNotification(id, true);
        }, timeLeft);
        return;
      }

      this.setState({
        notifications: this.state.notifications.filter((n) => n.id !== id),
      });
    },
    /**
     * Set the accessToken in the local storage and set it for the API as well
     * We keep it in here to make check if the user is authenticated or not,
     * in the components using the AppContext
     * @param {string} accessToken
     */
    setAccessToken: (accessToken) => {
      localStorage.setItem("access_token", accessToken);
      this.setState({ accessToken }, () => {
        this.state.api.setAccessToken(accessToken);
      });
    },
    /**
     * Equivalent to a sign out. Clears the access_token from the API and the local storage
     */
    revokeAccessToken: () => {
      localStorage.removeItem("access_token");
      this.setState({ accessToken: null }, () => {
        this.state.api.revokeAccessToken();
      });
    },
  };

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const services = await this.state.api.getServices();
    this.setState({ services });
  }

  render() {
    const { services } = this.state;
    return (
      <BrowserRouter>
        <NotificationCenter>
          {this.state.notifications.map((notification) => (
            <Notification
              key={notification.id}
              {...notification}
              onDiscard={() =>
                this.state.removeNotification(notification.id, true)
              }
            />
          ))}
        </NotificationCenter>
        <AppContext.Provider value={this.state}>
          <Layout>
            <Header>
              Campsi Admin
            </Header>
            {this.state.services && (
              <Layout>
                  <AdminMenu services={this.state.services} />
                <Layout>
                  <Routes>
                    <Route
                      path="/services/:serviceName/*"
                      element={<Service services={services} />}
                    />
                  </Routes>
                </Layout>
              </Layout>
            )}
          </Layout>
        </AppContext.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
