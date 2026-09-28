import { Post, CreatePostInput, PerformanceSummary } from '@/types/post';
import { randomUUID } from 'crypto';

// Clean slate for TFW.SOCIAL
const mockPosts: Post[] = [];

const mockSummaries: PerformanceSummary[] = [
  {
    id: 'sum-001',
    creator_name: 'The Finance Woman',
    summary_text: 'Welcome to TFW.SOCIAL. Upload creative assets from the Editor Desk to begin private client reviews and performance tracking.',
    best_performing_platform: 'instagram_reel',
    top_post_id: null,
    generated_at: new Date().toISOString(),
  }
];


export const mockStore = {
  getAll: (): Post[] => [...mockPosts].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
  
  getByToken: (token: string): Post | undefined => {
    return mockPosts.find(p => p.token === token || p.creator_name.toLowerCase().replace(/\s+/g, '') === token.toLowerCase().replace(/\s+/g, ''));
  },

  getById: (id: string): Post | undefined => {
    return mockPosts.find(p => p.id === id);
  },

  getByCreator: (creatorNameOrHandle: string): Post[] => {
    const query = creatorNameOrHandle.toLowerCase().replace(/[@\s_-]/g, '');
    return mockPosts.filter(p => {
      const matchName = p.creator_name.toLowerCase().replace(/[@\s_-]/g, '');
      const matchHandle = (p.creator_handle || '').toLowerCase().replace(/[@\s_-]/g, '');
      const matchToken = p.token.toLowerCase();
      return matchName === query || matchHandle === query || matchToken === query;
    });
  },

  create: (data: CreatePostInput): Post => {
    const newPost: Post = {
      id: randomUUID(),
      token: randomUUID(),
      creator_name: data.creator_name,
      creator_handle: data.creator_handle || null,
      platform: data.platform,
      media_url: data.media_url,
      media_type: data.media_type,
      caption: data.caption || null,
      scheduled_at: data.scheduled_at || null,
      status: 'pending',
      feedback: null,
      live_post_url: null,
      is_published: false,
      published_at: null,
      views: 0,
      likes: 0,
      comments_count: 0,
      shares: 0,
      metrics_updated_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockPosts.unshift(newPost);
    return newPost;
  },

  updateByToken: (token: string, updates: Partial<Post>): Post | null => {
    const index = mockPosts.findIndex(p => p.token === token);
    if (index === -1) return null;
    mockPosts[index] = {
      ...mockPosts[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return mockPosts[index];
  },

  updateById: (id: string, updates: Partial<Post>): Post | null => {
    const index = mockPosts.findIndex(p => p.id === id);
    if (index === -1) return null;
    mockPosts[index] = {
      ...mockPosts[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return mockPosts[index];
  },

  getLatestSummary: (creatorName: string): PerformanceSummary | undefined => {
    return mockSummaries.find(s => s.creator_name.toLowerCase().replace(/\s+/g, '') === creatorName.toLowerCase().replace(/\s+/g, '')) || mockSummaries[0];
  },

  saveSummary: (summary: Omit<PerformanceSummary, 'id' | 'generated_at'>): PerformanceSummary => {
    const newSummary: PerformanceSummary = {
      id: randomUUID(),
      ...summary,
      generated_at: new Date().toISOString(),
    };
    mockSummaries.unshift(newSummary);
    return newSummary;
  }
};
