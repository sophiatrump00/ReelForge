import React from 'react';
import { Form, Input } from 'antd';

const StorageTab: React.FC = () => {
    return (
        <Form layout="vertical">
            <Form.Item label="Downloads Directory" help="Container Path: /app/data/raw">
                <Input disabled value="/app/data/raw" />
            </Form.Item>
            <Form.Item label="Output Directory" help="Container Path: /app/data/output">
                <Input disabled value="/app/data/output" />
            </Form.Item>
        </Form>
    );
};

export default StorageTab;
