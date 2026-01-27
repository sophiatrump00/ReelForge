import React, { useState } from 'react';
import {
    Card,
    Typography,
    Checkbox,
    Radio,
    Button,
    Space,
    Row,
    Col,
    Input,
    Switch,
    message,
    Alert,
} from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import logger from '../utils/logger';
import ProcessPlacementSelector from '../components/process/ProcessPlacementSelector';
import ProcessClipSettings, { ClipSettings } from '../components/process/ProcessClipSettings';
import ProcessQueue, { ProcessTask } from '../components/process/ProcessQueue';

const { Title, Text } = Typography;

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
    const [clipSettings, setClipSettings] = useState<ClipSettings>({
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

    const handleTogglePlacement = (id: string) => {
        logger.userAction('Process', 'toggle_placement', { placement: id });
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
                    <ProcessPlacementSelector
                        selectedPlacements={selectedPlacements}
                        setSelectedPlacements={setSelectedPlacements}
                        exportHighlightFrames={exportHighlightFrames}
                        setExportHighlightFrames={setExportHighlightFrames}
                        onTogglePlacement={handleTogglePlacement}
                    />

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
                    <ProcessClipSettings clipSettings={clipSettings} setClipSettings={setClipSettings} />

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
                    <ProcessQueue tasks={processingTasks} />

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
