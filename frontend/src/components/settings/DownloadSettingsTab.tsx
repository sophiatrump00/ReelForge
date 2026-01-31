import React from 'react';
import { Form, Input, Button, Card, Alert, Upload, Tag, Row, Col, Space, InputNumber } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InboxOutlined } from '@ant-design/icons';
import logger from '../../utils/logger';

const { TextArea } = Input;

export interface CookiesConfig {
    path: string;
    content: string;
    detectedSite: string;
    isValid: boolean;
    lastChecked: string | null;
}

interface DownloadSettingsTabProps {
    cookiesConfig: CookiesConfig;
    setCookiesConfig: React.Dispatch<React.SetStateAction<CookiesConfig>>;
    maxProcesses: number;
    setMaxProcesses: React.Dispatch<React.SetStateAction<number>>;
    checkingCookies: boolean;
    onCheckCookies: () => void;
    onCookiesUpload: (file: File) => boolean;
    detectSiteFromCookies: (content: string) => string;
    pendingCookieFile: File | null;
    onUpdateCookies: () => void;
    isUpdatingCookies: boolean;
}

const cardStyle = {
    background: '#252526',
    border: '1px solid #3c3c3c',
    marginBottom: 16,
};

const DownloadSettingsTab: React.FC<DownloadSettingsTabProps> = ({
    cookiesConfig,
    setCookiesConfig,
    maxProcesses,
    setMaxProcesses,
    checkingCookies,
    onCheckCookies,
    onCookiesUpload,
    detectSiteFromCookies,
    pendingCookieFile,
    onUpdateCookies,
    isUpdatingCookies,
}) => {
    return (
        <div>
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

                <Upload.Dragger
                    accept=".txt"
                    showUploadList={false}
                    beforeUpload={onCookiesUpload}
                    style={{ marginBottom: 16, background: '#1e1e1e', borderColor: '#3c3c3c' }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: '#0969da' }} />
                    </p>
                    <p className="ant-upload-text" style={{ color: '#d4d4d4' }}>Click or drag cookies.txt file to this area to upload</p>
                    <p className="ant-upload-hint" style={{ color: '#888' }}>
                        Supports Netscape HTTP Cookie File format
                    </p>
                    {pendingCookieFile && (
                        <div style={{ marginTop: 8, color: '#52c41a' }}>
                            <CheckCircleOutlined /> Staged: {pendingCookieFile.name}
                        </div>
                    )}
                </Upload.Dragger>

                <Row gutter={16} align="middle">
                    <Col>
                        <Space>
                            <Button
                                type="primary"
                                onClick={onUpdateCookies}
                                loading={isUpdatingCookies}
                                disabled={!pendingCookieFile && !cookiesConfig.content}
                            >
                                Confirm Update
                            </Button>
                            <Button
                                onClick={onCheckCookies}
                                loading={checkingCookies}
                            >
                                Validate Schema
                            </Button>
                        </Space>
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

            <Card title="Proxy Configuration" size="small" style={cardStyle}>
                <Alert
                    message="Optional"
                    description="Configure a proxy server for yt-dlp downloads. Leave empty if not needed."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16, background: '#1e1e1e', border: '1px solid #4ec9b0' }}
                />
                <Form.Item label="Proxy URL" help="e.g., socks5://127.0.0.1:1080 or http://proxy.example.com:8080">
                    <Input
                        placeholder="socks5://127.0.0.1:1080"
                        style={{ fontFamily: 'monospace' }}
                    />
                </Form.Item>
            </Card>
        </div>
    );
};

export default DownloadSettingsTab;
