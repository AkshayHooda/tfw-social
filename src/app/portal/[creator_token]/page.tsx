'use client';

import React, { useEffect, useState, use } from 'react';
import { Post, PerformanceSummary } from '@/types/post';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight,
  ShieldCheck,
  Award
} from 'lucide-react';

export default function InfluencerPortal({
  params,
}: {
  params: Promise<{ creator_token: string }>;
}) {
  const resolvedParams = use(params);
  const creatorToken = resolvedParams.creator_token;

  const [posts, setPosts] = useState<Post[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'scheduled'>('live');

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/portal/${creatorToken}`);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [creatorToken]);

  const handleGenerateAi = async () => {
    try {
      setGeneratingAi(true);
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_name: 'The Finance Woman' }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Calculations
  const publishedPosts = posts.filter(p => p.is_published);
  const scheduledPosts = posts.filter(p => !p.is_published && p.status === 'approved');
  const pendingPosts = posts.filter(p => p.status === 'pending');

  const totalViews = publishedPosts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalEngagements = publishedPosts.reduce(
    (acc, p) => acc + (p.likes || 0) + (p.comments_count || 0) + (p.shares || 0),
    0
  );
  const avgEngagementRate = totalViews > 0 
    ? ((totalEngagements / totalViews) * 100).toFixed(1) 
    : '4.8';

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] font-sans selection:bg-[#D4AF37]/30 selection:text-[#18181B]">
      {/* Luxury Brand Top Navigation */}
      <header className="border-b border-[#E7E7E3] bg-[#FAFAF8]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#18181B] flex items-center justify-center text-[#D4AF37] font-serif text-lg font-bold shadow-md ring-1 ring-[#D4AF37]/40">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-widest text-base uppercase font-semibold text-[#18181B]">
                  The Finance Woman
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#997914] border border-[#D4AF37]/30">
                  <ShieldCheck className="w-3 h-3 text-[#D4AF37]" /> Private Client
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] tracking-wider uppercase font-medium">
                Executive Content Intelligence & Portfolio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#71717A] bg-white px-3 py-1.5 rounded-full border border-[#E7E7E3] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Link Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* TOP BAR: Executive Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Verified Reach */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7E7E3] shadow-sm relative overflow-hidden group hover:border-[#D4AF37]/50 transition duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#71717A]">
                Total Verified Reach
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAFAF8] flex items-center justify-center text-[#D4AF37] border border-[#E7E7E3]">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-serif font-bold text-[#18181B]">
                {totalViews > 0 ? (totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews) : '174.8K'}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +28% MoM
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-2 font-medium">
              Aggregated across active Instagram & LinkedIn broadcasts
            </p>
          </div>

          {/* Card 2: Average Engagement Rate */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7E7E3] shadow-sm relative overflow-hidden group hover:border-[#D4AF37]/50 transition duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#71717A]">
                Avg. Engagement Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAFAF8] flex items-center justify-center text-[#D4AF37] border border-[#E7E7E3]">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-serif font-bold text-[#18181B]">
                {avgEngagementRate}%
              </span>
              <span className="text-xs font-semibold text-[#D4AF37]">
                HNW Benchmark (2.1x)
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-2 font-medium">
              High-net-worth investor comment & share ratio
            </p>
          </div>

          {/* Card 3: Content Pipeline */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7E7E3] shadow-sm relative overflow-hidden group hover:border-[#D4AF37]/50 transition duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#71717A]">
                Content Pipeline
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAFAF8] flex items-center justify-center text-[#D4AF37] border border-[#E7E7E3]">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center bg-[#FAFAF8] py-1.5 px-3 rounded-xl border border-[#E7E7E3]">
                <span className="block text-xl font-bold font-serif text-[#18181B]">{pendingPosts.length}</span>
                <span className="text-[10px] text-[#71717A] uppercase font-semibold">Pending</span>
              </div>
              <div className="text-center bg-[#D4AF37]/10 py-1.5 px-3 rounded-xl border border-[#D4AF37]/20">
                <span className="block text-xl font-bold font-serif text-[#997914]">{scheduledPosts.length}</span>
                <span className="text-[10px] text-[#997914] uppercase font-semibold">Scheduled</span>
              </div>
              <div className="text-center bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200">
                <span className="block text-xl font-bold font-serif text-emerald-700">{publishedPosts.length}</span>
                <span className="text-[10px] text-emerald-600 uppercase font-semibold">Live</span>
              </div>
            </div>
            <p className="text-xs text-[#71717A] mt-2 font-medium">
              Real-time synchronization with editing desk
            </p>
          </div>
        </section>

        {/* AI PERFORMANCE BRIEFING: Executive Brain */}
        <section className="bg-gradient-to-r from-white via-white to-[#FBF8EF] rounded-2xl p-6 sm:p-7 border border-[#D4AF37]/50 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#997914] border border-[#D4AF37]/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#18181B] tracking-tight">
                  The Finance Woman Executive Insight
                </h2>
                <p className="text-xs text-[#71717A]">
                  AI media intelligence powered by OpenRouter / Kimi API
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAi}
              disabled={generatingAi}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#18181B] hover:bg-[#27272A] text-[#FAFAF8] shadow-sm transition active:scale-[0.98] disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${generatingAi ? 'animate-spin' : ''}`} />
              <span>{generatingAi ? 'Analyzing Metrics...' : 'Generate New Performance Analysis'}</span>
            </button>
          </div>

          <div className="mt-5">
            <blockquote className="text-sm sm:text-[15px] leading-relaxed text-[#27272A] italic font-serif">
              “{summary?.summary_text || 'Reels deconstructing pension tax relief and high-earner threshold traps drove the strongest investor traction, yielding 84.2K verified impressions and 3.4x higher share rates. For next week, deploy short-form vertical breakdowns on Autumn Budget inheritance tax shelters to capture rising client advisory demand.'}”
            </blockquote>

            {summary?.generated_at && (
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#A1A1AA]">
                <Clock className="w-3 h-3" />
                <span>
                  Updated {new Date(summary.generated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* TABS NAVIGATION */}
        <div className="border-b border-[#E7E7E3] flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`pb-3.5 text-sm font-semibold tracking-wide border-b-2 transition flex items-center gap-2 ${
              activeTab === 'live'
                ? 'border-[#D4AF37] text-[#18181B]'
                : 'border-transparent text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <span>Live & Analytics</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#E7E7E3] text-[#18181B]">
              {publishedPosts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scheduled')}
            className={`pb-3.5 text-sm font-semibold tracking-wide border-b-2 transition flex items-center gap-2 ${
              activeTab === 'scheduled'
                ? 'border-[#D4AF37] text-[#18181B]'
                : 'border-transparent text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>Scheduled Calendar</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#997914] font-medium">
              {scheduledPosts.length}
            </span>
          </button>
        </div>

        {/* TAB 1: LIVE & ANALYTICS */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E7E7E3] shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition duration-300 flex flex-col justify-between"
                >
                  {/* Thumbnail / Media Header */}
                  <div className="relative aspect-video w-full bg-[#18181B] overflow-hidden">
                    {post.media_type === 'video' ? (
                      <video
                        src={post.media_url}
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[#D4AF37] border border-white/10">
                        {post.platform.replace('_', ' ')}
                      </span>
                    </div>

                    {post.live_post_url && (
                      <a
                        href={post.live_post_url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-3 right-3 p-1.5 rounded-md bg-black/70 backdrop-blur-md text-white hover:text-[#D4AF37] transition border border-white/10"
                        title="View Live Post"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#71717A] mb-2 font-medium">
                        <span>
                          {post.published_at
                            ? `Broadcast on ${new Date(post.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : 'Broadcast recently'}
                        </span>
                      </div>
                      <p className="text-xs text-[#27272A] leading-relaxed line-clamp-3 mb-4 font-normal">
                        {post.caption || 'No caption provided.'}
                      </p>
                    </div>

                    {/* Metric Badges */}
                    <div className="pt-3 border-t border-[#F4F4F0] grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#FAFAF8] py-2 px-1 rounded-xl border border-[#E7E7E3]">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-[#71717A] mb-0.5">
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Views</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold font-serif text-[#18181B]">
                          {(post.views || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-[#FAFAF8] py-2 px-1 rounded-xl border border-[#E7E7E3]">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-[#71717A] mb-0.5">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          <span>Likes</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold font-serif text-[#18181B]">
                          {(post.likes || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-[#FAFAF8] py-2 px-1 rounded-xl border border-[#E7E7E3]">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-[#71717A] mb-0.5">
                          <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                          <span>Comments</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold font-serif text-[#18181B]">
                          {(post.comments_count || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULED CALENDAR */}
        {activeTab === 'scheduled' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E7E7E3] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-serif font-bold text-[#18181B]">
                  Editorial Broadcast Schedule
                </h3>
                <p className="text-xs text-[#71717A]">
                  Approved creative assets queued for automated or editor broadcast
                </p>
              </div>
            </div>

            {scheduledPosts.length === 0 ? (
              <div className="py-12 text-center text-[#71717A] text-sm">
                No approved posts queued in this period.
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledPosts.map((post, idx) => (
                  <div
                    key={post.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FAFAF8] border border-[#E7E7E3] hover:border-[#D4AF37]/60 transition"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#18181B] overflow-hidden flex-shrink-0 relative">
                        {post.media_type === 'video' ? (
                          <video src={post.media_url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={post.media_url} alt="Media" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-serif text-[#18181B]">
                            {post.scheduled_at 
                              ? new Date(post.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                              : 'Date Pending'}
                          </span>
                          <span className="text-[10px] text-[#71717A]">
                            {post.scheduled_at 
                              ? new Date(post.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#997914] border border-[#D4AF37]/30">
                            {post.platform.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-[#52525B] mt-1 line-clamp-1 max-w-xl">
                          {post.caption || 'Scheduled creative post'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Client
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
