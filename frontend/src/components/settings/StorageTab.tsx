import React, { useEffect, useState } from 'react';
import { Form, Input, Card, Descriptions, Progress, Spin, Button, Modal, message, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, FolderOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const StorageTab: React.FC = () => {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/system/status');
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleCleanup = (target: string, name: string) => {
        Modal.confirm({
            title: `Clean ${name}?`,
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete all files in ${name}? This action cannot be undone.`,
            okType: 'danger',
            onOk: async () => {
                try {
                    const res = await fetch('/api/v1/system/cleanup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ target })
                    });
                    if (res.ok) {
                        message.success(`Cleanup started for ${name}`);
                        setTimeout(fetchStatus, 2000); // Refresh stats
                    } else {
                        message.error('Cleanup failed');
                    }
                } catch (e) {
                    message.error('Error during cleanup');
                }
            }
        });
    };

    if (loading && !status) return <div style={{ padding: 20, textAlign: 'center' }}><Spin /></div>;

    // Fallback if status load failed but not loading
    const disk = status?.storage?.disk || { percent: 0, total_gb: 0, used_gb: 0, free_gb: 0, status: 'unknown' };
    const paths = status?.storage?.paths || {};
    const cookies = status?.cookies || { path: '', exists: false, valid: false };

    return (
        <div>
            {/* Disk Usage */}
            <Card title="Disk Usage" size="small" style={{ marginBottom: 16, background: '#252526', border: '1px solid #3c3c3c' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 12 }}>
                    <Progress
                        type="circle"
                        percent={disk.percent}
                        size={80}
                        status={disk.status === 'critical' ? 'exception' : 'normal'}
                        strokeColor={disk.status === 'critical' ? '#ff4d4f' : disk.status === 'warning' ? '#faad14' : '#52c41a'}
                    />
                    <Descriptions column={2} style={{ flex: 1 }}>
                        <Descriptions.Item label="Total Capacity">{disk.total_gb} GB</Descriptions.Item>
                        <Descriptions.Item label="Used Space">{disk.used_gb} GB</Descriptions.Item>
                        <Descriptions.Item label="Free Space">{disk.free_gb} GB</Descriptions.Item>
                        <Descriptions.Item label="Health Status">
                            <span style={{ color: disk.status === 'ok' ? '#52c41a' : disk.status === 'critical' ? '#ff4d4f' : '#faad14', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                {disk.status}
                            </span>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            </Card>

            {/* Paths */}
            <Card title="Storage Paths & Permissions" size="small" style={{ background: '#252526', border: '1px solid #3c3c3c', marginBottom: 16 }}>
                <Form layout="vertical">
                    {Object.entries(paths).map(([key, info]: [string, any]) => (
                        <Form.Item key={key} label={key.toUpperCase()} style={{ marginBottom: 12 }}>
                            <Input
                                prefix={<FolderOutlined style={{ color: '#888' }} />}
                                value={info.path}
                                readOnly
                                style={{ background: '#1e1e1e', color: '#d4d4d4', border: '1px solid #484848' }}
                                addonAfter={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {info.exists ?
                                            <span style={{ color: '#52c41a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <CheckCircleOutlined /> Exists
                                            </span> :
                                            <span style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <CloseCircleOutlined /> Docker Path Missing
                                            </span>
                                        }
                                        {info.writable !== undefined && (
                                            info.writable ?
                                                <span style={{ color: '#52c41a', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                                                    <CheckCircleOutlined /> Writable
                                                </span> :
                                                <span style={{ color: '#faad14', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                                                    <CloseCircleOutlined /> Read-only
                                                </span>
                                        )}
                                    </div>
                                }
                            />
                        </Form.Item>
                    ))}
                </Form>
            </Card>

            {/* Configuration Files */}
            <Card title="Configuration Files" size="small" style={{ background: '#252526', border: '1px solid #3c3c3c' }}>
                <Form layout="vertical">
                    <Form.Item label="Cookies File" help="Required for yt-dlp" style={{ marginBottom: 0 }}>
                        <Input
                            prefix={<FolderOutlined style={{ color: '#888' }} />}
                            value={cookies.path}
                            readOnly
                            style={{ background: '#1e1e1e', color: '#d4d4d4', border: '1px solid #484848' }}
                            addonAfter={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {cookies.exists ?
                                        <span style={{ color: '#52c41a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CheckCircleOutlined /> Exists
                                        </span> :
                                        <span style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CloseCircleOutlined /> Missing
                                        </span>
                                    }
                                    {cookies.valid ?
                                        <span style={{ color: '#52c41a', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                                            <CheckCircleOutlined /> Valid
                                        </span> :
                                        (cookies.exists && <span style={{ color: '#faad14', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                                            <CloseCircleOutlined /> Invalid/Empty
                                        </span>)
                                    }
                                </div>
                            }
                        />
                    </Form.Item>
                </Form>
            </Card>

            {/* Storage Operations */}
            <Card title="Storage Cleanup" size="small" style={{ background: '#252526', border: '1px solid #3c3c3c', marginTop: 16 }}>
                <p style={{ color: '#888', marginBottom: 16 }}>
                    Manage disk space by cleaning up temporary files or old data.
                    Note: Files are strictly contained within the project's data directory.
                </p>
                <Space wrap>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleCleanup('temp', 'Temporary Files')}>
                        Clean Temp
                    </Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleCleanup('raw', 'Raw Downloads')}>
                        Clean Downloads
                    </Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleCleanup('output', 'Output Files')}>
                        Clean Output
                    </Button>
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleCleanup('all', 'ALL DATA')}>
                        Clean All Data
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default StorageTab;
