import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin, Empty } from 'antd';
import { CloudDownloadOutlined, CheckCircleOutlined, SyncOutlined, DatabaseOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import logger from '../utils/logger';

const getApiUrl = () => 'http://localhost:8000/api/v1';

interface DashboardStats {
    total_downloads: number;
    processing: number;
    completed: number;
    storage_usage: string;
    activity: Array<{
        name: string;
        downloads: number;
        processed: number;
    }>;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            logger.apiRequest('Dashboard', 'GET', '/api/v1/dashboard/stats');
            try {
                const response = await axios.get(`${getApiUrl()}/dashboard/stats`);
                setStats(response.data);
                logger.apiResponse('Dashboard', 'GET', '/api/v1/dashboard/stats', 200);
            } catch (error) {
                logger.apiError('Dashboard', 'GET', '/api/v1/dashboard/stats', error as Error);
                // Fallback to zero-data if backend isn't ready
                setStats({
                    total_downloads: 0,
                    processing: 0,
                    completed: 0,
                    storage_usage: '0%',
                    activity: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><Spin size="large" /></div>;

    const data = stats?.activity || [];

    const cardStyle = {
        background: '#252526',
        border: '1px solid #3c3c3c',
    };

    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ color: 'white', marginBottom: 24 }}>Dashboard</h1>
            <Row gutter={16}>
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic
                            title="Total Downloads"
                            value={stats?.total_downloads || 0}
                            prefix={<CloudDownloadOutlined />}
                            valueStyle={{ color: '#4ec9b0' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic
                            title="Processing"
                            value={stats?.processing || 0}
                            prefix={<SyncOutlined spin={stats?.processing > 0} />}
                            valueStyle={{ color: '#007acc' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic
                            title="Completed"
                            value={stats?.completed || 0}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#4ec9b0' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={cardStyle}>
                        <Statistic
                            title="Storage Usage"
                            value={stats?.storage_usage || '0%'}
                            prefix={<DatabaseOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Activity Overview" bordered={false} style={cardStyle}>
                        <div style={{ height: 300, background: '#1e1e1e', borderRadius: 4, padding: 16 }}>
                            {data.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" opacity={0.3} />
                                        <XAxis dataKey="name" stroke="#888" />
                                        <YAxis stroke="#888" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#252526',
                                                border: '1px solid #3c3c3c',
                                                color: '#d4d4d4'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="downloads" fill="#007acc" name="Downloads" />
                                        <Bar dataKey="processed" fill="#4ec9b0" name="Processed" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Empty
                                        description="No activity data yet"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
