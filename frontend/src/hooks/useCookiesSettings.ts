import { useState, useCallback } from 'react';
import { message } from 'antd';
import logger from '../utils/logger';
import type { CookiesConfig } from '../utils/api';

export const useCookiesSettings = () => {
    const [cookiesConfig, setCookiesConfig] = useState<CookiesConfig>({
        path: '/app/data/cookies.txt',
        content: '',
        detectedSite: 'unknown',
        isValid: false,
        lastChecked: null,
    });
    const [checkingCookies, setCheckingCookies] = useState(false);
    const [pendingCookieFile, setPendingCookieFile] = useState<File | null>(null);
    const [isUpdatingCookies, setIsUpdatingCookies] = useState(false);

    const detectSiteFromCookies = useCallback((content: string): string => {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('.tiktok.com') || lowerContent.includes('tiktok')) {
            return 'tiktok';
        } else if (lowerContent.includes('.youtube.com') || lowerContent.includes('youtube')) {
            return 'youtube';
        } else if (lowerContent.includes('.instagram.com') || lowerContent.includes('instagram')) {
            return 'instagram';
        } else if (lowerContent.includes('.twitter.com') || lowerContent.includes('x.com')) {
            return 'twitter';
        } else if (lowerContent.includes('.facebook.com') || lowerContent.includes('facebook')) {
            return 'facebook';
        }
        return 'unknown';
    }, []);

    const checkCookies = async () => {
        setCheckingCookies(true);
        logger.userAction('Settings', 'check_cookies', { path: cookiesConfig.path });

        try {
            const res = await fetch('/api/v1/settings/cookies/validate', {
                method: 'POST'
            });
            const data = await res.json();

            if (res.ok && data.status === 'valid') {
                setCookiesConfig(prev => ({
                    ...prev,
                    isValid: true,
                    lastChecked: new Date().toLocaleString(),
                    detectedSite: prev.detectedSite
                }));
                logger.info('Settings', 'cookies_valid', `Cookies validated`);
                message.success(`Cookies validated`);
            } else {
                setCookiesConfig(prev => ({ ...prev, isValid: false }));
                logger.warn('Settings', 'cookies_invalid', 'Invalid cookies');
                message.warning(data.detail || 'Invalid cookies file');
            }
        } catch (error) {
            logger.apiError('Settings', 'POST', '/api/v1/settings/cookies/validate', error as Error);
            message.error('Failed to validate cookies');
        } finally {
            setCheckingCookies(false);
        }
    };

    const handleCookiesUpload = (file: File): boolean => {
        setPendingCookieFile(file);

        // Read file content for preview & detection
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                const site = detectSiteFromCookies(content);
                setCookiesConfig(prev => ({
                    ...prev,
                    content: content,
                    detectedSite: site
                }));
            }
        };
        reader.readAsText(file);

        message.info({ content: 'File selected. Click "Confirm Update" to save.', key: 'uploadKey' });
        return false;
    };

    const handleUpdateCookies = async () => {
        setIsUpdatingCookies(true);
        const formData = new FormData();

        if (pendingCookieFile) {
            formData.append('file', pendingCookieFile);
        } else if (cookiesConfig.content) {
            const blob = new Blob([cookiesConfig.content], { type: 'text/plain' });
            formData.append('file', blob, 'cookies.txt');
        } else {
            message.error("No content to update");
            setIsUpdatingCookies(false);
            return;
        }

        try {
            message.loading({ content: 'Updating cookies...', key: 'uploadKey' });
            const res = await fetch('/api/v1/settings/cookies', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                message.success({ content: 'Cookies updated successfully', key: 'uploadKey' });
                setPendingCookieFile(null);
                setCookiesConfig(prev => ({
                    ...prev,
                    path: data.path,
                    isValid: true
                }));
                checkCookies();
            } else {
                throw new Error("Update failed");
            }
        } catch (e) {
            message.error({ content: 'Failed to update cookies', key: 'uploadKey' });
            logger.error('Settings', 'update_cookies', 'Failed', e as Error);
        } finally {
            setIsUpdatingCookies(false);
        }
    };

    return {
        cookiesConfig,
        setCookiesConfig,
        checkingCookies,
        pendingCookieFile,
        setPendingCookieFile,
        isUpdatingCookies,
        detectSiteFromCookies,
        checkCookies,
        handleCookiesUpload,
        handleUpdateCookies
    };
};
