export type PlatformType = 'instagram_reel' | 'instagram_post' | 'instagram_feed' | 'instagram_story' | 'linkedin';
export type MediaType = 'video' | 'image';
export type PostStatus = 'pending' | 'approved' | 'changes_requested' | 'rejected';

export interface Post {
  id: string;
  token: string;
  creator_name: string;
  creator_handle?: string | null;
  platform: PlatformType;
  media_url: string;
  media_urls?: string[] | null;
  media_type: MediaType;
  caption?: string | null;
  scheduled_at?: string | null;
  status: PostStatus;
  feedback?: string | null;
  live_post_url?: string | null;
  is_published?: boolean;
  published_at?: string | null;
  views?: number;
  likes?: number;
  comments_count?: number;
  shares?: number;
  metrics_updated_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PerformanceSummary {
  id: string;
  creator_name: string;
  summary_text: string;
  best_performing_platform?: string | null;
  top_post_id?: string | null;
  generated_at: string;
}

export interface CreatePostInput {
  creator_name: string;
  creator_handle?: string;
  platform: PlatformType;
  media_url: string;
  media_urls?: string[];
  media_type: MediaType;
  caption?: string;
  scheduled_at?: string;
}

export interface ReviewActionInput {
  status: 'approved' | 'changes_requested' | 'rejected';
  feedback?: string;
}

export interface SyncMetricsInput {
  post_id: string;
  live_post_url?: string;
  views?: number;
  likes?: number;
  comments_count?: number;
  shares?: number;
}

export type IdeaCategory = 'reel' | 'story' | 'post' | 'carousel' | 'thought_leadership' | 'general';
export type IdeaPriority = 'normal' | 'high' | 'urgent';
export type IdeaStage = 'idea' | 'filmed' | 'editing' | 'review' | 'approved' | 'scheduled' | 'posted';
export type IdeaStatus = 'new' | 'in_production' | 'drafted' | 'archived';

export interface ContentIdea {
  id: string;
  creator_name: string;
  title: string;
  notes: string;
  links?: string[];
  images?: string[];
  raw_video_url?: string | null;
  raw_video_name?: string | null;
  category?: IdeaCategory;
  priority?: IdeaPriority;
  stage?: IdeaStage;
  status: IdeaStatus;
  linked_post_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateIdeaInput {
  creator_name: string;
  title: string;
  notes: string;
  links?: string[];
  images?: string[];
  raw_video_url?: string | null;
  raw_video_name?: string | null;
  category?: IdeaCategory;
  priority?: IdeaPriority;
  stage?: IdeaStage;
}
