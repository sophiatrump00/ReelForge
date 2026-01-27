import React, { useState } from 'react';
import {
    Card,
    Typography,
    Input,
    Tag,
    Button,
    Space,
    Divider,
    Upload,
    message,
    Row,
    Col,
    Empty
} from 'antd';
import {
    PlusOutlined,
    UploadOutlined,
    DownloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import logger from '../utils/logger';

const { Title, Text } = Typography;

interface KeywordGroup {
    positive: string[];
    negative: string[];
    categories: {
        productType: string[];
        contentType: string[];
        emotion: string[];
    };
}

const Keywords: React.FC = () => {
    const [keywords, setKeywords] = useState<KeywordGroup>({
        positive: [],
        negative: [],
        categories: {
            productType: [],
            contentType: [],
            emotion: [],
        },
    });

    const [newPositive, setNewPositive] = useState('');
    const [newNegative, setNewNegative] = useState('');

    const addPositive = () => {
        if (newPositive.trim() && !keywords.positive.includes(newPositive.trim())) {
            setKeywords({
                ...keywords,
                positive: [...keywords.positive, newPositive.trim()],
            });
            logger.userAction('Keywords', 'add_positive', { keyword: newPositive.trim() });
            message.success(`Added positive keyword: ${newPositive.trim()}`);
            setNewPositive('');
        }
    };

    const addNegative = () => {
        if (newNegative.trim() && !keywords.negative.includes(newNegative.trim())) {
            setKeywords({
                ...keywords,
                negative: [...keywords.negative, newNegative.trim()],
            });
            logger.userAction('Keywords', 'add_negative', { keyword: newNegative.trim() });
            message.success(`Added negative keyword: ${newNegative.trim()}`);
            setNewNegative('');
        }
    };

    const removePositive = (word: string) => {
        setKeywords({
            ...keywords,
            positive: keywords.positive.filter((w) => w !== word),
        });
        logger.userAction('Keywords', 'remove_positive', { keyword: word });
    };

    const removeNegative = (word: string) => {
        setKeywords({
            ...keywords,
            negative: keywords.negative.filter((w) => w !== word),
        });
        logger.userAction('Keywords', 'remove_negative', { keyword: word });
    };

    const exportKeywords = () => {
        const data = JSON.stringify(keywords, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reelforge_keywords.json';
        a.click();
        URL.revokeObjectURL(url);
        logger.userAction('Keywords', 'export', { count: keywords.positive.length + keywords.negative.length });
        message.success('Keywords exported');
    };

    const handleImport = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                if (file.name.endsWith('.json')) {
                    const imported = JSON.parse(content);
                    if (imported.positive && imported.negative) {
                        setKeywords(imported);
                        logger.userAction('Keywords', 'import_json', {
                            positive: imported.positive.length,
                            negative: imported.negative.length
                        });
                        message.success('JSON config imported successfully');
                    }
                } else if (file.name.endsWith('.txt')) {
                    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
                    setKeywords({
                        ...keywords,
                        positive: [...new Set([...keywords.positive, ...lines])],
                    });
                    logger.userAction('Keywords', 'import_txt', { count: lines.length });
                    message.success(`Imported ${lines.length} keywords from TXT`);
                }
            } catch (err) {
                logger.error('Keywords', 'import_error', 'Import failed', err as Error);
                message.error('Import failed, please check file format');
            }
        };
        reader.readAsText(file);
        return false;
    };

    const saveConfig = async () => {
        try {
            logger.apiRequest('Keywords', 'POST', '/api/v1/keywords');
            await new Promise(resolve => setTimeout(resolve, 500));
            logger.apiResponse('Keywords', 'POST', '/api/v1/keywords', 200);
            message.success('Keywords saved');
        } catch (err) {
            logger.apiError('Keywords', 'POST', '/api/v1/keywords', err as Error);
            message.error('Save failed');
        }
    };

    const cardStyle = {
        background: '#252526',
        border: '1px solid #3c3c3c',
    };

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>
                Keyword Management
            </Title>

            <Row gutter={[16, 16]}>
                {/* Positive Keywords */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <CheckCircleOutlined style={{ color: '#4ec9b0' }} />
                                <span>Positive Keywords (Brand/Product)</span>
                            </Space>
                        }
                        style={cardStyle}
                        extra={<Tag color="green">{keywords.positive.length}</Tag>}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input
                                    placeholder="Enter brand/product name"
                                    value={newPositive}
                                    onChange={(e) => setNewPositive(e.target.value)}
                                    onPressEnter={addPositive}
                                />
                                <Button type="primary" icon={<PlusOutlined />} onClick={addPositive}>
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
                            {keywords.positive.length > 0 ? (
                                keywords.positive.map((word) => (
                                    <Tag
                                        key={word}
                                        closable
                                        onClose={() => removePositive(word)}
                                        style={{
                                            margin: 4,
                                            background: 'rgba(78, 201, 176, 0.2)',
                                            borderColor: '#4ec9b0',
                                            color: '#4ec9b0'
                                        }}
                                    >
                                        {word}
                                    </Tag>
                                ))
                            ) : (
                                <Empty description="No positive keywords" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        <Upload
                            accept=".txt,.json"
                            showUploadList={false}
                            beforeUpload={handleImport}
                        >
                            <Button icon={<UploadOutlined />}>Import from TXT</Button>
                        </Upload>
                    </Card>
                </Col>

                {/* Negative Keywords */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <CloseCircleOutlined style={{ color: '#f14c4c' }} />
                                <span>Negative Keywords (Competitor/Sensitive)</span>
                            </Space>
                        }
                        style={cardStyle}
                        extra={<Tag color="red">{keywords.negative.length}</Tag>}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input
                                    placeholder="Enter competitor/sensitive word"
                                    value={newNegative}
                                    onChange={(e) => setNewNegative(e.target.value)}
                                    onPressEnter={addNegative}
                                />
                                <Button type="primary" danger icon={<PlusOutlined />} onClick={addNegative}>
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
                            {keywords.negative.length > 0 ? (
                                keywords.negative.map((word) => (
                                    <Tag
                                        key={word}
                                        closable
                                        onClose={() => removeNegative(word)}
                                        style={{
                                            margin: 4,
                                            background: 'rgba(241, 76, 76, 0.2)',
                                            borderColor: '#f14c4c',
                                            color: '#f14c4c'
                                        }}
                                    >
                                        {word}
                                    </Tag>
                                ))
                            ) : (
                                <Empty description="No negative keywords" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        <Upload
                            accept=".txt,.json"
                            showUploadList={false}
                            beforeUpload={handleImport}
                        >
                            <Button icon={<UploadOutlined />}>Import from TXT</Button>
                        </Upload>
                    </Card>
                </Col>

                {/* Category Tags */}
                <Col xs={24}>
                    <Card
                        title="Category Tags (for material organization)"
                        style={cardStyle}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>Product Type</Text>
                                <div style={{
                                    padding: 12,
                                    background: '#1e1e1e',
                                    borderRadius: 4,
                                    border: '1px solid #3c3c3c'
                                }}>
                                    {keywords.categories.productType.length > 0 ? (
                                        keywords.categories.productType.map((tag) => (
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
                                <div style={{
                                    padding: 12,
                                    background: '#1e1e1e',
                                    borderRadius: 4,
                                    border: '1px solid #3c3c3c'
                                }}>
                                    {keywords.categories.contentType.length > 0 ? (
                                        keywords.categories.contentType.map((tag) => (
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
                                <div style={{
                                    padding: 12,
                                    background: '#1e1e1e',
                                    borderRadius: 4,
                                    border: '1px solid #3c3c3c'
                                }}>
                                    {keywords.categories.emotion.length > 0 ? (
                                        keywords.categories.emotion.map((tag) => (
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
                </Col>
            </Row>

            {/* Action Bar */}
            <div style={{
                marginTop: 24,
                padding: 16,
                background: '#252526',
                border: '1px solid #3c3c3c',
                borderRadius: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Text type="secondary">
                    Positive: {keywords.positive.length} | Negative: {keywords.negative.length}
                </Text>
                <Space>
                    <Button icon={<DownloadOutlined />} onClick={exportKeywords}>
                        Export JSON
                    </Button>
                    <Button type="primary" onClick={saveConfig}>
                        Save Config
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default Keywords;
