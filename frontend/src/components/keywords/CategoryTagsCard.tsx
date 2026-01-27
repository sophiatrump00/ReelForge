import React from 'react';
import { Card, Tag, Row, Col, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface CategoryTagsCardProps {
    categories: {
        productType: string[];
        contentType: string[];
        emotion: string[];
    };
}

const cardStyle = {
    background: '#252526',
    border: '1px solid #3c3c3c',
};

const tagContainerStyle = {
    padding: 12,
    background: '#1e1e1e',
    borderRadius: 4,
    border: '1px solid #3c3c3c'
};

const CategoryTagsCard: React.FC<CategoryTagsCardProps> = ({ categories }) => {
    return (
        <Card title="Category Tags (for material organization)" style={cardStyle}>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Product Type</Text>
                    <div style={tagContainerStyle}>
                        {categories.productType.length > 0 ? (
                            categories.productType.map((tag) => (
                                <Tag key={tag} style={{ margin: 4 }}>{tag}</Tag>
                            ))
                        ) : (
                            <Text type="secondary">No tags</Text>
                        )}
                        <Tag style={{ margin: 4, borderStyle: 'dashed' }}>
                            <PlusOutlined /> Add
                        </Tag>
                    </div>
                </Col>
                <Col xs={24} md={8}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Content Type</Text>
                    <div style={tagContainerStyle}>
                        {categories.contentType.length > 0 ? (
                            categories.contentType.map((tag) => (
                                <Tag key={tag} color="blue" style={{ margin: 4 }}>{tag}</Tag>
                            ))
                        ) : (
                            <Text type="secondary">No tags</Text>
                        )}
                        <Tag style={{ margin: 4, borderStyle: 'dashed' }}>
                            <PlusOutlined /> Add
                        </Tag>
                    </div>
                </Col>
                <Col xs={24} md={8}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Emotion Tags</Text>
                    <div style={tagContainerStyle}>
                        {categories.emotion.length > 0 ? (
                            categories.emotion.map((tag) => (
                                <Tag key={tag} color="purple" style={{ margin: 4 }}>{tag}</Tag>
                            ))
                        ) : (
                            <Text type="secondary">No tags</Text>
                        )}
                        <Tag style={{ margin: 4, borderStyle: 'dashed' }}>
                            <PlusOutlined /> Add
                        </Tag>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default CategoryTagsCard;
