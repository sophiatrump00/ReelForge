import React, { useState } from 'react';
import {
    Button,
    Breadcrumb,
    Typography,
    Space,
} from 'antd';
import {
    CloudSyncOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import logger from '../utils/logger';
import FileBrowser from '../components/materials/FileBrowser';
import FileDetailDrawer from '../components/materials/FileDetailDrawer';
import type { FileItem } from '../components/materials/FileDetailDrawer';

const { Title } = Typography;

// Initial empty file system - will be populated by API
const emptyFileSystem: FileItem = {
    name: 'data',
    type: 'folder',
    children: []
};

const Materials: React.FC = () => {
    const [currentPath, setCurrentPath] = useState<string[]>(['data']);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fileSystem] = useState<FileItem>(emptyFileSystem);

    // Helper to traverse file system
    const getCurrentFolder = (): FileItem | undefined => {
        let current: FileItem | undefined = fileSystem;
        for (let i = 1; i < currentPath.length && current; i++) {
            current = current.children?.find((c: FileItem) => c.name === currentPath[i]);
        }
        return current;
    };

    const handleEnterFolder = (folderName: string) => {
        setCurrentPath([...currentPath, folderName]);
        logger.userAction('Materials', 'enter_folder', { folder: folderName });
    };

    const handleGoUp = () => {
        if (currentPath.length > 1) {
            setCurrentPath(currentPath.slice(0, -1));
            logger.userAction('Materials', 'go_up', {});
        }
    };

    const handleScanFolder = async () => {
        setLoading(true);
        logger.apiRequest('Materials', 'GET', '/api/v1/materials/scan');
        // TODO: Implement actual API call
        setTimeout(() => {
            setLoading(false);
            logger.apiResponse('Materials', 'GET', '/api/v1/materials/scan', 200);
        }, 1000);
    };

    const handleViewDetails = (file: FileItem) => {
        setSelectedFile(file);
        setDrawerOpen(true);
        logger.userAction('Materials', 'view_details', { file: file.name });
    };

    const currentFolder = getCurrentFolder();
    const files = currentFolder?.children || [];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <Title level={4} style={{ margin: 0, marginBottom: 8 }}>Materials Library</Title>
                    <Breadcrumb
                        items={currentPath.map((p, index) => ({
                            key: p,
                            title: (
                                <span
                                    onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                                    style={{ cursor: 'pointer', color: index === currentPath.length - 1 ? '#d4d4d4' : '#888' }}
                                >
                                    {p}
                                </span>
                            ),
                        }))}
                    />
                </div>
                <Space>
                    <Button icon={<CloudSyncOutlined />} onClick={handleScanFolder} loading={loading}>
                        Scan Directory
                    </Button>
                    <Button
                        type="primary"
                        icon={<ThunderboltOutlined />}
                        disabled={files.filter((f: FileItem) => f.type === 'video').length === 0}
                    >
                        Analyze All
                    </Button>
                </Space>
            </div>

            <FileBrowser
                currentPath={currentPath}
                files={files}
                onNavigateUp={handleGoUp}
                onEnterFolder={handleEnterFolder}
                onViewDetails={handleViewDetails}
            />

            <FileDetailDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                file={selectedFile}
            />
        </div>
    );
};

export default Materials;
