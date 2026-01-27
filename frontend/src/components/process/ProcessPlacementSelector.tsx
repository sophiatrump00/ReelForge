import React from 'react';
import { Card, Checkbox, Space, Divider, Tag } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Text } = Typography;

export interface MetaPlacement {
    id: string;
    name: string;
    ratio: string;
    resolution: string;
    types: string[];
    icon: string;
    description: string;
}

export const metaPlacements: MetaPlacement[] = [
    { id: 'feed_1x1', name: 'Feed Square', ratio: '1:1', resolution: '1080×1080', types: ['video', 'image'], icon: '⬛', description: 'Facebook/Instagram Feed' },
    { id: 'feed_4x5', name: 'Feed Portrait', ratio: '4:5', resolution: '1080×1350', types: ['video', 'image'], icon: '📱', description: 'Instagram Feed Optimal' },
    { id: 'stories_9x16', name: 'Stories/Reels', ratio: '9:16', resolution: '1080×1920', types: ['video', 'image'], icon: '📲', description: 'Instagram Stories / Reels' },
    { id: 'instream_16x9', name: 'In-Stream Video', ratio: '16:9', resolution: '1920×1080', types: ['video'], icon: '🖥️', description: 'Facebook In-Stream Ads' },
    { id: 'right_column', name: 'Right Column', ratio: '1.91:1', resolution: '1200×628', types: ['image'], icon: '📰', description: 'Facebook Right Column' },
    { id: 'carousel', name: 'Carousel Card', ratio: '1:1', resolution: '1080×1080', types: ['video', 'image'], icon: '🎠', description: 'Carousel Ad Card' },
    { id: 'marketplace', name: 'Marketplace', ratio: '1:1', resolution: '1080×1080', types: ['video', 'image'], icon: '🛒', description: 'Facebook Marketplace' },
    { id: 'search', name: 'Search Results', ratio: '1.91:1', resolution: '1200×628', types: ['image'], icon: '🔍', description: 'Facebook Search' },
];

interface ProcessPlacementSelectorProps {
    selectedPlacements: string[];
    setSelectedPlacements: React.Dispatch<React.SetStateAction<string[]>>;
    exportHighlightFrames: boolean;
    setExportHighlightFrames: React.Dispatch<React.SetStateAction<boolean>>;
    onTogglePlacement?: (id: string) => void;
}

const cardStyle = {
    background: '#252526',
    border: '1px solid #3c3c3c',
    marginBottom: 16,
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

const ProcessPlacementSelector: React.FC<ProcessPlacementSelectorProps> = ({
    selectedPlacements,
    setSelectedPlacements,
    exportHighlightFrames,
    setExportHighlightFrames,
    onTogglePlacement,
}) => {
    const handleToggle = (id: string) => {
        if (selectedPlacements.includes(id)) {
            setSelectedPlacements(selectedPlacements.filter((p) => p !== id));
        } else {
            setSelectedPlacements([...selectedPlacements, id]);
        }
        onTogglePlacement?.(id);
    };

    return (
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
                        onClick={() => handleToggle(p.id)}
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
    );
};

export default ProcessPlacementSelector;
