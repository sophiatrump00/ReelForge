import React from 'react';
import { Card, Input, Typography } from 'antd';

const { Text } = Typography;

interface NamingTemplatePanelProps {
    namingTemplate: string;
    setNamingTemplate: (value: string) => void;
}

const NamingTemplatePanel: React.FC<NamingTemplatePanelProps> = ({ namingTemplate, setNamingTemplate }) => {
    const cardStyle = {
        background: '#252526',
        border: '1px solid #3c3c3c',
        marginBottom: 16,
    };

    return (
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
    );
};

export default NamingTemplatePanel;
