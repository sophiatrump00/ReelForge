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
}

const cardStyle = {
    background: '#252526',
    border: '1px solid #3c3c3c',
};

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

const FileBrowser: React.FC<FileBrowserProps> = ({
    currentPath,
    files,
    onNavigateUp,
    onEnterFolder,
    onViewDetails
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
                    renderItem={(file) => (
                        <List.Item
                            style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #3c3c3c',
                                cursor: file.type === 'folder' ? 'pointer' : 'default',
                            }}
                            onClick={() => file.type === 'folder' && onEnterFolder(file.name)}
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
                                    onClick={(e) => { e.stopPropagation(); onViewDetails(file); }}
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
    );
};

export default FileBrowser;
