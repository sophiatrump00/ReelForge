import React from 'react';
import { Form, Input, Button, Select, Row, Col, Space } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';

interface SettingsValues {
    vendor?: string;
    api_base?: string;
    api_key?: string;
    vl_model?: string;
}

interface AIConfigTabProps {
    form: FormInstance;
    testing: boolean;
    onSave: (values: SettingsValues) => void;
    onTestConnection: () => void;
}

const AIConfigTab: React.FC<AIConfigTabProps> = ({ form, testing, onSave, onTestConnection }) => {
    return (
        <Form layout="vertical" onFinish={onSave} form={form} initialValues={{
            vendor: 'custom',
            api_base: 'https://api.openai.com/v1',
            vl_model: 'gpt-4-vision-preview'
        }}>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="vendor" label="AI Vendor Profile">
                        <Select
                            onChange={(value) => {
                                if (value === 'siliconflow') {
                                    form.setFieldsValue({
                                        api_base: 'https://api.siliconflow.cn/v1',
                                        vl_model: 'Qwen/Qwen2.5-VL-72B-Instruct'
                                    });
                                } else if (value === 'openai') {
                                    form.setFieldsValue({
                                        api_base: 'https://api.openai.com/v1',
                                        vl_model: 'gpt-4-vision-preview'
                                    });
                                }
                            }}
                        >
                            <Select.Option value="siliconflow">SiliconFlow (Qwen)</Select.Option>
                            <Select.Option value="openai">OpenAI</Select.Option>
                            <Select.Option value="dashscope">DashScope</Select.Option>
                            <Select.Option value="custom">Custom / Other</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={16}>
                    <Form.Item name="api_base" label="API Base URL" rules={[{ required: true }]}>
                        <Input placeholder="https://api.example.com/v1" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="api_key" label="API Key" rules={[{ required: true, message: 'API Key is required' }]}>
                <Input.Password placeholder="sk-..." />
            </Form.Item>

            <Form.Item name="vl_model" label="Vision Model ID" rules={[{ required: true }]}>
                <Input placeholder="e.g., gpt-4-turbo, Qwen/Qwen2.5-VL-72B-Instruct" />
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">Save Configuration</Button>
                    <Button icon={<ApiOutlined />} onClick={onTestConnection} loading={testing} htmlType="button">
                        Test Connection
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default AIConfigTab;
