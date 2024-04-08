import { Link } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import {
  CloudOutlined,
  ContainerOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useState } from 'react';

export default function AdminMenu({ services }) {
  const [collapsed, setCollapsed] = useState(false);
  const token = localStorage.getItem('access_token');

  const items = Object.keys(services).map(serviceName => {
    const service = services[serviceName];
    switch (service.class) {
      case 'DocsService':
      case 'VersionedDocsService':
        const subItems = Object.keys(service.resources).map(resourceName => {
          const resource = service.resources[resourceName];
          const link = `/services/${serviceName}/resources/${resourceName}`;
          return {
            label: <Link to={link}>{resource.label}</Link>,
            key: link,
            icon: <UnorderedListOutlined />
          };
        });
        return {
          label: service.title || serviceName,
          key: `subMenu/${serviceName}`,
          icon: <ContainerOutlined />,
          children: subItems
        };
      case 'AuthService':
        const authLink = `/services/${serviceName}`;
        const iconColor = token && token !== 'undefined' ? 'green' : 'red';
        return {
          label: <Link to={authLink}>{service.title || serviceName}</Link>,
          key: authLink,
          icon: <CheckCircleOutlined style={{ color: iconColor }} />
        };
      default:
        const link = `/services/${serviceName}`;
        return {
          label: <Link to={link}>{service.title || serviceName}</Link>,
          key: link,
          icon: <CloudOutlined />
        };
    }
  });

  return (
    <Layout.Sider collapsible width={250} collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)}>
      <Menu
        mode="inline"
        theme="dark"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        style={{ minHeight: '100%' }}
        items={items}
      />
    </Layout.Sider>
  );
}
