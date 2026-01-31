import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Alert, Upload, Space, Statistic, Row, Col, message } from 'antd';
import { InboxOutlined, SaveOutlined, PlayCircleOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;

const getApiUrl = () => 'http://localhost:8000/api/v1';

interface BatchStatus {
    content: string;
    count: number;
    updated_at: string | null;
    file_exists?: boolean;
}

const BatchDownloadTab: React.FC = () => {
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<BatchStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [running, setRunning] = useState(false);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${getApiUrl()}/download/batch/content`);
            setContent(response.data.content || '');
            setStatus(response.data);
        } catch (error) {
            console.error('Failed to fetch batch content:', error);
            message.error('Failed to load batch links');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.post(`${getApiUrl()}/download/batch/content`, { content });
            setStatus(prev => ({
                ...prev,
                count: response.data.count,
                updated_at: response.data.updated_at
            } as BatchStatus));
            message.success(`Saved ${response.data.count} links`);
        } catch (error) {
            console.error('Failed to save batch content:', error);
            message.error('Failed to save batch links');
        } finally {
            setSaving(false);
        }
    };

    const handleRun = async () => {
        setRunning(true);
        try {
            const response = await axios.post(`${getApiUrl()}/download/batch/run`);
            message.success(`Submitted ${response.data.count} download tasks`);
        } catch (error: unknown) {
            console.error('Failed to run batch download:', error);
            const errMsg = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to run batch download';
            message.error(errMsg);
        } finally {
            setRunning(false);
        }
    };

    const handleClear = () => {
        setContent('');
    };

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${getApiUrl()}/download/batch/upload`, formData);
            message.success(`Uploaded ${response.data.count} links`);
            fetchContent(); // Refresh content
        } catch (error) {
            console.error('Failed to upload file:', error);
            message.error('Failed to upload file');
        }

        return false; // Prevent default upload behavior
    };

    const countLines = (text: string) => {
        if (!text.trim()) return 0;
        return text.split('\n').filter(line => line.trim() && !line.trim().startsWith('#')).length;
    };

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            <Card bordered={false} style={{ background: '#141414', marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Statistic
                            title="Links Count"
                            value={countLines(content)}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Saved Count"
                            value={status?.count || 0}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Last Updated"
                            value={status?.updated_at ? new Date(status.updated_at).toLocaleString() : 'Never'}
                            valueStyle={{ color: '#888', fontSize: 14 }}
                        />
                    </Col>
                </Row>
            </Card>

            <Alert
                message="Batch Download Mode"
                description="Enter one URL per line. Lines starting with # are treated as comments. Save to persist, then click Run to start downloading all URLs."
                type="info"
                showIcon
                style={{ marginBottom: 16, background: '#1f1f1f', border: '1px solid #303030' }}
            />

            <Card
                title="Links Editor"
                bordered={false}
                style={{ background: '#141414', marginBottom: 16 }}
                extra={
                    <Button icon={<ReloadOutlined />} onClick={fetchContent} loading={loading} size="small">
                        Refresh
                    </Button>
                }
            >
                <TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    placeholder={`https://www.tiktok.com/@user/video/123456\nhttps://www.youtube.com/watch?v=abcdef\n# This is a comment line`}
                    style={{
                        fontFamily: 'monospace',
                        background: '#000',
                        color: '#0f0',
                        border: '1px solid #333',
                        marginBottom: 16
                    }}
                />

                <Upload.Dragger
                    accept=".txt"
                    showUploadList={false}
                    beforeUpload={handleUpload}
                    style={{ background: '#1e1e1e', borderColor: '#3c3c3c' }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text" style={{ color: '#d4d4d4' }}>
                        Click or drag links.txt file to upload
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#888' }}>
                        File will replace current content
                    </p>
                </Upload.Dragger>
            </Card>

            <Space size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                    icon={<DeleteOutlined />}
                    onClick={handleClear}
                    danger
                >
                    Clear
                </Button>
                <Button
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                >
                    Save
                </Button>
                <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleRun}
                    loading={running}
                    disabled={countLines(content) === 0}
                    size="large"
                >
                    Run Batch Download ({countLines(content)} URLs)
                </Button>
            </Space>
        </div>
    );
};

export default BatchDownloadTab;
