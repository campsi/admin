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
  return (
    <Layout.Sider collapsible width={250} collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)}>
      <Menu mode="inline" theme="dark" defaultSelectedKeys={['1']} defaultOpenKeys={['sub1']} style={{ minHeight: '100%' }}>
        {Object.keys(services).map(serviceName => {
          const service = services[serviceName];
          switch (service.class) {
            case 'DocsService':
            case 'VersionedDocsService':
              return (
                <Menu.SubMenu title={service.title || serviceName} key={`subMenu/${serviceName}`} icon={<ContainerOutlined />}>
                  {Object.keys(service.resources).map(resourceName => {
                    const resource = service.resources[resourceName];
                    const link = `/services/${serviceName}/resources/${resourceName}`;
                    return (
                      <Menu.Item key={link} icon={<UnorderedListOutlined />}>
                        <Link to={link}>{resource.label}</Link>
                      </Menu.Item>
                    );
                  })}
                </Menu.SubMenu>
              );
            case 'AuthService':
              const AuthLink = `/services/${serviceName}`;
              return (
                <Menu.Item
                  key={AuthLink}
                  icon={
                    token && token !== 'undefined' ? (
                      <CheckCircleOutlined style={{ color: 'green' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: 'red' }} />
                    )
                  }
                >
                  <Link to={AuthLink}>{service.title || serviceName}</Link>
                </Menu.Item>
              );
            default:
              const link = `/services/${serviceName}`;
              return (
                <Menu.Item key={link} icon={<CloudOutlined />}>
                  <Link to={link}>{service.title || serviceName}</Link>
                </Menu.Item>
              );
          }
        })}
      </Menu>
    </Layout.Sider>
  );
}
