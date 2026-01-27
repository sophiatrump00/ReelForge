import React from 'react';
import { Card, Button, Space, List, Tag, Progress, Empty, Typography } from 'antd';
import { PauseCircleOutlined, StopOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { metaPlacements } from './ProcessPlacementSelector';

const { Text } = Typography;

export interface ProcessTask {
    id: string;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    placements: string[];
}

interface ProcessQueueProps {
    tasks: ProcessTask[];
}

const cardStyle = {
    background: '#252526',
    border: '1px solid #3c3c3c',
    marginBottom: 16,
};

const getStatusTag = (status: ProcessTask['status']) => {
    switch (status) {
        case 'processing':
            return <Tag color="processing">Processing</Tag>;
        case 'completed':
            return <Tag color="success">Completed</Tag>;
        case 'failed':
            return <Tag color="error">Failed</Tag>;
        default:
            return <Tag>Pending</Tag>;
    }
};

const ProcessQueue: React.FC<ProcessQueueProps> = ({ tasks }) => {
    return (
        <Card
            title="Processing Queue"
            style={cardStyle}
            extra={
                <Space>
                    <Button size="small" icon={<PauseCircleOutlined />}>Pause</Button>
                    <Button size="small" danger icon={<StopOutlined />}>Clear</Button>
                </Space>
            }
        >
            {tasks.length > 0 ? (
                <List
                    dataSource={tasks}
                    renderItem={(task) => (
                        <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #3c3c3c' }}>
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Space>
                                        <VideoCameraOutlined />
                                        <Text>{task.name}</Text>
                                    </Space>
                                    {getStatusTag(task.status)}
                                </div>
                                {task.status === 'processing' && (
                                    <Progress percent={task.progress} size="small" strokeColor="#007acc" />
                                )}
                                <div style={{ marginTop: 4 }}>
                                    {task.placements.map((p) => {
                                        const placement = metaPlacements.find((mp) => mp.id === p);
                                        return (
                                            <Tag key={p} style={{ fontSize: 10, margin: 2 }}>
                                                {placement?.name || p}
                                            </Tag>
                                        );
                                    })}
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            ) : (
                <Empty description="No tasks in queue" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </Card>
    );
};

export default ProcessQueue;
