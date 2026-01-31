import React from 'react';
import { Card, Row, Col, Checkbox, Switch, Space, Typography } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

const { Text } = Typography;

export interface KeywordDetectionState {
    enabled: boolean;
    removeNegative: boolean;
    keepPositive: boolean;
}

interface KeywordDetectionPanelProps {
    keywordDetection: KeywordDetectionState;
    setKeywordDetection: React.Dispatch<React.SetStateAction<KeywordDetectionState>>;
}

const KeywordDetectionPanel: React.FC<KeywordDetectionPanelProps> = ({ keywordDetection, setKeywordDetection }) => {
    const cardStyle = {
        background: '#252526',
        border: '1px solid #3c3c3c',
        marginBottom: 16,
    };

    const handleSwitchChange = (checked: boolean) => {
        setKeywordDetection(prev => ({ ...prev, enabled: checked }));
    };

    const handleCheckboxChange = (key: keyof KeywordDetectionState, checked: boolean) => {
        setKeywordDetection(prev => ({ ...prev, [key]: checked }));
    };

    return (
        <Card
            title={
                <Space>
                    <span>Keyword Detection</span>
                    <Switch
                        size="small"
                        checked={keywordDetection.enabled}
                        onChange={handleSwitchChange}
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
                            onChange={(e: CheckboxChangeEvent) => handleCheckboxChange('removeNegative', e.target.checked)}
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
                            onChange={(e: CheckboxChangeEvent) => handleCheckboxChange('keepPositive', e.target.checked)}
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
    );
};

export default KeywordDetectionPanel;
