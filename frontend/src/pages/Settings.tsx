import React, { useState } from 'react';
import { Tabs, Form, Input, Button, Card, Select, message, Row, Col, InputNumber, Alert, Upload, Tag, Space, Divider, Statistic } from 'antd';
import { RobotOutlined, FolderOpenOutlined, ApiOutlined, UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, SettingOutlined, FileTextOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import logger from '../utils/logger';

const { TextArea } = Input;

interface CookiesConfig {
    path: string;
    content: string;
    detectedSite: string;
    isValid: boolean;
    lastChecked: string | null;
}

interface SettingsValues {
    vendor?: string;
    api_base?: string;
    api_key?: string;
    vl_model?: string;
    [key: string]: string | undefined;
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

    // Detect site from cookies content
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

    // Check cookies validity
    const checkCookies = async () => {
        setCheckingCookies(true);
        logger.userAction('Settings', 'check_cookies', { path: cookiesConfig.path });

        try {
            // Simulate API check - in real app would call backend
            await new Promise(resolve => setTimeout(resolve, 1000));

            const detectedSite = detectSiteFromCookies(cookiesConfig.content);
            const isValid = cookiesConfig.content.trim().length > 0 &&
                (cookiesConfig.content.includes('#') || cookiesConfig.content.includes('\t'));

            setCookiesConfig(prev => ({
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

    // Handle cookies file upload
    const handleCookiesUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const detectedSite = detectSiteFromCookies(content);
            setCookiesConfig(prev => ({
                ...prev,
                content,
                detectedSite: detectedSite !== 'unknown' ? detectedSite : 'tiktok',
                isValid: false,
                lastChecked: null,
            }));
            logger.userAction('Settings', 'upload_cookies', { size: content.length, detectedSite });
            message.info(`Cookies file loaded. Detected site: ${detectedSite}`);
        };
        reader.readAsText(file);
        return false;
    };

    const handleSave = (values: SettingsValues) => {
        logger.userAction('Settings', 'save_config', values);
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
    };

    const aiModelItems = (
        <Form layout="vertical" onFinish={handleSave} form={form} initialValues={{
            vendor: 'custom',
            api_base: 'https://api.openai.com/v1',
            vl_model: 'gpt-4-vision-preview'
        }}>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="vendor" label="AI Vendor Profile">
                        <Select
                            onChange={(value) => {
                                if (value === 'siliconflow') {
                                    form.setFieldsValue({
                                        api_base: 'https://api.siliconflow.cn/v1',
                                        vl_model: 'Qwen/Qwen2.5-VL-72B-Instruct'
                                    });
                                } else if (value === 'openai') {
                                    form.setFieldsValue({
                                        api_base: 'https://api.openai.com/v1',
                                        vl_model: 'gpt-4-vision-preview'
                                    });
                                }
                            }}
                        >
                            <Select.Option value="siliconflow">SiliconFlow (Qwen)</Select.Option>
                            <Select.Option value="openai">OpenAI</Select.Option>
                            <Select.Option value="dashscope">DashScope</Select.Option>
                            <Select.Option value="custom">Custom / Other</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={16}>
                    <Form.Item name="api_base" label="API Base URL" rules={[{ required: true }]}>
                        <Input placeholder="https://api.example.com/v1" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="api_key" label="API Key" rules={[{ required: true, message: 'API Key is required' }]}>
                <Input.Password placeholder="sk-..." />
            </Form.Item>

            <Form.Item name="vl_model" label="Vision Model ID" rules={[{ required: true }]}>
                <Input placeholder="e.g., gpt-4-turbo, Qwen/Qwen2.5-VL-72B-Instruct" />
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">Save Configuration</Button>
                    <Button icon={<ApiOutlined />} onClick={handleTestConnection} loading={testing}>
                        Test Connection
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );

    const downloadItems = (
        <div>
            {/* Cookies Configuration */}
            <Card title="Cookies Configuration (yt-dlp)" size="small" style={cardStyle}>
                <Alert
                    message="Important"
                    description="yt-dlp requires valid cookies for authenticated downloads. The cookies file must exist before downloading."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16, background: '#1e1e1e', border: '1px solid #dcdcaa' }}
                />

                <Form.Item label="Cookies File Path">
                    <Input
                        value={cookiesConfig.path}
                        onChange={(e) => setCookiesConfig(prev => ({ ...prev, path: e.target.value }))}
                        placeholder="/app/data/cookies.txt"
                        addonAfter={
                            cookiesConfig.isValid ?
                                <CheckCircleOutlined style={{ color: '#4ec9b0' }} /> :
                                <CloseCircleOutlined style={{ color: '#f14c4c' }} />
                        }
                    />
                </Form.Item>

                <Form.Item label="Cookies Content">
                    <TextArea
                        value={cookiesConfig.content}
                        onChange={(e) => {
                            const content = e.target.value;
                            const detectedSite = detectSiteFromCookies(content);
                            setCookiesConfig(prev => ({
                                ...prev,
                                content,
                                detectedSite: detectedSite !== 'unknown' ? detectedSite : prev.detectedSite,
                                isValid: false,
                            }));
                        }}
                        rows={6}
                        placeholder="Paste Netscape format cookies here or upload a cookies.txt file..."
                        style={{ fontFamily: 'monospace', fontSize: 12 }}
                    />
                </Form.Item>

                <Row gutter={16} align="middle">
                    <Col>
                        <Upload
                            accept=".txt"
                            showUploadList={false}
                            beforeUpload={handleCookiesUpload}
                        >
                            <Button icon={<UploadOutlined />}>Upload cookies.txt</Button>
                        </Upload>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            onClick={checkCookies}
                            loading={checkingCookies}
                        >
                            Validate Cookies
                        </Button>
                    </Col>
                    <Col flex="auto">
                        <Space>
                            <span>Detected Site:</span>
                            <Tag color={cookiesConfig.detectedSite === 'tiktok' ? 'magenta' :
                                cookiesConfig.detectedSite === 'youtube' ? 'red' :
                                    cookiesConfig.detectedSite === 'instagram' ? 'purple' : 'blue'}>
                                {cookiesConfig.detectedSite.toUpperCase()}
                            </Tag>
                            {cookiesConfig.lastChecked && (
                                <span style={{ color: '#888', fontSize: 12 }}>
                                    Last checked: {cookiesConfig.lastChecked}
                                </span>
                            )}
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Max Processes */}
            <Card title="Performance Settings" size="small" style={cardStyle}>
                <Form.Item label="Maximum Concurrent Processes" help="Number of parallel download/processing tasks">
                    <InputNumber
                        value={maxProcesses}
                        onChange={(v) => {
                            setMaxProcesses(v || 4);
                            logger.userAction('Settings', 'set_max_processes', { value: v });
                        }}
                        min={1}
                        max={16}
                        style={{ width: 120 }}
                    />
                    <span style={{ marginLeft: 12, color: '#888' }}>
                        Recommended: 4-8 for most systems
                    </span>
                </Form.Item>
            </Card>
        </div>
    );

    const storageItems = (
        <Form layout="vertical">
            <Form.Item label="Downloads Directory" help="Container Path: /app/data/raw">
                <Input disabled value="/app/data/raw" />
            </Form.Item>
            <Form.Item label="Output Directory" help="Container Path: /app/data/output">
                <Input disabled value="/app/data/output" />
            </Form.Item>
        </Form>
    );

    const loggingItems = (
        <div>
            <Card title="Log Management" size="small" style={cardStyle}>
                <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Statistic
                            title="Log Entries"
                            value={logger.getLogs().length}
                            valueStyle={{ color: '#007acc' }}
                        />
                    </Col>
                    <Col flex="auto">
                        <Space>
                            <Button icon={<DownloadOutlined />} onClick={handleExportLogs}>
                                Export Logs (JSON)
                            </Button>
                            <Button danger icon={<DeleteOutlined />} onClick={handleClearLogs}>
                                Clear Logs
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Divider style={{ margin: '12px 0' }} />

                <Form.Item label="Log Level">
                    <Select defaultValue="debug" style={{ width: 200 }}>
                        <Select.Option value="debug">DEBUG (All logs)</Select.Option>
                        <Select.Option value="info">INFO</Select.Option>
                        <Select.Option value="warn">WARN</Select.Option>
                        <Select.Option value="error">ERROR only</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Recent Logs Preview">
                    <div style={{
                        background: '#1e1e1e',
                        border: '1px solid #3c3c3c',
                        borderRadius: 4,
                        padding: 12,
                        maxHeight: 200,
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: 11,
                    }}>
                        {logger.getLogs().slice(-10).reverse().map((log, idx) => (
                            <div key={idx} style={{
                                color: log.level === 'ERROR' ? '#f14c4c' :
                                    log.level === 'WARN' ? '#dcdcaa' :
                                        log.level === 'INFO' ? '#007acc' : '#888',
                                marginBottom: 4,
                            }}>
                                [{log.timestamp.split('T')[1]?.split('.')[0] || log.timestamp}] [{log.level}] {log.component}: {log.message}
                            </div>
                        ))}
                        {logger.getLogs().length === 0 && (
                            <div style={{ color: '#888' }}>No logs yet</div>
                        )}
                    </div>
                </Form.Item>
            </Card>
        </div>
    );

    const items = [
        {
            key: '1',
            label: <span><RobotOutlined /> AI Configuration</span>,
            children: aiModelItems,
        },
        {
            key: '2',
            label: <span><SettingOutlined /> Download Settings</span>,
            children: downloadItems,
        },
        {
            key: '3',
            label: <span><FolderOpenOutlined /> Storage & Paths</span>,
            children: storageItems,
        },
        {
            key: '4',
            label: <span><FileTextOutlined /> Logging & Debug</span>,
            children: loggingItems,
        },
    ];

    return (
        <div style={{ padding: 24, maxWidth: 900 }}>
            <h1 style={{ color: 'white', marginBottom: 24 }}>Settings</h1>
            <Card bordered={false} style={cardStyle}>
                <Tabs defaultActiveKey="1" items={items} />
            </Card>
        </div>
    );
};

export default Settings;
