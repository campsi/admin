# Campsi Admin

Campsi Admin is a Single Page Application generator that uses a live Campsi API endpoint to build a full-fledge administration console on the fly.

A Campsi API is composed of various services that are mounted on various endpoints. When accessing the index endpoint of the API (for example https://api.axept.io/v1/), Campsi API will expose all the services and their respective Service classes. The Campsi Admin App will generate a router and a menu that will display all the available services.

Each service is now a page in the Admin accessible with the URL `/services/${serviceName}`. If a Service class exists in the components for the given endpoint, the Service Components is created, with its own sub-router and it's own sub-menu

## Available Service Components

### 🔐 Auth

The AuthService component is capable of interacting with the Campsi API's AuthService. It will present a local sign up/sign in form if it is available and also generate the social logins URLs if Auth Providers are exposed when calling the `/auth/providers` endpoint on the API.

### 📘 Docs

The DocService is an advanced CRUD for Campsi's [Docs Service](https://github.com/campsi/campsi-mono/tree/master/services/docs). It leverages the JSON Schema data model to generate dynamic forms.

### 📚 Versioned Docs - **TODO**

### 📸 Assets - **TODO**

Administration Panel for [the Assets Service](https://github.com/campsi/campsi-mono/tree/master/services/assets). In this panel, the users should be able to upload and fetch assets on the different StorageProviders the Assets Service can interact with.

### 🪝 Webhooks - **TODO**

Administration Panel for [the Webhooks Service](https://github.com/campsi/campsi-mono/tree/master/services/webhooks). In this panel, the users should be able to CRUD their webhooks.

### 💶 Stripe Billing - **TODO**

Administration Panel for [the Stripe Billing Service](https://github.com/campsi/campsi-mono/tree/master/services/stripe-billing).

### 💶 Notifications - **TODO**

Administration Panel for [the Notification Service](https://github.com/campsi/campsi-mono/tree/master/services/notifications).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
