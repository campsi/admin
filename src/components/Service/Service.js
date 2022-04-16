import DocsService from "../DocsService/DocsService";
import AuthService from "../AuthService/AuthService";
import {useParams} from "react-router-dom";

const ServiceComponents = {
  DocsService,
  AuthService,
};

function Service(props) {
  const params = useParams();
  const {services} = props;
  const {serviceName} = params;
  const service = services[serviceName];
  if (!service) {
    return null;
  }
  service.name = serviceName;
  const ServiceComponent = ServiceComponents[service.class];
  return (
    <div>
      <h1>
        <label>Service name</label> <code>/{service.name}</code>
      </h1>
      <h2>
        <label>Class</label> {service.class}
      </h2>
      {ServiceComponent && <ServiceComponent service={service}/>}
    </div>
  );
}

export default Service;
