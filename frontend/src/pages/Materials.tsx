import React, { useState } from 'react';
import {
    Card,
    Button,
    Empty,
    Breadcrumb,
    List,
    Typography,
    Drawer,
    Tag,
    Row,
    Col,
    Divider,
    Space,
    Rate,
    Badge
} from 'antd';
import {
    FolderOutlined,
    FileOutlined,
    FileMarkdownOutlined,
    VideoCameraOutlined,
    CloudSyncOutlined,
    PlayCircleOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ThunderboltOutlined,
    PictureOutlined,
    SendOutlined
} from '@ant-design/icons';
import logger from '../utils/logger';

const { Title, Text } = Typography;

interface FileItem {
    name: string;
    type: 'folder' | 'video' | 'markdown' | 'image';
    size?: string;
    children?: FileItem[];
    qualityScore?: number;
    positiveKeywords?: string[];
    negativeKeywords?: string[];
    highlightFrames?: string[];
    ocrText?: string;
    status?: 'pending' | 'analyzed' | 'processed';
}

// Initial empty file system - will be populated by API
const emptyFileSystem: FileItem = {
    name: 'data',
    type: 'folder',
    children: []
};

const Materials: React.FC = () => {
    const [currentPath, setCurrentPath] = useState<string[]>(['data']);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fileSystem] = useState<FileItem>(emptyFileSystem);

    // Helper to traverse file system
    const getCurrentFolder = (): FileItem | undefined => {
        let current: FileItem | undefined = fileSystem;
        for (let i = 1; i < currentPath.length && current; i++) {
            current = current.children?.find(c => c.name === currentPath[i]);
        }
        return current;
    };

    const handleEnterFolder = (folderName: string) => {
        setCurrentPath([...currentPath, folderName]);
        logger.userAction('Materials', 'enter_folder', { folder: folderName });
    };

    const handleGoUp = () => {
        if (currentPath.length > 1) {
            setCurrentPath(currentPath.slice(0, -1));
            logger.userAction('Materials', 'go_up', {});
        }
    };

    const handleScanFolder = async () => {
        setLoading(true);
        logger.apiRequest('Materials', 'GET', '/api/v1/materials/scan');
        // TODO: Implement actual API call
        setTimeout(() => {
            setLoading(false);
            logger.apiResponse('Materials', 'GET', '/api/v1/materials/scan', 200);
        }, 1000);
    };

    const handleViewDetails = (file: FileItem) => {
        setSelectedFile(file);
        setDrawerOpen(true);
        logger.userAction('Materials', 'view_details', { file: file.name });
    };

    const currentFolder = getCurrentFolder();
    const files = currentFolder?.children || [];

    const renderIcon = (type: string) => {
        switch (type) {
            case 'folder': return <FolderOutlined style={{ color: '#dcdcaa' }} />;
            case 'video': return <VideoCameraOutlined style={{ color: '#4ec9b0' }} />;
            case 'markdown': return <FileMarkdownOutlined style={{ color: '#569cd6' }} />;
            case 'image': return <PictureOutlined style={{ color: '#ce9178' }} />;
            default: return <FileOutlined />;
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'analyzed':
                return <Badge status="success" text="Analyzed" />;
            case 'processed':
                return <Badge status="processing" text="Processed" />;
            case 'pending':
            default:
                return <Badge status="default" text="Pending" />;
        }
    };

    const cardStyle = {
        background: '#252526',
        border: '1px solid #3c3c3c',
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <Title level={4} style={{ margin: 0, marginBottom: 8 }}>Materials Library</Title>
                    <Breadcrumb
                        items={currentPath.map((p, index) => ({
                            key: p,
                            title: (
                                <span
                                    onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                                    style={{ cursor: 'pointer', color: index === currentPath.length - 1 ? '#d4d4d4' : '#888' }}
                                >
                                    {p}
                                </span>
                            ),
                        }))}
                    />
                </div>
                <Space>
                    <Button icon={<CloudSyncOutlined />} onClick={handleScanFolder} loading={loading}>
                        Scan Directory
                    </Button>
                    <Button
                        type="primary"
                        icon={<ThunderboltOutlined />}
                        disabled={files.filter(f => f.type === 'video').length === 0}
                    >
                        Analyze All
                    </Button>
                </Space>
            </div>

            <Card style={{ ...cardStyle, flex: 1, overflow: 'auto' }}>
                {currentPath.length > 1 && (
                    <div
                        onClick={handleGoUp}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #3c3c3c',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        <FolderOutlined style={{ color: '#dcdcaa' }} />
                        <Text>..</Text>
                    </div>
                )}

                {files.length > 0 ? (
                    <List
                        dataSource={files}
                        renderItem={(file) => (
                            <List.Item
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #3c3c3c',
                                    cursor: file.type === 'folder' ? 'pointer' : 'default',
                                }}
                                onClick={() => file.type === 'folder' && handleEnterFolder(file.name)}
                                actions={file.type === 'video' ? [
                                    <Button
                                        key="preview"
                                        size="small"
                                        icon={<PlayCircleOutlined />}
                                    >
                                        Preview
                                    </Button>,
                                    <Button
                                        key="details"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={(e) => { e.stopPropagation(); handleViewDetails(file); }}
                                    >
                                        Details
                                    </Button>,
                                    <Button
                                        key="process"
                                        size="small"
                                        type="primary"
                                        icon={<SendOutlined />}
                                    >
                                        Process
                                    </Button>
                                ] : undefined}
                            >
                                <List.Item.Meta
                                    avatar={renderIcon(file.type)}
                                    title={
                                        <Space>
                                            <Text>{file.name}</Text>
                                            {file.type === 'video' && file.positiveKeywords && file.positiveKeywords.length > 0 && (
                                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                                    {file.positiveKeywords.length} match
                                                </Tag>
                                            )}
                                            {file.type === 'video' && file.negativeKeywords && file.negativeKeywords.length > 0 && (
                                                <Tag color="red" icon={<CloseCircleOutlined />}>
                                                    {file.negativeKeywords.length} alert
                                                </Tag>
                                            )}
                                        </Space>
                                    }
                                    description={
                                        <Space>
                                            {file.size && <Text type="secondary">{file.size}</Text>}
                                            {file.type === 'video' && getStatusBadge(file.status)}
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty
                        description="No files in this directory"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ marginTop: 60 }}
                    />
                )}
            </Card>

            {/* AI Analysis Drawer */}
            <Drawer
                title={selectedFile?.name || 'File Details'}
                placement="right"
                width={400}
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                styles={{ body: { background: '#1e1e1e' } }}
            >
                {selectedFile && (
                    <div>
                        {/* Quality Score */}
                        <Card size="small" style={{ ...cardStyle, marginBottom: 16 }}>
                            <div style={{ textAlign: 'center' }}>
                                <Text type="secondary">Quality Score</Text>
                                <div style={{ fontSize: 36, fontWeight: 'bold', color: '#4ec9b0' }}>
                                    {selectedFile.qualityScore || '-'}
                                </div>
                                <Rate disabled value={(selectedFile.qualityScore || 0) / 2} allowHalf />
                            </div>
                        </Card>

                        {/* Keyword Matches */}
                        <Card size="small" title="Keyword Matches" style={{ ...cardStyle, marginBottom: 16 }}>
                            {(selectedFile.positiveKeywords?.length || 0) > 0 && (
                                <div style={{ marginBottom: 12 }}>
                                    <Text type="success" style={{ display: 'block', marginBottom: 4 }}>
                                        <CheckCircleOutlined /> Positive Keywords
                                    </Text>
                                    {selectedFile.positiveKeywords?.map(k => (
                                        <Tag key={k} color="green" style={{ margin: 2 }}>{k}</Tag>
                                    ))}
                                </div>
                            )}
                            {(selectedFile.negativeKeywords?.length || 0) > 0 && (
                                <div>
                                    <Text type="danger" style={{ display: 'block', marginBottom: 4 }}>
                                        <CloseCircleOutlined /> Negative Keywords
                                    </Text>
                                    {selectedFile.negativeKeywords?.map(k => (
                                        <Tag key={k} color="red" style={{ margin: 2 }}>{k}</Tag>
                                    ))}
                                </div>
                            )}
                            {(!selectedFile.positiveKeywords?.length && !selectedFile.negativeKeywords?.length) && (
                                <Text type="secondary">No keywords detected</Text>
                            )}
                        </Card>

                        {/* Highlight Frames */}
                        <Card size="small" title="Highlight Frames" style={{ ...cardStyle, marginBottom: 16 }}>
                            {(selectedFile.highlightFrames?.length || 0) > 0 ? (
                                <Row gutter={[8, 8]}>
                                    {selectedFile.highlightFrames?.map((_frame, idx) => (
                                        <Col span={8} key={idx}>
                                            <div style={{
                                                height: 60,
                                                background: '#333',
                                                borderRadius: 4,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#888'
                                            }}>
                                                Frame {idx + 1}
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <Text type="secondary">No highlight frames available</Text>
                            )}
                        </Card>

                        {/* OCR Text */}
                        <Card size="small" title="OCR Text" style={cardStyle}>
                            {selectedFile.ocrText ? (
                                <div style={{
                                    background: '#252526',
                                    padding: 8,
                                    borderRadius: 4,
                                    maxHeight: 100,
                                    overflow: 'auto'
                                }}>
                                    <Text style={{ fontSize: 12 }}>{selectedFile.ocrText}</Text>
                                </div>
                            ) : (
                                <Text type="secondary">No OCR text extracted</Text>
                            )}
                        </Card>

                        <Divider />

                        <Space style={{ width: '100%' }} direction="vertical">
                            <Button type="primary" block icon={<ThunderboltOutlined />}>
                                Send to Process Queue
                            </Button>
                            <Button block icon={<PlayCircleOutlined />}>
                                Preview Video
                            </Button>
                        </Space>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default Materials;
