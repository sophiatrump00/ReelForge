export interface MetaPlacement {
    id: string;
    name: string;
    ratio: string;
    resolution: string;
    types: string[];
    icon: string;
    description: string;
}

export const metaPlacements: MetaPlacement[] = [
    { id: 'feed_1x1', name: 'Feed Square', ratio: '1:1', resolution: '1080×1080', types: ['video', 'image'], icon: '⬛', description: 'Facebook/Instagram Feed' },
    { id: 'feed_4x5', name: 'Feed Portrait', ratio: '4:5', resolution: '1080×1350', types: ['video', 'image'], icon: '📱', description: 'Instagram Feed Optimal' },
    { id: 'stories_9x16', name: 'Stories/Reels', ratio: '9:16', resolution: '1080×1920', types: ['video', 'image'], icon: '📲', description: 'Instagram Stories / Reels' },
    { id: 'instream_16x9', name: 'In-Stream Video', ratio: '16:9', resolution: '1920×1080', types: ['video'], icon: '🖥️', description: 'Facebook In-Stream Ads' },
    { id: 'right_column', name: 'Right Column', ratio: '1.91:1', resolution: '1200×628', types: ['image'], icon: '📰', description: 'Facebook Right Column' },
    { id: 'carousel', name: 'Carousel Card', ratio: '1:1', resolution: '1080×1080', types: ['video', 'image'], icon: '🎠', description: 'Carousel Ad Card' },
    { id: 'marketplace', name: 'Marketplace', ratio: '1:1', resolution: '1080×1080', types: ['video', 'image'], icon: '🛒', description: 'Facebook Marketplace' },
    { id: 'search', name: 'Search Results', ratio: '1.91:1', resolution: '1200×628', types: ['image'], icon: '🔍', description: 'Facebook Search' },
];
