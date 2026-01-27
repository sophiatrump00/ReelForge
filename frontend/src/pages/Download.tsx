import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Alert } from 'antd';
import { CodeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;

const getApiUrl = () => 'http://localhost:8000/api/v1';

const Download: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const { command } = values;

            // Simple parsing to extract URL (assuming last argument or finding http)
            // In a real shell parser, this would be more robust.
            // Here we just treat the whole line as the command arguments + URL
            // We strip 'yt-dlp' if the user typed it.
            let args = command.trim();
            if (args.startsWith('yt-dlp ')) {
                args = args.substring(7);
            }

            // Attempt to extract URL for the backend 'url' field requirement
            // This is a naive extraction, assuming URL is present in the string
            const urlMatch = args.match(/(https?:\/\/[^\s]+)/);
            const url = urlMatch ? urlMatch[0] : "shell_command";

            const payload = {
                url: url,
                is_batch: false, // Shell mode implies manual control
                options: {
                    // Pass the full raw args string to a hypotetical backend field
                    // Since existing backend expects specific fields, we might need to rely on 
                    // the backend handling a special "custom_args" field or similar.
                    // For now, we fit what we can, or assume backend is updated to handle 'shell_mode'.
                    // To keep it compatible with the CURRENT backend 
                    // (which expects max_downloads, remove_audio etc separately),
                    // this frontend change assumes the BACKEND is also updated or we map basic args.

                    // However, user asked for full shell control. 
                    // We will send a special flag if backend supports it, or just send the raw string.
                    custom_args: args
                }
            };

            // NOTE: The current backend might NOT support 'custom_args'. 
            // If this fails, we need to update backend or verify SPEC. 
            // Assuming this is a prototype frontend update first.

            console.log("Sending payload:", payload);

            const response = await axios.post(`${getApiUrl()}/download/task`, payload);

            if (response.status === 202) {
                message.success('Command submitted successfully!');
                form.resetFields();
            } else {
                message.warning('Unexpected response from server.');
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.detail || 'Failed to submit command.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            <h1 style={{ color: 'white', marginBottom: 24 }}>Terminal Download</h1>

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
                yt-dlp --cookies cookies.txt https://...
            </div>
        </div>
    );
};

export default Download;
