import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Alert, Tabs } from 'antd';
import { CodeOutlined, PlayCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import axios from 'axios';
import BatchDownloadTab from '../components/download/BatchDownloadTab';

const { TextArea } = Input;

const getApiUrl = () => 'http://localhost:8000/api/v1';

interface DownloadFormValues {
    command: string;
}

const TerminalTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values: DownloadFormValues) => {
        setLoading(true);
        try {
            const { command } = values;

            // Simple parsing to extract URL (assuming last argument or finding http)
            let args = command.trim();
            if (args.startsWith('yt-dlp ')) {
                args = args.substring(7);
            }

            // Attempt to extract URL for the backend 'url' field requirement
            const urlMatch = args.match(/(https?:\/\/[^\s]+)/);
            const url = urlMatch ? urlMatch[0] : "shell_command";

            const payload = {
                url: url,
                is_batch: false,
                options: {
                    custom_args: args
                }
            };

            console.log("Sending payload:", payload);

            const response = await axios.post(`${getApiUrl()}/download/task`, payload);

            if (response.status === 202) {
                message.success('Command submitted successfully!');
                form.resetFields();
            } else {
                message.warning('Unexpected response from server.');
            }
        } catch (error) {
            const err = error as Error;
            console.error(err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error((err as any).response?.data?.detail || 'Failed to submit command.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            <Card bordered={false} style={{ background: '#141414' }}>
                <Alert
                    message="Direct Shell Mode"
                    description="Enter the full yt-dlp command options. You have full control."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24, background: '#1f1f1f', border: '1px solid #303030', color: '#ccc' }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        command: 'yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 https://www.tiktok.com/@username/video/123456'
                    }}
                >
                    <Form.Item
                        name="command"
                        label={<span style={{ color: '#fff' }}><CodeOutlined /> Command Line</span>}
                        rules={[{ required: true, message: 'Please enter a command' }]}
                    >
                        <TextArea
                            rows={4}
                            style={{
                                fontFamily: 'monospace',
                                background: '#000',
                                color: '#0f0',
                                border: '1px solid #333'
                            }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<PlayCircleOutlined />}
                            loading={loading}
                            size="large"
                            block
                            style={{ height: 50, fontSize: 18 }}
                        >
                            Execute Command
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <div style={{ marginTop: 24, color: '#666', fontFamily: 'monospace' }}>
                <strong>Supported examples:</strong><br />
                yt-dlp --write-subs --sub-lang en https://...<br />
                yt-dlp --extract-audio --audio-format mp3 https://...<br />
                yt-dlp --cookies cookies.txt https://...<br />
                yt-dlp -a /app/data/links.txt  (use with Batch Mode)
            </div>
        </div>
    );
};

const Download: React.FC = () => {
    const items = [
        {
            key: 'terminal',
            label: (
                <span>
                    <CodeOutlined />
                    Terminal Mode
                </span>
            ),
            children: <TerminalTab />
        },
        {
            key: 'batch',
            label: (
                <span>
                    <UnorderedListOutlined />
                    Batch Mode
                </span>
            ),
            children: <BatchDownloadTab />
        }
    ];

    return (
        <div style={{ height: '100%' }}>
            <h1 style={{ color: 'white', marginBottom: 16, paddingLeft: 24 }}>Download</h1>
            <Tabs
                defaultActiveKey="terminal"
                items={items}
                style={{ height: 'calc(100% - 50px)' }}
                tabBarStyle={{ paddingLeft: 24 }}
            />
        </div>
    );
};

export default Download;
