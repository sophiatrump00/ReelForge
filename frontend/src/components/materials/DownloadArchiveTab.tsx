import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Input, Button, Space, Statistic, Row, Col, message, Popconfirm, Tag } from 'antd';
import { ReloadOutlined, DeleteOutlined, ExportOutlined, SyncOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import type { ColumnsType } from 'antd/es/table';

const getApiUrl = () => 'http://localhost:8000/api/v1';

interface ArchiveEntry {
    id: number;
    video_id: string;
    platform: string;
    title: string | null;
    uploader: string | null;
    downloaded_at: string | null;
}

interface ArchiveStatus {
    total: number;
    last_downloaded_at: string | null;
    file_exists: boolean;
}

const DownloadArchiveTab: React.FC = () => {
    const [entries, setEntries] = useState<ArchiveEntry[]>([]);
    const [status, setStatus] = useState<ArchiveStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [search, setSearch] = useState('');

    const fetchEntries = useCallback(async (skip = 0, searchTerm = '') => {
        setLoading(true);
        try {
            const response = await axios.get(`${getApiUrl()}/materials/archive`, {
                params: { skip, limit: pageSize, search: searchTerm || undefined }
            });
            setEntries(response.data.entries);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch archive entries:', error);
            message.error('Failed to load archive');
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await axios.get(`${getApiUrl()}/materials/archive/status`);
            setStatus(response.data);
        } catch (error) {
            console.error('Failed to fetch archive status:', error);
        }
    }, []);

    useEffect(() => {
        fetchEntries();
        fetchStatus();
    }, [fetchEntries, fetchStatus]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchEntries((newPage - 1) * pageSize, search);
    };

    const handleSearch = () => {
        setPage(1);
        fetchEntries(0, search);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${getApiUrl()}/materials/archive/${id}`);
            message.success('Entry deleted');
            fetchEntries((page - 1) * pageSize, search);
            fetchStatus();
        } catch (error) {
            console.error('Failed to delete entry:', error);
            message.error('Failed to delete entry');
        }
    };

    const handleClearAll = async () => {
        try {
            const response = await axios.delete(`${getApiUrl()}/materials/archive`);
            message.success(`Cleared ${response.data.count} entries`);
            setEntries([]);
            setTotal(0);
            fetchStatus();
        } catch (error) {
            console.error('Failed to clear archive:', error);
            message.error('Failed to clear archive');
        }
    };

    const handleSync = async () => {
        try {
            const response = await axios.post(`${getApiUrl()}/materials/archive/sync`);
            message.success(`Synced ${response.data.added} new entries from file`);
            fetchEntries((page - 1) * pageSize, search);
            fetchStatus();
        } catch (error) {
            console.error('Failed to sync archive:', error);
            message.error('Failed to sync archive');
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`${getApiUrl()}/materials/archive/export`);
            message.success(`Exported to ${response.data.path}`);
        } catch (error) {
            console.error('Failed to export archive:', error);
            message.error('Failed to export archive');
        }
    };

    const getPlatformColor = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'tiktok': return 'magenta';
            case 'youtube': return 'red';
            case 'instagram': return 'purple';
            case 'twitter': return 'blue';
            default: return 'default';
        }
    };

    const columns: ColumnsType<ArchiveEntry> = [
        {
            title: 'Platform',
            dataIndex: 'platform',
            key: 'platform',
            width: 100,
            render: (platform: string) => (
                <Tag color={getPlatformColor(platform)}>{platform.toUpperCase()}</Tag>
            )
        },
        {
            title: 'Video ID',
            dataIndex: 'video_id',
            key: 'video_id',
            ellipsis: true,
            render: (id: string) => (
                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{id}</span>
            )
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (title: string | null) => title || '-'
        },
        {
            title: 'Uploader',
            dataIndex: 'uploader',
            key: 'uploader',
            width: 150,
            ellipsis: true,
            render: (uploader: string | null) => uploader || '-'
        },
        {
            title: 'Downloaded At',
            dataIndex: 'downloaded_at',
            key: 'downloaded_at',
            width: 180,
            render: (date: string | null) => date ? new Date(date).toLocaleString() : '-'
        },
        {
            title: 'Action',
            key: 'action',
            width: 80,
            render: (_, record) => (
                <Popconfirm
                    title="Delete this entry?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
            )
        }
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card bordered={false} style={{ background: '#141414', marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Statistic
                            title="Total Entries"
                            value={status?.total || 0}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Last Downloaded"
                            value={status?.last_downloaded_at ? new Date(status.last_downloaded_at).toLocaleString() : 'Never'}
                            valueStyle={{ color: '#888', fontSize: 14 }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Archive File"
                            value={status?.file_exists ? 'Exists' : 'Not Found'}
                            valueStyle={{ color: status?.file_exists ? '#52c41a' : '#f5222d', fontSize: 14 }}
                        />
                    </Col>
                </Row>
            </Card>

            <Card
                title="Download Archive"
                bordered={false}
                style={{ background: '#141414', flex: 1, display: 'flex', flexDirection: 'column' }}
                extra={
                    <Space>
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ width: 200 }}
                            suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: 'pointer' }} />}
                        />
                        <Button icon={<ReloadOutlined />} onClick={() => { fetchEntries((page - 1) * pageSize, search); fetchStatus(); }} loading={loading}>
                            Refresh
                        </Button>
                        <Button icon={<SyncOutlined />} onClick={handleSync}>
                            Sync from File
                        </Button>
                        <Button icon={<ExportOutlined />} onClick={handleExport}>
                            Export
                        </Button>
                        <Popconfirm
                            title="Clear all entries? This cannot be undone."
                            onConfirm={handleClearAll}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Clear All
                            </Button>
                        </Popconfirm>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={entries}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                        onChange: handlePageChange,
                        showSizeChanger: false,
                        showTotal: (total) => `Total ${total} entries`
                    }}
                    size="small"
                    style={{ flex: 1 }}
                />
            </Card>
        </div>
    );
};

export default DownloadArchiveTab;
