import React, { useState } from 'react';
import {
    Card,
    Typography,
    DatePicker,
    Checkbox,
    Radio,
    Button,
    Space,
    Row,
    Col,
    Statistic,
    Table,
    message,
    Empty,
} from 'antd';
import {
    FileExcelOutlined,
    FilePdfOutlined,
    FileTextOutlined,
    DownloadOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import logger from '../utils/logger';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Reports: React.FC = () => {
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [selectedContent, setSelectedContent] = useState<string[]>(['summary', 'materials', 'ai_analysis']);
    const [exportFormat, setExportFormat] = useState<'xlsx' | 'pdf' | 'csv'>('xlsx');
    const [generating, setGenerating] = useState(false);

    const contentOptions = [
        { label: 'Summary Statistics', value: 'summary' },
        { label: 'Material List', value: 'materials' },
        { label: 'AI Analysis Results', value: 'ai_analysis' },
        { label: 'Keyword Matches', value: 'keywords' },
        { label: 'Processing History', value: 'history' },
        { label: 'Placement Output', value: 'placements' },
    ];

    // Stats from API (initially zero)
    const stats = {
        totalDownloads: 0,
        totalProcessed: 0,
        totalStorage: '0 GB',
    };

    // Placement data (initially empty)
    const placementData: { placement: string; videos: number; images: number; total: number }[] = [];

    const generateReport = async () => {
        if (!dateRange) {
            message.warning('Please select a date range');
            return;
        }
        setGenerating(true);
        logger.userAction('Reports', 'generate_report', {
            dateRange: [dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD')],
            content: selectedContent,
            format: exportFormat,
        });

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            logger.apiResponse('Reports', 'POST', '/api/v1/reports/generate', 200);
            message.success(`Report generated successfully (${exportFormat.toUpperCase()})`);
        } catch (err) {
            logger.apiError('Reports', 'POST', '/api/v1/reports/generate', err as Error);
            message.error('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const cardStyle = {
        background: '#252526',
        border: '1px solid #3c3c3c',
        marginBottom: 16,
    };

    const columns = [
        { title: 'Placement', dataIndex: 'placement', key: 'placement' },
        { title: 'Videos', dataIndex: 'videos', key: 'videos' },
        { title: 'Images', dataIndex: 'images', key: 'images' },
        { title: 'Total', dataIndex: 'total', key: 'total' },
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>
                Export Reports
            </Title>

            <Row gutter={[16, 16]}>
                {/* Left - Configuration */}
                <Col xs={24} lg={14}>
                    {/* Date Range */}
                    <Card title="Date Range" style={cardStyle}>
                        <RangePicker
                            style={{ width: '100%' }}
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                            presets={[
                                { label: 'Last 7 Days', value: [dayjs().subtract(7, 'd'), dayjs()] },
                                { label: 'Last 30 Days', value: [dayjs().subtract(30, 'd'), dayjs()] },
                                { label: 'This Month', value: [dayjs().startOf('month'), dayjs()] },
                            ]}
                        />
                    </Card>

                    {/* Report Content */}
                    <Card title="Report Content" style={cardStyle}>
                        <Checkbox.Group
                            value={selectedContent}
                            onChange={(values) => setSelectedContent(values as string[])}
                            style={{ width: '100%' }}
                        >
                            <Row gutter={[16, 12]}>
                                {contentOptions.map((opt) => (
                                    <Col span={12} key={opt.value}>
                                        <Checkbox value={opt.value}>{opt.label}</Checkbox>
                                    </Col>
                                ))}
                            </Row>
                        </Checkbox.Group>
                    </Card>

                    {/* Export Format */}
                    <Card title="Export Format" style={cardStyle}>
                        <Radio.Group
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            buttonStyle="solid"
                        >
                            <Radio.Button value="xlsx">
                                <Space>
                                    <FileExcelOutlined style={{ color: '#4ec9b0' }} />
                                    Excel
                                </Space>
                            </Radio.Button>
                            <Radio.Button value="pdf">
                                <Space>
                                    <FilePdfOutlined style={{ color: '#f14c4c' }} />
                                    PDF
                                </Space>
                            </Radio.Button>
                            <Radio.Button value="csv">
                                <Space>
                                    <FileTextOutlined style={{ color: '#dcdcaa' }} />
                                    CSV
                                </Space>
                            </Radio.Button>
                        </Radio.Group>
                    </Card>

                    {/* Generate Button */}
                    <Button
                        type="primary"
                        size="large"
                        icon={<DownloadOutlined />}
                        onClick={generateReport}
                        loading={generating}
                        disabled={selectedContent.length === 0}
                        block
                    >
                        Generate & Download Report
                    </Button>
                </Col>

                {/* Right - Preview */}
                <Col xs={24} lg={10}>
                    {/* Stats Preview */}
                    <Card
                        title={
                            <Space>
                                <BarChartOutlined />
                                <span>Stats Preview</span>
                            </Space>
                        }
                        style={cardStyle}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Statistic
                                    title="Downloads"
                                    value={stats.totalDownloads}
                                    valueStyle={{ color: '#4ec9b0' }}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Processed"
                                    value={stats.totalProcessed}
                                    valueStyle={{ color: '#007acc' }}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Storage"
                                    value={stats.totalStorage}
                                    valueStyle={{ color: '#dcdcaa' }}
                                />
                            </Col>
                        </Row>
                    </Card>

                    {/* Placement Preview */}
                    <Card title="Placement Output Preview" style={cardStyle}>
                        {placementData.length > 0 ? (
                            <Table
                                dataSource={placementData}
                                columns={columns}
                                size="small"
                                pagination={false}
                                rowKey="placement"
                            />
                        ) : (
                            <Empty
                                description="No data available"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>

                    <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                        Note: Report will include all data within the selected time period.
                        Large reports may take longer to generate.
                    </Text>
                </Col>
            </Row>
        </div>
    );
};

export default Reports;
