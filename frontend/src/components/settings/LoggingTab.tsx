import React from 'react';
import { Form, Button, Card, Select, Row, Col, Space, Divider, Statistic } from 'antd';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import logger from '../../utils/logger';

interface LoggingTabProps {
    onExportLogs: () => void;
    onClearLogs: () => void;
}

const cardStyle = {
    background: '#252526',
    border: '1px solid #3c3c3c',
    marginBottom: 16,
};

const LoggingTab: React.FC<LoggingTabProps> = ({ onExportLogs, onClearLogs }) => {
    return (
        <div>
            <Card title="Log Management" size="small" style={cardStyle}>
                <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Statistic
                            title="Log Entries"
                            value={logger.getLogs().length}
                            valueStyle={{ color: '#007acc' }}
                        />
                    </Col>
                    <Col flex="auto">
                        <Space>
                            <Button icon={<DownloadOutlined />} onClick={onExportLogs}>
                                Export Logs (JSON)
                            </Button>
                            <Button danger icon={<DeleteOutlined />} onClick={onClearLogs}>
                                Clear Logs
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Divider style={{ margin: '12px 0' }} />

                <Form.Item label="Log Level">
                    <Select defaultValue="debug" style={{ width: 200 }}>
                        <Select.Option value="debug">DEBUG (All logs)</Select.Option>
                        <Select.Option value="info">INFO</Select.Option>
                        <Select.Option value="warn">WARN</Select.Option>
                        <Select.Option value="error">ERROR only</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Recent Logs Preview">
                    <div style={{
                        background: '#1e1e1e',
                        border: '1px solid #3c3c3c',
                        borderRadius: 4,
                        padding: 12,
                        maxHeight: 200,
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: 11,
                    }}>
                        {logger.getLogs().slice(-10).reverse().map((log, idx) => (
                            <div key={idx} style={{
                                color: log.level === 'ERROR' ? '#f14c4c' :
                                    log.level === 'WARN' ? '#dcdcaa' :
                                        log.level === 'INFO' ? '#007acc' : '#888',
                                marginBottom: 4,
                            }}>
                                [{log.timestamp.split('T')[1]?.split('.')[0] || log.timestamp}] [{log.level}] {log.component}: {log.message}
                            </div>
                        ))}
                        {logger.getLogs().length === 0 && (
                            <div style={{ color: '#888' }}>No logs yet</div>
                        )}
                    </div>
                </Form.Item>
            </Card>
        </div>
    );
};

export default LoggingTab;
