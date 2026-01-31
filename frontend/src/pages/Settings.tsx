import React, { useState } from 'react';
import { Tabs, Form, Card, message, Alert } from 'antd';
import { RobotOutlined, FolderOpenOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import logger from '../utils/logger';
import AIConfigTab from '../components/settings/AIConfigTab';
import DownloadSettingsTab from '../components/settings/DownloadSettingsTab';
import StorageTab from '../components/settings/StorageTab';
import LoggingTab from '../components/settings/LoggingTab';
import { useCookiesSettings } from '../hooks/useCookiesSettings';

interface SettingsValues {
    vendor?: string;
    api_base?: string;
    api_key?: string;
    vl_model?: string;
    cookies_path?: string;
}

const Settings: React.FC = () => {
    const [form] = Form.useForm();
    const [testing, setTesting] = useState(false);
    const {
        cookiesConfig,
        setCookiesConfig,
        checkingCookies,
        pendingCookieFile,
        isUpdatingCookies,
        detectSiteFromCookies,
        checkCookies,
        handleCookiesUpload,
        handleUpdateCookies
    } = useCookiesSettings();

    const [maxProcesses, setMaxProcesses] = useState(4);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'warning' | 'error', message: string, description?: string } | null>(null);

    // Load Settings
    React.useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/v1/settings/');
                if (res.ok) {
                    const data = await res.json();
                    form.setFieldsValue({
                        vendor: data.vendor,
                        api_base: data.api_base,
                        api_key: data.api_key,
                        vl_model: data.vl_model
                    });

                    let loadedPath = '/app/data/cookies.txt';
                    if (data.cookies_path) {
                        loadedPath = data.cookies_path;
                        setCookiesConfig(prev => ({ ...prev, path: data.cookies_path }));
                    }

                    // Fetch cookies content
                    try {
                        const cookiesRes = await fetch('/api/v1/settings/cookies');
                        if (cookiesRes.ok) {
                            const cookiesData = await cookiesRes.json();
                            if (cookiesData.content) {
                                const site = detectSiteFromCookies(cookiesData.content);
                                setCookiesConfig(prev => ({
                                    ...prev,
                                    path: loadedPath,
                                    content: cookiesData.content,
                                    detectedSite: site
                                }));
                            }
                        }
                    } catch (err) {
                        console.error("Failed to load cookies content", err);
                    }
                }
            } catch (e) {
                logger.error('Settings', 'load_config', 'Failed to load settings', e as Error);
            }
        };
        loadSettings();
    }, [form, detectSiteFromCookies, setCookiesConfig]);

    const handleSave = async (values: SettingsValues) => {
        try {
            const res = await fetch('/api/v1/settings/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            if (res.ok) {
                logger.userAction('Settings', 'save_config', values as unknown as Record<string, unknown>);
                message.success('Configuration saved.');
                setStatusMessage({
                    type: 'success',
                    message: 'Configuration Saved',
                    description: 'Your settings have been successfully saved.'
                });
            } else {
                message.error('Failed to save configuration.');
                setStatusMessage({
                    type: 'error',
                    message: 'Save Failed',
                    description: 'The server rejected the configuration. Please check your logs.'
                });
            }
        } catch (e) {
            message.error('Failed to save configuration.');
            setStatusMessage({
                type: 'error',
                message: 'Save Failed',
                description: e instanceof Error ? e.message : 'Unknown error occurred'
            });
        }
    };

    const handleTestConnection = async () => {
        try {
            const values = await form.validateFields();
            setTesting(true);
            setStatusMessage({ type: 'info', message: 'Testing Connection...', description: 'Verifying API configuration...' });

            logger.apiRequest('Settings', 'POST', '/api/v1/ai/test');

            const response = await fetch('/api/v1/ai/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: values.api_key,
                    api_base: values.api_base,
                    vendor: values.vendor || 'custom',
                    vl_model: values.vl_model
                }),
            });

            const data = await response.json();

            if (response.ok) {
                logger.apiResponse('Settings', 'POST', '/api/v1/ai/test', 200);
                message.success(`Connection successful!`);
                setStatusMessage({
                    type: 'success',
                    message: 'Connection Successful',
                    description: `Provider responded: ${data.response}`
                });
            } else {
                throw new Error(data.detail || 'Connection failed');
            }
            setTesting(false);
        } catch (error) {
            logger.error('Settings', 'test_connection', 'Validation failed', error as Error);
            setTesting(false);
            setStatusMessage({
                type: 'error',
                message: 'Connection Failed',
                description: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    const handleExportLogs = () => {
        const logs = logger.exportLogs();
        const blob = new Blob([logs], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reelforge_logs_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        logger.userAction('Settings', 'export_logs', { count: logger.getLogs().length });
        message.success('Logs exported');
    };

    const handleClearLogs = () => {
        const count = logger.getLogs().length;
        logger.clearLogs();
        logger.info('Settings', 'clear_logs', `Cleared ${count} log entries`);
        message.success(`Cleared ${count} log entries`);
    };

    const cardStyle = {
        background: '#252526',
        border: '1px solid #3c3c3c',
        marginBottom: 16,
        width: '100%',
    };

    const items = [
        {
            key: '1',
            label: <span><RobotOutlined /> AI Configuration</span>,
            children: <AIConfigTab form={form} testing={testing} onSave={handleSave} onTestConnection={handleTestConnection} />,
        },
        {
            key: '2',
            label: <span><SettingOutlined /> Download Settings</span>,
            children: <DownloadSettingsTab
                cookiesConfig={cookiesConfig}
                setCookiesConfig={setCookiesConfig}
                maxProcesses={maxProcesses}
                setMaxProcesses={setMaxProcesses}
                checkingCookies={checkingCookies}
                onCheckCookies={checkCookies}
                onCookiesUpload={handleCookiesUpload}
                detectSiteFromCookies={detectSiteFromCookies}
                pendingCookieFile={pendingCookieFile}
                onUpdateCookies={handleUpdateCookies}
                isUpdatingCookies={isUpdatingCookies}
            />,
        },
        {
            key: '3',
            label: <span><FolderOpenOutlined /> Storage & Paths</span>,
            children: <StorageTab />,
        },
        {
            key: '4',
            label: <span><FileTextOutlined /> Logging & Debug</span>,
            children: <LoggingTab onExportLogs={handleExportLogs} onClearLogs={handleClearLogs} />,
        },
    ];

    return (
        <div style={{ padding: 24, width: '100%' }}>
            <h1 style={{ color: 'white', marginBottom: 24 }}>Settings</h1>
            {statusMessage && (
                <Alert
                    message={statusMessage.message}
                    description={statusMessage.description}
                    type={statusMessage.type}
                    showIcon
                    closable
                    onClose={() => setStatusMessage(null)}
                    style={{ marginBottom: 24 }}
                />
            )}
            <Card bordered={false} style={cardStyle}>
                <Tabs defaultActiveKey="1" items={items} />
            </Card>
        </div>
    );
};

export default Settings;
