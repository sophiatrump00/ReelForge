import React, { useState } from 'react';
import { Tabs, Form, Card, message, Alert } from 'antd';
import { RobotOutlined, FolderOpenOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import logger from '../utils/logger';
import AIConfigTab from '../components/settings/AIConfigTab';
import DownloadSettingsTab from '../components/settings/DownloadSettingsTab';
import type { CookiesConfig } from '../utils/api';
import StorageTab from '../components/settings/StorageTab';
import LoggingTab from '../components/settings/LoggingTab';

interface SettingsValues {
    vendor?: string;
    api_base?: string;
    api_key?: string;
    vl_model?: string;
}

const Settings: React.FC = () => {
    const [form] = Form.useForm();
    const [testing, setTesting] = useState(false);
    const [cookiesConfig, setCookiesConfig] = useState<CookiesConfig>({
        path: '/app/data/cookies.txt',
        content: '',
        detectedSite: 'tiktok',
        isValid: false,
        lastChecked: null,
    });
    const [maxProcesses, setMaxProcesses] = useState(4);
    const [checkingCookies, setCheckingCookies] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'warning' | 'error', message: string, description?: string } | null>(null);

    // Load Settings
    React.useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/v1/settings');
                if (res.ok) {
                    const data = await res.json();
                    form.setFieldsValue({
                        vendor: data.vendor,
                        api_base: data.api_base,
                        api_key: data.api_key,
                        vl_model: data.vl_model
                    });
                }
            } catch (e) {
                logger.error('Settings', 'load_config', 'Failed to load settings', e as Error);
            }
        };
        loadSettings();
    }, [form]);

    const detectSiteFromCookies = (content: string): string => {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('.tiktok.com') || lowerContent.includes('tiktok')) {
            return 'tiktok';
        } else if (lowerContent.includes('.youtube.com') || lowerContent.includes('youtube')) {
            return 'youtube';
        } else if (lowerContent.includes('.instagram.com') || lowerContent.includes('instagram')) {
            return 'instagram';
        } else if (lowerContent.includes('.twitter.com') || lowerContent.includes('x.com')) {
            return 'twitter';
        } else if (lowerContent.includes('.facebook.com') || lowerContent.includes('facebook')) {
            return 'facebook';
        }
        return 'unknown';
    };

    const checkCookies = async () => {
        setCheckingCookies(true);
        logger.userAction('Settings', 'check_cookies', { path: cookiesConfig.path });

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const detectedSite = detectSiteFromCookies(cookiesConfig.content);
            const isValid = cookiesConfig.content.trim().length > 0 &&
                (cookiesConfig.content.includes('#') || cookiesConfig.content.includes('\t'));

            setCookiesConfig((prev: CookiesConfig) => ({
                ...prev,
                detectedSite: detectedSite !== 'unknown' ? detectedSite : 'tiktok',
                isValid,
                lastChecked: new Date().toLocaleString(),
            }));

            if (isValid) {
                logger.info('Settings', 'cookies_valid', `Cookies validated for ${detectedSite}`);
                message.success(`Cookies validated for ${detectedSite}`);
            } else {
                logger.warn('Settings', 'cookies_invalid', 'Invalid cookies format');
                message.warning('Invalid cookies format. Please check the file content.');
            }
        } catch (error) {
            logger.apiError('Settings', 'POST', '/api/v1/cookies/validate', error as Error);
            message.error('Failed to validate cookies');
        } finally {
            setCheckingCookies(false);
        }
    };

    const handleCookiesUpload = (file: File): boolean => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const detectedSite = detectSiteFromCookies(content);
            setCookiesConfig((prev: CookiesConfig) => ({
                ...prev,
                content,
                detectedSite: detectedSite !== 'unknown' ? detectedSite : 'tiktok',
                isValid: false,
                lastChecked: null,
            }));
            logger.userAction('Settings', 'upload_cookies', { size: content.length, detectedSite });
            message.info(`Cookies file loaded.Detected site: ${detectedSite} `);
        };
        reader.readAsText(file);
        return false;
    };

    const handleSave = async (values: SettingsValues) => {
        try {
            const res = await fetch('/api/v1/settings', {
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
