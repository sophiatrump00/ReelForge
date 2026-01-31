import React, { useState } from 'react';
import {
    Card,
    Typography,
    Button,
    Row,
    Col,
    Input,
    message,
    Alert,
} from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import logger from '../utils/logger';
import ProcessPlacementSelector from '../components/process/ProcessPlacementSelector';
import ProcessClipSettings from '../components/process/ProcessClipSettings';
import type { ClipSettings } from '../components/process/ProcessClipSettings';
import ProcessQueue from '../components/process/ProcessQueue';
import type { ProcessTask } from '../components/process/ProcessQueue';
import CropStrategySelector from '../components/process/CropStrategySelector';
import type { CropStrategyState } from '../components/process/CropStrategySelector';
import KeywordDetectionPanel from '../components/process/KeywordDetectionPanel';
import type { KeywordDetectionState } from '../components/process/KeywordDetectionPanel';
import NamingTemplatePanel from '../components/process/NamingTemplatePanel';

const { Title, Text } = Typography;

const Process: React.FC = () => {
    // Placement Selection
    const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
    const [exportHighlightFrames, setExportHighlightFrames] = useState(true);

    // Crop Strategy
    const [cropStrategy, setCropStrategy] = useState<CropStrategyState>({
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
    const [keywordDetection, setKeywordDetection] = useState<KeywordDetectionState>({
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

    // AI Ad Goal
    const [adGoal, setAdGoal] = useState('');

    const startProcessing = () => {
        logger.userAction('Process', 'start_processing', {
            placements: selectedPlacements,
            exportHighlightFrames,
            clipSettings,
            adGoal // Log adGoal
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
                    <CropStrategySelector cropStrategy={cropStrategy} setCropStrategy={setCropStrategy} />

                    {/* Auto-clip Settings */}
                    <ProcessClipSettings clipSettings={clipSettings} setClipSettings={setClipSettings} />

                    {/* AI Ad Goal Filtering */}
                    <Card title="AI Ad Goal Filtering" style={cardStyle}>
                        <Input.TextArea
                            rows={3}
                            placeholder="e.g. Promote purchase website, Showcase outdoor hiking gear"
                            value={adGoal}
                            onChange={(e) => setAdGoal(e.target.value)}
                            style={{ marginBottom: 8 }}
                        />
                        <div style={{ color: '#666', fontSize: 12 }}>
                            Optional: If keywords don't match, AI will use this goal to decide whether to keep the video.
                        </div>
                    </Card>

                    {/* Keyword Detection */}
                    <KeywordDetectionPanel keywordDetection={keywordDetection} setKeywordDetection={setKeywordDetection} />

                    {/* Naming Template */}
                    <NamingTemplatePanel namingTemplate={namingTemplate} setNamingTemplate={setNamingTemplate} />
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
