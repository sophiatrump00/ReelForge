import React, { useState } from 'react';
import {
    Card,
    Typography,
    Checkbox,
    Radio,
    InputNumber,
    Button,
    Space,
    Divider,
    Row,
    Col,
    Input,
    Progress,
    List,
    Tag,
    Switch,
    message,
    Alert,
    Empty,
} from 'antd';
import {
    ThunderboltOutlined,
    PauseCircleOutlined,
    StopOutlined,
    FileImageOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import logger from '../utils/logger';

const { Title, Text } = Typography;

// Meta Placement Definitions
const metaPlacements = [
    { id: 'feed_1x1', name: 'Feed Square', ratio: '1:1', resolution: '1080×1080', types: ['video', 'image'], icon: '⬛', description: 'Facebook/Instagram Feed' },
    { id: 'feed_4x5', name: 'Feed Portrait', ratio: '4:5', resolution: '1080×1350', types: ['video', 'image'], icon: '📱', description: 'Instagram Feed Optimal' },
    { id: 'stories_9x16', name: 'Stories/Reels', ratio: '9:16', resolution: '1080×1920', types: ['video', 'image'], icon: '📲', description: 'Instagram Stories / Reels' },
    { id: 'instream_16x9', name: 'In-Stream Video', ratio: '16:9', resolution: '1920×1080', types: ['video'], icon: '🖥️', description: 'Facebook In-Stream Ads' },
    { id: 'right_column', name: 'Right Column', ratio: '1.91:1', resolution: '1200×628', types: ['image'], icon: '📰', description: 'Facebook Right Column' },
    { id: 'carousel', name: 'Carousel Card', ratio: '1:1', resolution: '1080×1080', types: ['video', 'image'], icon: '🎠', description: 'Carousel Ad Card' },
    { id: 'marketplace', name: 'Marketplace', ratio: '1:1', resolution: '1080×1080', types: ['video', 'image'], icon: '🛒', description: 'Facebook Marketplace' },
    { id: 'search', name: 'Search Results', ratio: '1.91:1', resolution: '1200×628', types: ['image'], icon: '🔍', description: 'Facebook Search' },
];

interface ProcessTask {
    id: string;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    placements: string[];
}

const Process: React.FC = () => {
    // Placement Selection
    const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
    const [exportHighlightFrames, setExportHighlightFrames] = useState(true);

    // Crop Strategy
    const [cropStrategy, setCropStrategy] = useState({
        '1x1': 'ai_smart',
        '4x5': 'top_align',
        '16x9': 'blur_bg',
    });

    // Auto-clip Settings
    const [clipSettings, setClipSettings] = useState({
        minDuration: 5,
        maxDuration: 60,
        scoreThreshold: 7,
        maxClips: 10,
        highlightFrames: 3,
        generateDescription: true,
    });

    // Keyword Detection
    const [keywordDetection, setKeywordDetection] = useState({
        enabled: true,
        removeNegative: true,
        keepPositive: true,
    });

    // Naming Template
    const [namingTemplate, setNamingTemplate] = useState('{source}_{date}_{seq}_{placement}_{tag}');

    // Processing Queue (initially empty)
    const [processingTasks] = useState<ProcessTask[]>([]);

    const cardStyle = {
        background: '#252526',
        border: '1px solid #3c3c3c',
        marginBottom: 16,
    };

    const startProcessing = () => {
        logger.userAction('Process', 'start_processing', {
            placements: selectedPlacements,
            exportHighlightFrames,
            clipSettings
        });
        message.info('Processing task submitted to queue');
    };

    const getTypeTag = (types: string[]) => {
        if (types.includes('video') && types.includes('image')) {
            return <Tag color="blue">Video + Image</Tag>;
        } else if (types.includes('video')) {
            return <Tag color="green">Video Only</Tag>;
        } else {
            return <Tag color="orange">Image Only</Tag>;
        }
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

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>
                Process Center
            </Title>

            <Row gutter={[16, 16]}>
                {/* Left Column - Configuration */}
                <Col xs={24} lg={14}>
                    {/* Placement Selection */}
                    <Card
                        title="Output Placements (Multi-select)"
                        style={cardStyle}
                        extra={<Text type="secondary">{selectedPlacements.length} selected</Text>}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {metaPlacements.map((p) => (
                                <div
                                    key={p.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        background: selectedPlacements.includes(p.id) ? 'rgba(0, 122, 204, 0.15)' : '#1e1e1e',
                                        border: `1px solid ${selectedPlacements.includes(p.id) ? '#007acc' : '#3c3c3c'}`,
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                        if (selectedPlacements.includes(p.id)) {
                                            setSelectedPlacements(selectedPlacements.filter((id) => id !== p.id));
                                        } else {
                                            setSelectedPlacements([...selectedPlacements, p.id]);
                                        }
                                        logger.userAction('Process', 'toggle_placement', { placement: p.id });
                                    }}
                                >
                                    <Checkbox checked={selectedPlacements.includes(p.id)} />
                                    <span style={{ marginLeft: 12, fontSize: 18 }}>{p.icon}</span>
                                    <div style={{ marginLeft: 12, flex: 1 }}>
                                        <Text strong>{p.name}</Text>
                                        <Text type="secondary" style={{ marginLeft: 8 }}>{p.ratio} ({p.resolution})</Text>
                                    </div>
                                    {getTypeTag(p.types)}
                                </div>
                            ))}
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        <Checkbox
                            checked={exportHighlightFrames}
                            onChange={(e) => setExportHighlightFrames(e.target.checked)}
                        >
                            <Space>
                                <FileImageOutlined />
                                <span>Export highlight frames (per placement)</span>
                            </Space>
                        </Checkbox>
                    </Card>

                    {/* Crop Strategy */}
                    <Card title="Crop Strategy" style={cardStyle}>
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>9:16 → 1:1</Text>
                                <Radio.Group
                                    value={cropStrategy['1x1']}
                                    onChange={(e) => setCropStrategy({ ...cropStrategy, '1x1': e.target.value })}
                                >
                                    <Space direction="vertical">
                                        <Radio value="center">Center Crop</Radio>
                                        <Radio value="ai_smart">AI Smart Crop</Radio>
                                        <Radio value="manual">Manual</Radio>
                                    </Space>
                                </Radio.Group>
                            </Col>
                            <Col span={8}>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>9:16 → 4:5</Text>
                                <Radio.Group
                                    value={cropStrategy['4x5']}
                                    onChange={(e) => setCropStrategy({ ...cropStrategy, '4x5': e.target.value })}
                                >
                                    <Space direction="vertical">
                                        <Radio value="top_align">Top Align</Radio>
                                        <Radio value="center">Center Crop</Radio>
                                        <Radio value="ai_smart">AI Smart Crop</Radio>
                                    </Space>
                                </Radio.Group>
                            </Col>
                            <Col span={8}>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>9:16 → 16:9</Text>
                                <Radio.Group
                                    value={cropStrategy['16x9']}
                                    onChange={(e) => setCropStrategy({ ...cropStrategy, '16x9': e.target.value })}
                                >
                                    <Space direction="vertical">
                                        <Radio value="blur_bg">Blur Background</Radio>
                                        <Radio value="pip">Picture-in-Picture</Radio>
                                        <Radio value="solid_bg">Solid Background</Radio>
                                    </Space>
                                </Radio.Group>
                            </Col>
                        </Row>
                    </Card>

                    {/* Auto-clip Settings */}
                    <Card title="Auto-clip Settings" style={cardStyle}>
                        <Row gutter={[24, 16]}>
                            <Col span={8}>
                                <Text type="secondary">Min Clip Duration</Text>
                                <div style={{ marginTop: 4 }}>
                                    <InputNumber
                                        value={clipSettings.minDuration}
                                        onChange={(v) => setClipSettings({ ...clipSettings, minDuration: v || 5 })}
                                        addonAfter="sec"
                                        min={1}
                                        max={30}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <Text type="secondary">Max Clip Duration</Text>
                                <div style={{ marginTop: 4 }}>
                                    <InputNumber
                                        value={clipSettings.maxDuration}
                                        onChange={(v) => setClipSettings({ ...clipSettings, maxDuration: v || 60 })}
                                        addonAfter="sec"
                                        min={10}
                                        max={180}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <Text type="secondary">Score Threshold</Text>
                                <div style={{ marginTop: 4 }}>
                                    <InputNumber
                                        value={clipSettings.scoreThreshold}
                                        onChange={(v) => setClipSettings({ ...clipSettings, scoreThreshold: v || 7 })}
                                        addonAfter="/10"
                                        min={1}
                                        max={10}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <Text type="secondary">Max Clips/Video</Text>
                                <div style={{ marginTop: 4 }}>
                                    <InputNumber
                                        value={clipSettings.maxClips}
                                        onChange={(v) => setClipSettings({ ...clipSettings, maxClips: v || 10 })}
                                        min={1}
                                        max={50}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <Text type="secondary">Highlight Frames/Clip</Text>
                                <div style={{ marginTop: 4 }}>
                                    <InputNumber
                                        value={clipSettings.highlightFrames}
                                        onChange={(v) => setClipSettings({ ...clipSettings, highlightFrames: v || 3 })}
                                        min={1}
                                        max={10}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ marginTop: 24 }}>
                                    <Checkbox
                                        checked={clipSettings.generateDescription}
                                        onChange={(e) => setClipSettings({ ...clipSettings, generateDescription: e.target.checked })}
                                    >
                                        Generate Descriptions
                                    </Checkbox>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    {/* Keyword Detection */}
                    <Card
                        title={
                            <Space>
                                <span>Keyword Detection</span>
                                <Switch
                                    size="small"
                                    checked={keywordDetection.enabled}
                                    onChange={(v) => setKeywordDetection({ ...keywordDetection, enabled: v })}
                                />
                            </Space>
                        }
                        style={cardStyle}
                    >
                        {keywordDetection.enabled ? (
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Checkbox
                                        checked={keywordDetection.removeNegative}
                                        onChange={(e) => setKeywordDetection({ ...keywordDetection, removeNegative: e.target.checked })}
                                    >
                                        <Text type="danger">Auto-remove competitor segments</Text>
                                    </Checkbox>
                                    <div style={{ color: '#666', fontSize: 12, marginLeft: 24 }}>
                                        Automatically trim segments containing negative keywords
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Checkbox
                                        checked={keywordDetection.keepPositive}
                                        onChange={(e) => setKeywordDetection({ ...keywordDetection, keepPositive: e.target.checked })}
                                    >
                                        <Text style={{ color: '#4ec9b0' }}>Keep brand segments</Text>
                                    </Checkbox>
                                    <div style={{ color: '#666', fontSize: 12, marginLeft: 24 }}>
                                        Prioritize segments with positive keywords
                                    </div>
                                </Col>
                            </Row>
                        ) : (
                            <Text type="secondary">Keyword detection disabled</Text>
                        )}
                    </Card>

                    {/* Naming Template */}
                    <Card title="Output Naming Template" style={cardStyle}>
                        <Input
                            value={namingTemplate}
                            onChange={(e) => setNamingTemplate(e.target.value)}
                            placeholder="{source}_{date}_{seq}_{placement}_{tag}"
                            style={{ marginBottom: 12 }}
                        />
                        <div style={{ color: '#666', fontSize: 12 }}>
                            Variables: <code>{'{source}'}</code> <code>{'{creator}'}</code> <code>{'{date}'}</code> <code>{'{time}'}</code> <code>{'{seq}'}</code> <code>{'{placement}'}</code> <code>{'{tag}'}</code> <code>{'{score}'}</code>
                        </div>
                        <div style={{ marginTop: 8, padding: 8, background: '#1e1e1e', borderRadius: 4, fontFamily: 'monospace' }}>
                            Example: <Text code>tiktok_20260127_001_feed1x1_unboxing.mp4</Text>
                        </div>
                    </Card>
                </Col>

                {/* Right Column - Queue and Actions */}
                <Col xs={24} lg={10}>
                    {/* Action Panel */}
                    <Card style={{ ...cardStyle, background: '#007acc', border: 'none' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ThunderboltOutlined />}
                                onClick={startProcessing}
                                disabled={selectedPlacements.length === 0}
                                style={{
                                    width: '100%',
                                    height: 48,
                                    fontSize: 16,
                                    background: '#fff',
                                    color: '#007acc',
                                }}
                            >
                                Start Processing
                            </Button>
                            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
                                Output to <Text strong style={{ color: '#fff' }}>{selectedPlacements.length}</Text> placements
                                {exportHighlightFrames && ' + highlight frames'}
                            </div>
                        </div>
                    </Card>

                    {/* Processing Queue */}
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
                        {processingTasks.length > 0 ? (
                            <List
                                dataSource={processingTasks}
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

                    {/* Quick Stats */}
                    <Card title="Processing Stats" style={cardStyle}>
                        <Row gutter={[16, 16]}>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4ec9b0' }}>0</div>
                                <Text type="secondary">Completed</Text>
                            </Col>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#007acc' }}>0</div>
                                <Text type="secondary">Processing</Text>
                            </Col>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dcdcaa' }}>0</div>
                                <Text type="secondary">Pending</Text>
                            </Col>
                        </Row>
                    </Card>

                    <Alert
                        message="Tip"
                        description="Select materials and click Start Processing. The system will automatically convert placements, detect keywords, and extract highlight frames."
                        type="info"
                        showIcon
                        style={{ background: '#1e1e1e', border: '1px solid #3c3c3c' }}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default Process;
