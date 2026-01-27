import React, { useState } from 'react';
import {
    Typography,
    Button,
    Space,
    Row,
    Col,
    message,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import logger from '../utils/logger';
import KeywordCard from '../components/keywords/KeywordCard';
import CategoryTagsCard from '../components/keywords/CategoryTagsCard';

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

    const handleImport = (file: File): boolean => {
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

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>
                Keyword Management
            </Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <KeywordCard
                        type="positive"
                        keywords={keywords.positive}
                        newKeyword={newPositive}
                        setNewKeyword={setNewPositive}
                        onAdd={addPositive}
                        onRemove={removePositive}
                        onImport={handleImport}
                    />
                </Col>

                <Col xs={24} lg={12}>
                    <KeywordCard
                        type="negative"
                        keywords={keywords.negative}
                        newKeyword={newNegative}
                        setNewKeyword={setNewNegative}
                        onAdd={addNegative}
                        onRemove={removeNegative}
                        onImport={handleImport}
                    />
                </Col>

                <Col xs={24}>
                    <CategoryTagsCard categories={keywords.categories} />
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
