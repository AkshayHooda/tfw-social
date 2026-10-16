'use client';

import React, { useState } from 'react';
import { Post } from '@/types/post';
import { 
  Sparkles, Check, CheckCircle2, MessageSquare, 
  ChevronLeft, ChevronRight, Layers, Eye, RefreshCw, Send, Loader2,
  LayoutList, Square
} from 'lucide-react';

interface TemplateVaultProps {
  posts: Post[];
  selectedBrand: 'all' | 'The Finance Woman' | 'In Business Together';
  onReviewAction: (post: Post, action: 'approved' | 'changes_requested' | 'rejected', customFeedback?: string) => Promise<void>;
  submittingAction: boolean;
  onNavigateToTab?: (tab: 'review' | 'templates' | 'calendar' | 'ideas' | 'analytics') => void;
}

export const TemplateVault: React.FC<TemplateVaultProps> = ({
  posts,
  selectedBrand,
  onReviewAction,
  submittingAction,
  onNavigateToTab
}) => {
  // Sort templates so that unapproved/pending templates appear first, followed by approved ones, while preserving numerical order within each group
  const templatePosts = [...posts].sort((a, b) => {
    const isApprovedA = a.status === 'approved' ? 1 : 0;
    const isApprovedB = b.status === 'approved' ? 1 : 0;
    if (isApprovedA !== isApprovedB) return isApprovedA - isApprovedB; // 0 (pending) comes before 1 (approved)

    const numA = parseInt((a.editor_notes || '').match(/Template T(\d+)/i)?.[1] || '999');
    const numB = parseInt((b.editor_notes || '').match(/Template T(\d+)/i)?.[1] || '999');
    if (numA !== numB) return numA - numB;
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeA - timeB;
  });

  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState<'all' | 'carousel' | 'reel'>('all');
  const [viewMode, setViewMode] = useState<'continuous' | 'single'>('continuous');

  const filteredTemplates = templatePosts.filter(p => {
    const isCarousel = (p.media_type as string) === 'carousel' || (p.media_urls && p.media_urls.length > 1);
    if (filterType === 'carousel') return isCarousel;
    if (filterType === 'reel') return p.media_type === 'video' || p.platform === 'instagram_reel';
    return true;
  });

  // Track selected template by post ID: always start with the first template that is not approved
  const firstPending = filteredTemplates.find(p => p.status !== 'approved');
  const [selectedPostId, setSelectedPostId] = useState<string>(firstPending ? firstPending.id : filteredTemplates[0]?.id || '');

  // Keep active post resolved
  const activePost = filteredTemplates.find(p => p.id === selectedPostId) || filteredTemplates[0];

  const handlePrevSlide = (postId: string, total: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + total) % total
    }));
  };

  const handleNextSlide = (postId: string, total: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % total
    }));
  };

  const scrollToTemplate = (id: string) => {
    setSelectedPostId(id);
    if (viewMode === 'continuous') {
      const el = document.getElementById(`template-card-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#4c1315]/15 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4c1315]/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#4c1315] text-[#ad9b58] flex items-center justify-center text-xl shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-[#4c1315]">
                  Slide Design Templates
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/40">
                  Styles
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4c1315]/75 mt-0.5">
                Check and approve slide layouts here. Once approved, the team uses these designs for future posts.
              </p>
            </div>
          </div>

          {/* Quick Notice for Romany: Scan-Friendly */}
          <div className="w-full bg-[#fdf8f4] border-2 border-[#ad9b58]/50 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#ad9b58]/20 flex items-center justify-center shrink-0 text-[#4c1315]">
                <Sparkles className="w-4 h-4 text-[#ad9b58]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#4c1315] font-serif-display uppercase tracking-wider">
                  Layouts &amp; Look Only
                </p>
                <p className="text-xs text-[#4c1315]/80 font-medium">
                  You are only approving the design look here. Actual scheduled posts with real dates and copy will be in{' '}
                  {onNavigateToTab ? (
                    <button
                      type="button"
                      onClick={() => onNavigateToTab('review')}
                      className="inline-flex items-center font-bold underline text-[#4c1315] hover:text-[#ad9b58] transition-colors cursor-pointer"
                    >
                      Needs Review →
                    </button>
                  ) : (
                    <span className="font-bold underline">Needs Review</span>
                  )}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ Check Design
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#4c1315]/10 text-[#4c1315]">
                📅 Dates Later
              </span>
            </div>
          </div>

          {/* Controls Bar: Category Filter + Layout Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Quick Filter Pill */}
            <div className="flex items-center p-1 bg-[#4c1315]/5 rounded-2xl border border-[#4c1315]/15 text-xs font-bold font-serif-display self-start">
              <button
                type="button"
                onClick={() => { setFilterType('all'); }}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${filterType === 'all' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'}`}
              >
                All ({templatePosts.length})
              </button>
              <button
                type="button"
                onClick={() => { setFilterType('carousel'); }}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${filterType === 'carousel' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'}`}
              >
                Carousels ({templatePosts.filter(p => (p.media_type as string) === 'carousel' || (p.media_urls && p.media_urls.length > 1)).length})
              </button>
              <button
                type="button"
                onClick={() => { setFilterType('reel'); }}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${filterType === 'reel' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'}`}
              >
                Reels ({templatePosts.filter(p => p.media_type === 'video' || p.platform === 'instagram_reel').length})
              </button>
            </div>

            {/* Layout Toggle: Continuous Scroll vs Single Focus */}
            <div className="flex items-center p-1 bg-[#4c1315]/5 rounded-2xl border border-[#4c1315]/15 text-xs font-bold font-serif-display self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('continuous')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${viewMode === 'continuous' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'}`}
                title="Scroll top-to-bottom through all templates"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Scroll All</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${viewMode === 'single' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'}`}
                title="View one template at a time"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Single View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 ? (
          <div className="py-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#fbf7ee] text-[#4c1315]/50 flex items-center justify-center mx-auto border border-[#4c1315]/15">
              <Layers className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#4c1315]">
              No Templates Pending in this Category
            </h3>
            <p className="text-xs text-[#4c1315]/70 leading-relaxed font-body">
              All uploaded templates have either been approved into the master bank or no new templates are queued right now.
            </p>
          </div>
        ) : (
          /* Template Selection Ribbon & Quick Jump */
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-[#4c1315]/70 uppercase tracking-wider font-serif-display">
                {viewMode === 'continuous' ? 'Quick Jump To Template' : 'Select Template'}
              </span>
              <span className="text-[10px] text-[#4c1315]/60 font-mono">
                {filteredTemplates.length} styles ready
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {filteredTemplates.map((tpl, idx) => {
                const isSelected = tpl.id === (activePost?.id || selectedPostId);
                const isApproved = tpl.status === 'approved';
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => scrollToTemplate(tpl.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-serif-display font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
                      isSelected 
                        ? 'bg-[#4c1315] text-[#fbf7ee] border-[#ad9b58] shadow-md ring-2 ring-[#ad9b58]/40' 
                        : 'bg-[#fbf7ee] text-[#4c1315] border-[#4c1315]/15 hover:bg-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    <span>
                      {tpl.editor_notes ? tpl.editor_notes.split('·')[0].trim() : `Template #${idx + 1}`}
                    </span>
                    {isApproved && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-800 text-emerald-100 font-sans">
                        Approved
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Template Cards Display (Continuous Vertical Feed vs Single Focused Card) */}
      {(() => {
        const templatesToRender = viewMode === 'continuous' 
          ? filteredTemplates 
          : (activePost ? [activePost] : []);

        if (templatesToRender.length === 0) return null;

        return (
          <div className="space-y-8">
            {templatesToRender.map((post, postIdx) => {
              const urls = (post.media_type as string) === 'carousel' || (post.media_urls && post.media_urls.length > 0)
                ? (post.media_urls && post.media_urls.length > 0 ? post.media_urls : [post.media_url])
                : [post.media_url];
              const currentIndex = carouselIndices[post.id] || 0;
              const isApproved = post.status === 'approved';
              const templateTitle = post.editor_notes ? post.editor_notes.split('·')[0].trim() : `Template #${postIdx + 1}`;

              return (
                <div 
                  key={post.id} 
                  id={`template-card-${post.id}`} 
                  className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-[#4c1315]/15 shadow-sm space-y-6 scroll-mt-6"
                >
                  {/* Card Section Header for Continuous Scrolling */}
                  {viewMode === 'continuous' && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#4c1315]/10">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#4c1315] text-[#ad9b58] font-serif-display font-bold text-sm flex items-center justify-center shadow-xs">
                          {postIdx + 1}
                        </span>
                        <div>
                          <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#4c1315]">
                            {templateTitle}
                          </h3>
                          <span className="text-[11px] text-[#4c1315]/65 font-medium">
                            Style Option {postIdx + 1} of {filteredTemplates.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isApproved ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Approved
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            Pending Review
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Visual Preview (4:5 Mockup Frame) */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                      <div className="w-full max-w-[400px] aspect-[4/5] bg-[#280c0d] rounded-2xl overflow-hidden shadow-xl border-4 border-[#280c0d] relative group">
                        {(post.media_type as string) === 'carousel' || (post.media_urls && post.media_urls.length > 1) ? (
                          <div className="relative w-full h-full flex items-center justify-center bg-[#fbf7ee]">
                            {/* Hidden preloader elements */}
                            <div className="hidden pointer-events-none" aria-hidden="true">
                              {urls.map((u, idx) => (
                                <img key={idx} src={u} alt="" loading="eager" />
                              ))}
                            </div>

                            <img 
                              key={`${post.id}-${currentIndex}`}
                              src={urls[currentIndex]} 
                              alt={`Template Slide ${currentIndex + 1}`} 
                              className="w-full h-full object-contain select-none"
                              decoding="async"
                              loading="eager"
                            />

                            {/* Slide Navigation Arrows */}
                            {urls.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handlePrevSlide(post.id, urls.length); }}
                                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/65 hover:bg-black text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs shadow-md border border-white/20 active:scale-95"
                                  title="Previous slide"
                                  aria-label="Previous slide"
                                >
                                  <ChevronLeft className="w-5 h-5 -ml-0.5 stroke-[2.5]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleNextSlide(post.id, urls.length); }}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/65 hover:bg-black text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs shadow-md border border-white/20 active:scale-95"
                                  title="Next slide"
                                  aria-label="Next slide"
                                >
                                  <ChevronRight className="w-5 h-5 -mr-0.5 stroke-[2.5]" />
                                </button>

                                {/* Dots Indicator */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs">
                                  {urls.map((_, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCarouselIndices(prev => ({ ...prev, [post.id]: i }));
                                      }}
                                      className={`h-1.5 rounded-full transition-all cursor-pointer ${i === currentIndex ? 'bg-[#ad9b58] w-4' : 'bg-white/60 hover:bg-white w-1.5'}`}
                                      title={`Go to slide ${i + 1}`}
                                      aria-label={`Go to slide ${i + 1}`}
                                    />
                                  ))}
                                </div>

                                {/* Badge */}
                                <span className="absolute top-3 right-3 text-[11px] font-mono font-bold bg-black/75 text-white px-2.5 py-0.5 rounded-md backdrop-blur-xs border border-white/10 shadow-xs">
                                  {currentIndex + 1} / {urls.length}
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full relative bg-black flex items-center justify-center">
                            <video 
                              src={post.media_url} 
                              controls 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Instant Slide Filmstrip Selector */}
                      {((post.media_type as string) === 'carousel' || (post.media_urls && post.media_urls.length > 1)) && (
                        <div className="w-full max-w-[400px] mt-3">
                          <div className="flex items-center justify-between mb-1.5 px-1">
                            <span className="text-[11px] font-bold text-[#4c1315] uppercase tracking-wider font-serif-display">
                              Quick Slide Strip
                            </span>
                            <span className="text-[10px] text-[#4c1315]/70 font-mono">
                              Click any slide to jump instantly
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#fbf7ee] rounded-xl border border-[#4c1315]/15 scrollbar-thin">
                            {urls.map((url, sIdx) => {
                              const isCur = sIdx === currentIndex;
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => setCarouselIndices(prev => ({ ...prev, [post.id]: sIdx }))}
                                  className={`relative shrink-0 w-12 aspect-[4/5] rounded-lg overflow-hidden border-2 transition cursor-pointer group/thumb ${
                                    isCur
                                      ? 'border-[#4c1315] ring-2 ring-[#ad9b58] shadow-md scale-105'
                                      : 'border-neutral-200 opacity-60 hover:opacity-100 hover:border-[#4c1315]/50'
                                  }`}
                                  title={`Jump to slide ${sIdx + 1}`}
                                >
                                  <img 
                                    src={url} 
                                    alt={`Thumb ${sIdx + 1}`} 
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                  />
                                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] font-bold text-white text-center py-0.2">
                                    {sIdx + 1}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-[#4c1315]/65 mt-2 text-center font-medium">
                        4:5 Portrait Feed Standard (1080 x 1350) • Instant slide transitions
                      </p>
                    </div>

                    {/* RIGHT COLUMN: Template Metadata, Design Notes & Approval Desk */}
                    <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-4">
                        {/* Header Tag in Single View */}
                        {viewMode === 'single' && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#4c1315]/10">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#4c1315] text-[#fbf7ee]">
                                Template Specification
                              </span>
                              {isApproved ? (
                                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                                  <Check className="w-3 h-3 stroke-[3]" /> Approved for Production
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                                  Pending Romany Review
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Template Name & Design Specification Box */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#fdf8f4] border-2 border-[#ad9b58]/50 text-left shadow-xs space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#ad9b58]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4c1315] font-serif-display">
                              Style Details
                            </span>
                          </div>
                          <div className="text-xs sm:text-[13px] text-[#4c1315] leading-relaxed whitespace-pre-line font-medium bg-white/70 p-3 rounded-xl border border-[#ad9b58]/30">
                            {post.editor_notes || 'Design Template'}
                          </div>
                          <p className="text-[11px] text-[#4c1315]/75 leading-relaxed">
                            Approving confirms this visual style for future posts.
                          </p>
                        </div>

                        {/* Example Content / Caption Applied */}
                        <div className="p-4 rounded-2xl bg-[#fbf7ee] border border-[#4c1315]/15 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4c1315]/70 block">
                            Example Text Used In This Demo
                          </span>
                          <p className="text-xs text-[#4c1315]/85 leading-relaxed font-body max-h-36 overflow-y-auto whitespace-pre-line pr-1">
                            {post.caption || 'No caption text for this design.'}
                          </p>
                        </div>

                        {/* Inline Feedback Box */}
                        <div className="space-y-1.5">
                          <label htmlFor={`template-reply-${post.id}`} className="block text-[11px] font-bold text-[#4c1315]/80 uppercase tracking-wider">
                            Notes or changes (optional):
                          </label>
                          <textarea
                            id={`template-reply-${post.id}`}
                            value={replyTexts[post.id] || ''}
                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Type any quick notes or changes here..."
                            rows={2}
                            className="w-full p-3 rounded-xl bg-white border border-[#ad9b58]/40 text-xs sm:text-sm text-[#280c0d] placeholder:text-[#4c1315]/40 focus:outline-none focus:border-[#4c1315] resize-none"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-[#4c1315]/10 flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          disabled={submittingAction}
                          onClick={() => onReviewAction(post, 'changes_requested', replyTexts[post.id] || 'Tweak requested for this template')}
                          className="px-5 py-2.5 rounded-xl text-xs font-serif-display font-bold border-2 border-[#4c1315]/20 text-[#4c1315] hover:bg-[#4c1315]/5 transition cursor-pointer disabled:opacity-50"
                        >
                          Request Tweaks
                        </button>
                        <button
                          type="button"
                          disabled={submittingAction || isApproved}
                          onClick={() => onReviewAction(post, 'approved', replyTexts[post.id])}
                          className="px-6 py-2.5 rounded-xl text-xs font-serif-display font-bold bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {submittingAction ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#ad9b58]" />
                          ) : (
                            <Check className="w-4 h-4 text-[#ad9b58] stroke-[3]" />
                          )}
                          <span>{isApproved ? 'Template Approved' : 'Approve Template'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};
