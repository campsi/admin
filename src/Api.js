import axios from "axios";

/**
 * @typedef CampsiService
 * @property {string} class
 * @property {string} [label]
 * @property {object} [resources]
 */

/**
 * The Api is a class instanciated in the App context
 * that is used for every AJAX requests sent to the Campsi server
 */
class Api {
  /**
   * Default values use for the constructor
   * @type {{headers: object, apiUrl: string, timeout: number}}
   */
  static defaults = {
    // The :3003 port is the one used by the developers using Campsi
    apiUrl: "http://localhost:3003/",
    timeout: 5000,
    headers: {
      // this needs to be set for the AuthService. If x-requested-with is not
      // XMLHttpRequest, the AuthService assumes that you want a redirect after
      // signup or signin, which is not the intended behaviour
      "X-Requested-With": "XMLHttpRequest",
      // not required, it's mostly for fun
      "X-Requested-With-App": "campsi/admin",
      "Content-type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
  };

  /**
   *
   * @param {string} [options.apiUrl]
   * @param {int} [options.timeout]
   * @param {Object<string,string>} [options.header]
   * @param {string} [options.accessToken]
   */
  constructor(options = {}) {
    const settings = Object.assign({}, Api.defaults, options);
    this.client = axios.create({
      baseURL: settings.apiUrl.replace(/\/$/, ""),
      timeout: settings.timeout,
      headers: settings.headers,
    });
    if (options.accessToken) {
      this.setAccessToken(options.accessToken);
    }
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken;
    this.client.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
    this.client.get(`/auth/me`).then((response) => {
      this.clientEmail = response.data?.email;
      this.clientId = response.data?._id;
    });
  }

  revokeAccessToken() {
    delete this.accessToken;
    delete this.client.defaults.headers["Authorization"];
  }

  /**
   *
   * @returns {Promise<CampsiService[]>}
   */
  async getServices() {
    const response = await this.client.get("/");
    return response.data.services || [];
  }
}

export default Api;
