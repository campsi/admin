import { Link } from 'react-router-dom';

export default function AdminMenu({ services }) {
  return (
    <div>
      <h2>Services</h2>
      <ul>
        {Object.keys(services).map((serviceName) => {
          const service = services[serviceName];
          return (
            <li key={serviceName}>
              <Link to={`/services/${serviceName}`}>
                {serviceName} - {service.class}
              </Link>
              {["DocsService", "VersionedDocsService"].includes(
                service.class
              ) && (
                <ul>
                  {Object.keys(service.resources).map((resourceName) => {
                    const resource = service.resources[resourceName];
                    return (
                      <li key={resourceName}>
                        <Link to={`/services/${serviceName}/resources/${resourceName}`}>
                          {resourceName} - {resource.label} - {resource.class}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
