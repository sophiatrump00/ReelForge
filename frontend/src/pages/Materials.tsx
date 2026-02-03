import React, { useState } from 'react';
import {
    Button,
    Breadcrumb,
    Typography,
    Space,
    Tabs,
    message
} from 'antd';
import axios from 'axios';
import {
    CloudSyncOutlined,
    ThunderboltOutlined,
    FolderOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import logger from '../utils/logger';
import FileBrowser from '../components/materials/FileBrowser';
import FileDetailDrawer from '../components/materials/FileDetailDrawer';
import DownloadArchiveTab from '../components/materials/DownloadArchiveTab';
import type { FileItem } from '../components/materials/FileDetailDrawer';

const { Title } = Typography;

// Initial state
const emptyFileSystem: FileItem = {
    name: 'data',
    type: 'folder',
    children: []
};

const FileBrowserTab: React.FC = () => {
    const [fileSystem, setFileSystem] = useState<FileItem>(emptyFileSystem);
    const [loading, setLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState<string[]>(['data']);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Fetch files on mount
    React.useEffect(() => {
        handleScanFolder();
    }, []);

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
        logger.apiRequest('Materials', 'GET', '/materials/files/scan');

        try {
            const response = await axios.get('/api/v1/materials/files/scan');
            setFileSystem(response.data);
            logger.apiResponse('Materials', 'GET', '/materials/files/scan', 200);
            message.success('Directory scanned successfully');
        } catch (error) {
            logger.apiError('Materials', 'GET', '/materials/files/scan', error as Error);
            message.error('Failed to scan directory');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (file: FileItem) => {
        setSelectedFile(file);
        setDrawerOpen(true);
        logger.userAction('Materials', 'view_details', { file: file.name });
    };

    const handlePreview = (file: FileItem) => {
        logger.userAction('Materials', 'preview', { file: file.name });
        // Use static file mount (path must be relative to /app/data)
        // file.path should be correct relative path from backend scan
        const url = `/files/${file.path}`;
        window.open(url, '_blank');
    };

    const handleProcess = async (file: FileItem) => {
        if (!file.path) {
            message.error('File path error');
            return;
        }

        logger.userAction('Materials', 'process', { file: file.name });
        message.loading({ content: 'Starting processing...', key: 'process' });

        try {
            await axios.post('/api/v1/materials/process', {
                path: file.path
            });
            logger.apiResponse('Materials', 'POST', '/materials/process', 200);
            message.success({ content: 'Processing started', key: 'process' });
        } catch (error) {
            logger.apiError('Materials', 'POST', '/materials/process', error as Error);
            message.error({ content: 'Failed to start processing', key: 'process' });
        }
    };

    const currentFolder = getCurrentFolder();
    const files = currentFolder?.children || [];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <Title level={4} style={{ margin: 0, marginBottom: 8 }}>Files</Title>
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
                onPreview={handlePreview}
                onProcess={handleProcess}
            />

            <FileDetailDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                file={selectedFile}
            />
        </div>
    );
};

const Materials: React.FC = () => {
    const items = [
        {
            key: 'files',
            label: (
                <span>
                    <FolderOutlined />
                    File Browser
                </span>
            ),
            children: <FileBrowserTab />
        },
        {
            key: 'archive',
            label: (
                <span>
                    <HistoryOutlined />
                    Download Archive
                </span>
            ),
            children: <DownloadArchiveTab />
        }
    ];

    return (
        <div style={{ height: '100%' }}>
            <h1 style={{ color: 'white', marginBottom: 16, paddingLeft: 24 }}>Materials Library</h1>
            <Tabs
                defaultActiveKey="files"
                items={items}
                style={{ height: 'calc(100% - 50px)' }}
                tabBarStyle={{ paddingLeft: 24 }}
            />
        </div>
    );
};

export default Materials;
