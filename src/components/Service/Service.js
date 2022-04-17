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
  return ServiceComponent ? <ServiceComponent service={service}/> : null;
}

export default Service;
