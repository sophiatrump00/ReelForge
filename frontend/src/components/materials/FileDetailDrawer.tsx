import React from 'react';
import {
    Drawer,
    Card,
    Typography,
    Rate,
    Tag,
    Row,
    Col,
    Divider,
    Space,
    Button
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ThunderboltOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

export interface FileItem {
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

interface FileDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    file: FileItem | null;
}

const cardStyle = {
    background: '#252526',
    border: '1px solid #3c3c3c',
};

const FileDetailDrawer: React.FC<FileDetailDrawerProps> = ({ open, onClose, file }) => {
    if (!file) return null;

    return (
        <Drawer
            title={file.name || 'File Details'}
            placement="right"
            width={400}
            onClose={onClose}
            open={open}
            styles={{ body: { background: '#1e1e1e' } }}
        >
            <div>
                {/* Quality Score */}
                <Card size="small" style={{ ...cardStyle, marginBottom: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary">Quality Score</Text>
                        <div style={{ fontSize: 36, fontWeight: 'bold', color: '#4ec9b0' }}>
                            {file.qualityScore || '-'}
                        </div>
                        <Rate disabled value={(file.qualityScore || 0) / 2} allowHalf />
                    </div>
                </Card>

                {/* Keyword Matches */}
                <Card size="small" title="Keyword Matches" style={{ ...cardStyle, marginBottom: 16 }}>
                    {(file.positiveKeywords?.length || 0) > 0 && (
                        <div style={{ marginBottom: 12 }}>
                            <Text type="success" style={{ display: 'block', marginBottom: 4 }}>
                                <CheckCircleOutlined /> Positive Keywords
                            </Text>
                            {file.positiveKeywords?.map(k => (
                                <Tag key={k} color="green" style={{ margin: 2 }}>{k}</Tag>
                            ))}
                        </div>
                    )}
                    {(file.negativeKeywords?.length || 0) > 0 && (
                        <div>
                            <Text type="danger" style={{ display: 'block', marginBottom: 4 }}>
                                <CloseCircleOutlined /> Negative Keywords
                            </Text>
                            {file.negativeKeywords?.map(k => (
                                <Tag key={k} color="red" style={{ margin: 2 }}>{k}</Tag>
                            ))}
                        </div>
                    )}
                    {(!file.positiveKeywords?.length && !file.negativeKeywords?.length) && (
                        <Text type="secondary">No keywords detected</Text>
                    )}
                </Card>

                {/* Highlight Frames */}
                <Card size="small" title="Highlight Frames" style={{ ...cardStyle, marginBottom: 16 }}>
                    {(file.highlightFrames?.length || 0) > 0 ? (
                        <Row gutter={[8, 8]}>
                            {file.highlightFrames?.map((_frame, idx) => (
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
                    {file.ocrText ? (
                        <div style={{
                            background: '#252526',
                            padding: 8,
                            borderRadius: 4,
                            maxHeight: 100,
                            overflow: 'auto'
                        }}>
                            <Text style={{ fontSize: 12 }}>{file.ocrText}</Text>
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
        </Drawer>
    );
};

export default FileDetailDrawer;
