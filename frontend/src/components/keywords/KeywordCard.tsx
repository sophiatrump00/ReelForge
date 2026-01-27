import React from 'react';
import { Card, Input, Tag, Button, Space, Divider, Upload, Empty } from 'antd';
import { PlusOutlined, UploadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface KeywordCardProps {
    type: 'positive' | 'negative';
    keywords: string[];
    newKeyword: string;
    setNewKeyword: (value: string) => void;
    onAdd: () => void;
    onRemove: (word: string) => void;
    onImport: (file: File) => boolean;
}

const cardStyle = {
    background: '#252526',
    border: '1px solid #3c3c3c',
};

const KeywordCard: React.FC<KeywordCardProps> = ({
    type,
    keywords,
    newKeyword,
    setNewKeyword,
    onAdd,
    onRemove,
    onImport,
}) => {
    const isPositive = type === 'positive';
    const color = isPositive ? '#4ec9b0' : '#f14c4c';
    const bgColor = isPositive ? 'rgba(78, 201, 176, 0.2)' : 'rgba(241, 76, 76, 0.2)';
    const Icon = isPositive ? CheckCircleOutlined : CloseCircleOutlined;
    const title = isPositive ? 'Positive Keywords (Brand/Product)' : 'Negative Keywords (Competitor/Sensitive)';
    const placeholder = isPositive ? 'Enter brand/product name' : 'Enter competitor/sensitive word';
    const emptyText = isPositive ? 'No positive keywords' : 'No negative keywords';

    return (
        <Card
            title={
                <Space>
                    <Icon style={{ color }} />
                    <span>{title}</span>
                </Space>
            }
            style={cardStyle}
            extra={<Tag color={isPositive ? 'green' : 'red'}>{keywords.length}</Tag>}
        >
            <div style={{ marginBottom: 16 }}>
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        placeholder={placeholder}
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onPressEnter={onAdd}
                    />
                    <Button
                        type="primary"
                        danger={!isPositive}
                        icon={<PlusOutlined />}
                        onClick={onAdd}
                    >
                        Add
                    </Button>
                </Space.Compact>
            </div>

            <div style={{
                minHeight: 100,
                padding: 12,
                background: '#1e1e1e',
                borderRadius: 4,
                border: '1px solid #3c3c3c'
            }}>
                {keywords.length > 0 ? (
                    keywords.map((word) => (
                        <Tag
                            key={word}
                            closable
                            onClose={() => onRemove(word)}
                            style={{
                                margin: 4,
                                background: bgColor,
                                borderColor: color,
                                color: color
                            }}
                        >
                            {word}
                        </Tag>
                    ))
                ) : (
                    <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Upload
                accept=".txt,.json"
                showUploadList={false}
                beforeUpload={onImport}
            >
                <Button icon={<UploadOutlined />}>Import from TXT</Button>
            </Upload>
        </Card>
    );
};

export default KeywordCard;
