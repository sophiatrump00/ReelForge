import React from 'react';
import { Card, Button, List, Space, Tag, Empty, Typography, Badge } from 'antd';
import {
    FolderOutlined,
    FileOutlined,
    FileMarkdownOutlined,
    VideoCameraOutlined,
    PictureOutlined,
    PlayCircleOutlined,
    EyeOutlined,
    SendOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import type { FileItem } from './FileDetailDrawer';

const { Text } = Typography;

interface FileBrowserProps {
    currentPath: string[];
    files: FileItem[];
    onNavigateUp: () => void;
    onEnterFolder: (folderName: string) => void;
    onViewDetails: (file: FileItem) => void;
    onPreview: (file: FileItem) => void;
    onProcess: (file: FileItem) => void;
}

const cardStyle = {
    background: '#252526',
    border: '1px solid #3c3c3c',
};

const isVideoFile = (name: string) => {
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
    return videoExts.some(ext => name.toLowerCase().endsWith(ext));
};

const formatSize = (bytes: number) => {
    if (bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const renderIcon = (file: FileItem) => {
    if (file.type === 'folder') return <FolderOutlined style={{ color: '#dcdcaa' }} />;
    if (isVideoFile(file.name)) return <VideoCameraOutlined style={{ color: '#4ec9b0' }} />;
    if (file.name.endsWith('.md')) return <FileMarkdownOutlined style={{ color: '#569cd6' }} />;
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => file.name.toLowerCase().endsWith(ext))) {
        return <PictureOutlined style={{ color: '#ce9178' }} />;
    }
    return <FileOutlined />;
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

const FileBrowser: React.FC<FileBrowserProps> = ({
    currentPath,
    files,
    onNavigateUp,
    onEnterFolder,
    onViewDetails,
    onPreview,
    onProcess
}) => {
    return (
        <Card style={{ ...cardStyle, flex: 1, overflow: 'auto' }}>
            {currentPath.length > 1 && (
                <div
                    onClick={onNavigateUp}
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
                    renderItem={(file) => {
                        const isVideo = isVideoFile(file.name);
                        return (
                            <List.Item
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #3c3c3c',
                                    cursor: file.type === 'folder' ? 'pointer' : 'default',
                                }}
                                onClick={() => file.type === 'folder' && onEnterFolder(file.name)}
                                actions={isVideo ? [
                                    <Button
                                        key="preview"
                                        size="small"
                                        icon={<PlayCircleOutlined />}
                                        onClick={(e) => { e.stopPropagation(); onPreview(file); }}
                                    >
                                        Preview
                                    </Button>,
                                    <Button
                                        key="details"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={(e) => { e.stopPropagation(); onViewDetails(file); }}
                                    >
                                        Details
                                    </Button>,
                                    <Button
                                        key="process"
                                        size="small"
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={(e) => { e.stopPropagation(); onProcess(file); }}
                                    >
                                        Process
                                    </Button>
                                ] : undefined}
                            >
                                <List.Item.Meta
                                    avatar={renderIcon(file)}
                                    title={
                                        <Space>
                                            <Text>{file.name}</Text>
                                            {isVideo && file.positiveKeywords && file.positiveKeywords.length > 0 && (
                                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                                    {file.positiveKeywords.length} match
                                                </Tag>
                                            )}
                                            {isVideo && file.negativeKeywords && file.negativeKeywords.length > 0 && (
                                                <Tag color="red" icon={<CloseCircleOutlined />}>
                                                    {file.negativeKeywords.length} alert
                                                </Tag>
                                            )}
                                        </Space>
                                    }
                                    description={
                                        <Space>
                                            {file.type === 'folder' && file.children && (
                                                <Text type="secondary">{file.children.length} items</Text>
                                            )}
                                            {file.type !== 'folder' && (
                                                <Text type="secondary">{formatSize(typeof file.size === 'number' ? file.size : 0)}</Text>
                                            )}
                                            {isVideo && getStatusBadge(file.status)}
                                        </Space>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            ) : (
                <Empty
                    description="No files in this directory"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ marginTop: 60 }}
                />
            )}
        </Card>
    );
};

export default FileBrowser;
