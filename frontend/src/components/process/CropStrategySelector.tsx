import React from 'react';
import { Card, Row, Col, Radio, Typography, Space } from 'antd';
import type { RadioChangeEvent } from 'antd';

const { Text } = Typography;

export interface CropStrategyState {
    '1x1': string;
    '4x5': string;
    '16x9': string;
}

interface CropStrategySelectorProps {
    cropStrategy: CropStrategyState;
    setCropStrategy: React.Dispatch<React.SetStateAction<CropStrategyState>>;
}

const CropStrategySelector: React.FC<CropStrategySelectorProps> = ({ cropStrategy, setCropStrategy }) => {
    const cardStyle = {
        background: '#252526',
        border: '1px solid #3c3c3c',
        marginBottom: 16,
    };

    const handleStrategyChange = (ratio: keyof CropStrategyState, value: string) => {
        setCropStrategy(prev => ({ ...prev, [ratio]: value }));
    };

    return (
        <Card title="Crop Strategy" style={cardStyle}>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>9:16 → 1:1</Text>
                    <Radio.Group
                        value={cropStrategy['1x1']}
                        onChange={(e: RadioChangeEvent) => handleStrategyChange('1x1', e.target.value)}
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
                        onChange={(e: RadioChangeEvent) => handleStrategyChange('4x5', e.target.value)}
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
                        onChange={(e: RadioChangeEvent) => handleStrategyChange('16x9', e.target.value)}
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
    );
};

export default CropStrategySelector;
