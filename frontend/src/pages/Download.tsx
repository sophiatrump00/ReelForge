import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Alert, Tabs } from 'antd';
import { CodeOutlined, PlayCircleOutlined, UnorderedListOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import BatchDownloadTab from '../components/download/BatchDownloadTab';

const { TextArea } = Input;

const getApiUrl = () => '/api/v1';

interface DownloadFormValues {
    command: string;
}

const TerminalTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState<string[]>(() => {
        const saved = localStorage.getItem('terminal_logs');
        return saved ? JSON.parse(saved) : [];
    });
    const terminalRef = React.useRef<HTMLDivElement>(null);
    const [form] = Form.useForm();

    // Auto-scroll to bottom of terminal
    React.useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalOutput]);

    // Persist logs to localStorage
    React.useEffect(() => {
        localStorage.setItem('terminal_logs', JSON.stringify(terminalOutput));
    }, [terminalOutput]);

    const handleDownloadLogs = () => {
        const element = document.createElement("a");
        const file = new Blob([terminalOutput.join('\n')], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `terminal_logs_${new Date().toISOString()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleClearLogs = () => {
        setTerminalOutput([]);
        localStorage.removeItem('terminal_logs');
        message.success('Terminal output cleared');
    };

    const onFinish = async (values: DownloadFormValues) => {
        setLoading(true);
        setTerminalOutput(['> Initializing terminal...']);

        try {
            const { command } = values;
            let args = command.trim();
            if (args.startsWith('yt-dlp ')) {
                args = args.substring(7);
            }

            // Payload must match DownloadRequest schema
            const payload = {
                url: "shell_command",
                is_batch: false,
                options: {
                    custom_args: args
                }
            };

            const response = await fetch(`${getApiUrl()}/download/terminal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.body) {
                throw new Error('ReadableStream not supported in this browser.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // Clean up chunk: split by internal newlines if meaningful, 
                // but usually we just append to output. 
                // For better formatting, let's treat chunks as raw text blocks or lines.
                // Simple approach: Split by newline to render line-by-line
                const lines = chunk.split('\n');

                setTerminalOutput(prev => {
                    const newOutput = [...prev];
                    // If the last item didn't end with newline, we might want to merge.
                    // But for simplicity in React, pushing new lines is safer.
                    // We'll filter empty strings to avoid huge gaps, unless it's intentional spacing.
                    return [...newOutput, ...lines];
                });
            }

        } catch (error) {
            const err = error as Error;
            console.error(err);
            setTerminalOutput(prev => [...prev, `[ERROR] ${err.message}`]);
            message.error('Command submission failed');
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
                            rows={2}
                            disabled={loading}
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

                {/* Terminal Window */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
                    <span style={{ color: '#ccc', fontWeight: 'bold' }}>Terminal Output</span>
                    <div>
                        <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            onClick={handleDownloadLogs}
                            style={{ color: '#ccc', marginRight: 8 }}
                            disabled={terminalOutput.length === 0}
                        >
                            Export
                        </Button>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleClearLogs}
                            disabled={terminalOutput.length === 0}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
                <div
                    ref={terminalRef}
                    style={{
                        marginTop: 0,
                        background: '#1e1e1e',
                        border: '1px solid #333',
                        borderRadius: 6,
                        height: '400px',
                        overflowY: 'auto',
                        padding: '12px',
                        fontFamily: "'Fira Code', monospace",
                        color: '#d4d4d4',
                        fontSize: '13px',
                        whiteSpace: 'pre-wrap',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                    }}
                >
                    {terminalOutput.length === 0 ? (
                        <span style={{ color: '#666' }}>// Terminal output will appear here...</span>
                    ) : (
                        terminalOutput.map((line, i) => (
                            <div key={i} style={{ minHeight: '1.2em' }}>
                                {line}
                            </div>
                        ))
                    )}
                    {loading && <div style={{ color: '#00ff00', marginTop: 8 }}>_</div>}
                </div>
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
