import React from 'react';
import { Card, Row, Col, InputNumber, Checkbox, Typography } from 'antd';

const { Text } = Typography;

export interface ClipSettings {
    minDuration: number;
    maxDuration: number;
    scoreThreshold: number;
    maxClips: number;
    highlightFrames: number;
    generateDescription: boolean;
}

interface ProcessClipSettingsProps {
    clipSettings: ClipSettings;
    setClipSettings: React.Dispatch<React.SetStateAction<ClipSettings>>;
}

const cardStyle = {
    background: '#252526',
    border: '1px solid #3c3c3c',
    marginBottom: 16,
};

const ProcessClipSettings: React.FC<ProcessClipSettingsProps> = ({ clipSettings, setClipSettings }) => {
    return (
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
    );
};

export default ProcessClipSettings;
