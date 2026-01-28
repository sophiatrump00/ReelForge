import React, { useState } from 'react';
import { Layout, Menu, Button, theme, ConfigProvider } from 'antd';
import {
  DashboardOutlined,
  DownloadOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  GithubOutlined,
  TagsOutlined,
  ThunderboltOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import logger from '../utils/logger';

const { Header, Sider, Content } = Layout;

// VS Code Dark+ Theme Colors
const vsCodeTheme = {
  bgPrimary: '#1e1e1e',
  bgSecondary: '#252526',
  bgSidebar: '#333333',
  textPrimary: '#d4d4d4',
  accent: '#007acc',
  success: '#4ec9b0',
  warning: '#dcdcaa',
  error: '#f14c4c',
  border: '#3c3c3c',
};

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/download',
      icon: <DownloadOutlined />,
      label: 'Download',
    },
    {
      key: '/materials',
      icon: <VideoCameraOutlined />,
      label: 'Materials',
    },
    {
      key: '/keywords',
      icon: <TagsOutlined />,
      label: 'Keywords',
    },
    {
      key: '/process',
      icon: <ThunderboltOutlined />,
      label: 'Process',
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleNavigate = (key: string) => {
    logger.navigate(location.pathname, key);
    navigate(key);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: vsCodeTheme.accent,
          colorBgContainer: vsCodeTheme.bgSecondary,
          colorBgLayout: vsCodeTheme.bgPrimary,
          colorText: vsCodeTheme.textPrimary,
          colorBorder: vsCodeTheme.border,
          colorSuccess: vsCodeTheme.success,
          colorWarning: vsCodeTheme.warning,
          colorError: vsCodeTheme.error,
          borderRadius: 4,
          fontFamily: "'Segoe UI', 'SF Pro Display', system-ui, -apple-system, sans-serif",
        },
        components: {
          Menu: {
            darkItemBg: vsCodeTheme.bgSidebar,
            darkItemSelectedBg: vsCodeTheme.accent,
          },
          Layout: {
            siderBg: vsCodeTheme.bgSidebar,
            headerBg: vsCodeTheme.bgSecondary,
          },
          Card: {
            colorBgContainer: vsCodeTheme.bgSecondary,
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{ borderRight: `1px solid ${vsCodeTheme.border}` }}
        >
          <div style={{
            height: 48,
            margin: 12,
            background: vsCodeTheme.accent,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: collapsed ? 14 : 16,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            letterSpacing: '0.5px'
          }}>
            {collapsed ? 'RF' : '🎬 ReelForge'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => handleNavigate(key)}
            style={{ borderRight: 0 }}
          />
        </Sider>
        <Layout>
          <Header style={{
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${vsCodeTheme.border}`
          }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 48,
                height: 48,
                color: vsCodeTheme.textPrimary,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                color: vsCodeTheme.success,
                fontSize: 12,
                padding: '2px 8px',
                background: 'rgba(78, 201, 176, 0.15)',
                borderRadius: 4,
              }}>v0.1.0</span>
              <Button
                type="text"
                icon={<GithubOutlined />}
                href="https://github.com/sophiatrump00/ReelForge"
                target="_blank"
                style={{ color: vsCodeTheme.textPrimary }}
              />
            </div>
          </Header>
          <Content
            style={{
              margin: 16,
              padding: 20,
              minHeight: 280,
              background: vsCodeTheme.bgSecondary,
              borderRadius: 6,
              overflow: 'auto',
              border: `1px solid ${vsCodeTheme.border}`,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;

