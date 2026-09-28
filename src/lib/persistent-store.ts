import { put, list, del } from '@vercel/blob';
import { Post, CreatePostInput, PerformanceSummary, ContentIdea, CreateIdeaInput } from '@/types/post';
import { randomUUID } from 'crypto';

const POSTS_BLOB_PATH = 'data/posts.json';
const SUMMARIES_BLOB_PATH = 'data/summaries.json';
const SETTINGS_BLOB_PATH = 'data/settings.json';
const IDEAS_BLOB_PATH = 'data/ideas.json';

export interface SystemSettings {
  editor_passcode: string;
  portal_passcode: string;
  notification_email: string;
  smtp_user?: string;
  smtp_pass?: string;
  openai_api_key?: string;
  openrouter_api_key?: string;
}

const defaultSettings: SystemSettings = {
  editor_passcode: process.env.EDITOR_PASSWORD || 'Akshay@987',
  portal_passcode: process.env.INFLUENCER_PORTAL_PASSWORD || 'FINANCE2026',
  notification_email: process.env.EDITOR_NOTIFICATION_EMAIL || 'needingadvice01@gmail.com',
};

const defaultSummaries: PerformanceSummary[] = [
  {
    id: 'sum-001',
    creator_name: 'The Finance Woman',
    summary_text: 'Welcome to TFW.SOCIAL. Upload creative assets from the Editor Desk to begin private client reviews and performance tracking.',
    best_performing_platform: 'instagram_reel',
    top_post_id: null,
    generated_at: new Date().toISOString(),
  }
];

let inMemoryPosts: Post[] = [];
let inMemorySummaries: PerformanceSummary[] = [...defaultSummaries];
let inMemorySettings: SystemSettings = { ...defaultSettings };
let inMemoryIdeas: ContentIdea[] = [];
let isHydrated = false;

async function hydrateFromBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }

  try {
    const { blobs } = await list({ prefix: 'data/' });
    const postsBlob = blobs.find(b => b.pathname === POSTS_BLOB_PATH);
    if (postsBlob) {
      // Append cache buster timestamp to ensure fresh fetch from Vercel Edge CDN
      const res = await fetch(`${postsBlob.url}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          inMemoryPosts = data;
        }
      }
    }

    const summariesBlob = blobs.find(b => b.pathname === SUMMARIES_BLOB_PATH);
    if (summariesBlob) {
      const res = await fetch(`${summariesBlob.url}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          inMemorySummaries = data;
        }
      }
    }

    const settingsBlob = blobs.find(b => b.pathname === SETTINGS_BLOB_PATH);
    if (settingsBlob) {
      const res = await fetch(`${settingsBlob.url}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          inMemorySettings = { ...defaultSettings, ...data };
        }
      }
    }

    const ideasBlob = blobs.find(b => b.pathname === IDEAS_BLOB_PATH);
    if (ideasBlob) {
      const res = await fetch(`${ideasBlob.url}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          inMemoryIdeas = data;
        }
      }
    }
  } catch (err) {
    console.warn('[Blob Store] Could not hydrate from Vercel Blob:', err);
  }
}

async function persistSettingsToBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    const res = await put(SETTINGS_BLOB_PATH, JSON.stringify(inMemorySettings, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return res;
  } catch (err) {
    console.error('[Blob Store] Failed to save settings to Vercel Blob:', err);
  }
}

async function persistPostsToBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    const res = await put(POSTS_BLOB_PATH, JSON.stringify(inMemoryPosts, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return res;
  } catch (err) {
    console.error('[Blob Store] Failed to save posts to Vercel Blob:', err);
  }
}

async function persistIdeasToBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    const res = await put(IDEAS_BLOB_PATH, JSON.stringify(inMemoryIdeas, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return res;
  } catch (err) {
    console.error('[Blob Store] Failed to save ideas to Vercel Blob:', err);
  }
}

export const persistentStore = {
  async getAll(): Promise<Post[]> {
    await hydrateFromBlob();
    return [...inMemoryPosts].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  },

  async getByToken(token: string): Promise<Post | undefined> {
    await hydrateFromBlob();
    return inMemoryPosts.find(
      p => p.token === token || p.creator_name.toLowerCase().replace(/\s+/g, '') === token.toLowerCase().replace(/\s+/g, '')
    );
  },

  async getById(id: string): Promise<Post | undefined> {
    await hydrateFromBlob();
    return inMemoryPosts.find(p => p.id === id);
  },

  async create(data: CreatePostInput): Promise<Post> {
    await hydrateFromBlob();
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

    inMemoryPosts.unshift(newPost);
    await persistPostsToBlob();
    return newPost;
  },

  async updateByToken(token: string, updates: Partial<Post>): Promise<Post | null> {
    await hydrateFromBlob();
    const index = inMemoryPosts.findIndex(p => p.token === token);
    if (index === -1) return null;

    inMemoryPosts[index] = {
      ...inMemoryPosts[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await persistPostsToBlob();
    return inMemoryPosts[index];
  },

  async updateById(id: string, updates: Partial<Post>): Promise<Post | null> {
    await hydrateFromBlob();
    const index = inMemoryPosts.findIndex(p => p.id === id);
    if (index === -1) return null;

    inMemoryPosts[index] = {
      ...inMemoryPosts[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await persistPostsToBlob();
    return inMemoryPosts[index];
  },

  async deleteById(id: string): Promise<boolean> {
    await hydrateFromBlob();
    const index = inMemoryPosts.findIndex(p => p.id === id);
    if (index === -1) return false;

    inMemoryPosts.splice(index, 1);
    await persistPostsToBlob();
    return true;
  },

  async setAll(posts: Post[]): Promise<Post[]> {
    inMemoryPosts = [...posts];
    await persistPostsToBlob();
    return inMemoryPosts;
  },

  async getLatestSummary(creatorName: string): Promise<PerformanceSummary> {
    await hydrateFromBlob();
    return (
      inMemorySummaries.find(
        s => s.creator_name.toLowerCase().replace(/\s+/g, '') === creatorName.toLowerCase().replace(/\s+/g, '')
      ) || inMemorySummaries[0]
    );
  },

  async getSettings(): Promise<SystemSettings> {
    await hydrateFromBlob();
    return { ...inMemorySettings };
  },

  async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    await hydrateFromBlob();
    inMemorySettings = {
      ...inMemorySettings,
      ...updates,
    };
    await persistSettingsToBlob();
    return { ...inMemorySettings };
  },

  async getAllIdeas(): Promise<ContentIdea[]> {
    await hydrateFromBlob();
    return [...inMemoryIdeas].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  },

  async createIdea(data: CreateIdeaInput): Promise<ContentIdea> {
    await hydrateFromBlob();
    const newIdea: ContentIdea = {
      id: randomUUID(),
      creator_name: data.creator_name || 'The Finance Woman',
      title: data.title,
      notes: data.notes,
      links: data.links || [],
      images: data.images || [],
      raw_video_url: data.raw_video_url || null,
      raw_video_name: data.raw_video_name || null,
      category: data.category || 'general',
      priority: data.priority || 'normal',
      stage: data.stage || (data.raw_video_url ? 'filmed' : 'idea'),
      status: 'new',
      linked_post_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    inMemoryIdeas.unshift(newIdea);
    await persistIdeasToBlob();
    return newIdea;
  },

  async updateIdea(id: string, updates: Partial<ContentIdea>): Promise<ContentIdea | null> {
    await hydrateFromBlob();
    const index = inMemoryIdeas.findIndex(i => i.id === id);
    if (index === -1) return null;

    inMemoryIdeas[index] = {
      ...inMemoryIdeas[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await persistIdeasToBlob();
    return inMemoryIdeas[index];
  },

  async deleteIdea(id: string): Promise<boolean> {
    await hydrateFromBlob();
    const index = inMemoryIdeas.findIndex(i => i.id === id);
    if (index === -1) return false;

    inMemoryIdeas.splice(index, 1);
    await persistIdeasToBlob();
    return true;
  },

  async setAllIdeas(ideas: ContentIdea[]): Promise<ContentIdea[]> {
    inMemoryIdeas = [...ideas];
    await persistIdeasToBlob();
    return inMemoryIdeas;
  },
};
