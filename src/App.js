import Api from "./Api";
import { Component, createContext } from "react";
import AdminMenu from "./components/AdminMenu/AdminMenu";
import Service from "./components/Service/Service";
import { AppStyle, MainSidebar } from "./components/Elements";
import { BrowserRouter, Route, Routes } from "react-router-dom";

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
const accessToken = localStorage ? localStorage.getItem("access_token") : null;

/**
 * The App class is the root Component for the Campsi/Admin
 */
class App extends Component {
  state = {
    services: {},
    accessToken,
    api: new Api({ apiUrl: process.env.REACT_APP_API_URL, accessToken }),
    jobs: [],
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
        <AppContext.Provider value={this.state}>
          <AppStyle>
            {this.state.services && (
              <>
                <MainSidebar>
                  <AdminMenu services={this.state.services} />
                </MainSidebar>
                <main>
                  <Routes>
                    <Route
                      path="/services/:serviceName/*"
                      element={<Service services={services} />}
                    />
                  </Routes>
                </main>
              </>
            )}
          </AppStyle>
        </AppContext.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
