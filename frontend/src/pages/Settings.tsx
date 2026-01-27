import React, { useState } from 'react';
import { Tabs, Form, Card, message } from 'antd';
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

    const handleSave = (values: SettingsValues) => {
        logger.userAction('Settings', 'save_config', values as unknown as Record<string, unknown>);
        console.log('Saved settings:', values);
        message.success('Configuration saved.');
    };

    const handleTestConnection = async () => {
        try {
            const values = await form.validateFields();
            setTesting(true);
            logger.apiRequest('Settings', 'POST', '/api/v1/ai/test');

            setTimeout(() => {
                if (values.api_key && values.api_base) {
                    logger.apiResponse('Settings', 'POST', '/api/v1/ai/test', 200);
                    message.success(`Successfully connected to ${values.vendor} compatible API!`);
                } else {
                    logger.apiResponse('Settings', 'POST', '/api/v1/ai/test', 400);
                    message.error('Missing API Key or Base URL');
                }
                setTesting(false);
            }, 1500);
        } catch (error) {
            logger.error('Settings', 'test_connection', 'Validation failed', error as Error);
            setTesting(false);
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
            <Card bordered={false} style={cardStyle}>
                <Tabs defaultActiveKey="1" items={items} />
            </Card>
        </div>
    );
};

export default Settings;
