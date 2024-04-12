import DocsService from '../DocsService/DocsService';
import AuthService from '../AuthService/AuthService';
import AssetsService from '../AssetsService/AssetsService';
import { useParams } from 'react-router-dom';
import AutomatorService from '../AutomatorService/AutomatorService';
import NotificationsService from '../NotificationsService/NotificationsService';
import { Layout, Space } from 'antd';

const ServiceComponents = {
  DocsService,
  AuthService,
  AutomatorService,
  AssetsService,
  NotificationsService
};

const NoService = () => (
  <Layout.Content style={{ padding: 30 }}>
    <Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>
      <span style={{ fontSize: 24 }}>This service has no administration panel</span>
    </Space>
  </Layout.Content>
);

function Service(props) {
  const params = useParams();
  const { services } = props;
  const { serviceName } = params;
  const service = services[serviceName];
  if (!service) {
    return null;
  }
  service.name = serviceName;
  const ServiceComponent = ServiceComponents[service.class];
  return ServiceComponent ? <ServiceComponent service={service} /> : NoService();
}

export default Service;
