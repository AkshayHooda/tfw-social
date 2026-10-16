'use client';

import React, { useState } from 'react';
import { Post } from '@/types/post';
import { 
  Sparkles, Check, CheckCircle2, MessageSquare, 
  ChevronLeft, ChevronRight, Layers, Eye, RefreshCw, Send, Loader2
} from 'lucide-react';

interface TemplateVaultProps {
  posts: Post[];
  selectedBrand: 'all' | 'The Finance Woman' | 'In Business Together';
  onReviewAction: (post: Post, action: 'approved' | 'changes_requested' | 'rejected', customFeedback?: string) => Promise<void>;
  submittingAction: boolean;
}

export const TemplateVault: React.FC<TemplateVaultProps> = ({
  posts,
  selectedBrand,
  onReviewAction,
  submittingAction
}) => {
  // Helper to detect if a post is a template
  const isTemplatePost = (p: Post) => {
    const combined = `${p.platform || ''} ${p.media_type || ''} ${p.editor_notes || ''} ${p.caption || ''}`.toLowerCase();
    return (
      p.media_type === ('template' as any) ||
      p.platform === ('template' as any) ||
      combined.includes('template ') ||
      combined.includes('template:') ||
      combined.includes('template t') ||
      combined.includes('template_') ||
      combined.includes('(burgundy comparison') ||
      combined.includes('(myth buster') ||
      combined.includes('editorial split') ||
      combined.includes('side-by-side comparison')
    );
  };

  const templatePosts = posts.filter(isTemplatePost);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState<'all' | 'carousel' | 'reel'>('all');

  const filteredTemplates = templatePosts.filter(p => {
    const isCarousel = (p.media_type as string) === 'carousel' || (p.media_urls && p.media_urls.length > 1);
    if (filterType === 'carousel') return isCarousel;
    if (filterType === 'reel') return p.media_type === 'video' || p.platform === 'instagram_reel';
    return true;
  });

  const activePost = filteredTemplates[selectedTemplateIndex] || filteredTemplates[0];

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
                  Design &amp; Template Approval Vault
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/40">
                  Brand Aesthetics
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4c1315]/75 mt-0.5">
                Review and approve master design layouts for carousels and reels. Once approved, these visual styles are saved into the team bank.
              </p>
            </div>
          </div>

          {/* Quick Filter Pill */}
          <div className="flex items-center p-1 bg-[#4c1315]/5 rounded-2xl border border-[#4c1315]/15 text-xs font-bold font-serif-display">
            <button
              type="button"
              onClick={() => { setFilterType('all'); setSelectedTemplateIndex(0); }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${filterType === 'all' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'}`}
            >
              All Templates ({templatePosts.length})
            </button>
            <button
              type="button"
              onClick={() => { setFilterType('carousel'); setSelectedTemplateIndex(0); }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${filterType === 'carousel' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'}`}
            >
              Carousels ({templatePosts.filter(p => (p.media_type as string) === 'carousel' || (p.media_urls && p.media_urls.length > 1)).length})
            </button>
            <button
              type="button"
              onClick={() => { setFilterType('reel'); setSelectedTemplateIndex(0); }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${filterType === 'reel' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'}`}
            >
              Reels &amp; Overlays ({templatePosts.filter(p => p.media_type === 'video' || p.platform === 'instagram_reel').length})
            </button>
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
          /* Template Selection Ribbon */
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filteredTemplates.map((tpl, idx) => {
              const isSelected = selectedTemplateIndex === idx;
              const isApproved = tpl.status === 'approved';
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateIndex(idx)}
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
        )}
      </div>

      {/* Active Template Showcase Card */}
      {activePost && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-[#4c1315]/15 shadow-sm space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Visual Preview (4:5 Mockup Frame) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[400px] aspect-[4/5] bg-[#280c0d] rounded-2xl overflow-hidden shadow-xl border-4 border-[#280c0d] relative group">
                {(activePost.media_type as string) === 'carousel' || (activePost.media_urls && activePost.media_urls.length > 1) ? (
                  (() => {
                    const urls = activePost.media_urls && activePost.media_urls.length > 0 ? activePost.media_urls : [activePost.media_url];
                    const currentIndex = carouselIndices[activePost.id] || 0;
                    return (
                      <div className="relative w-full h-full flex items-center justify-center bg-[#fbf7ee]">
                        <img 
                          src={urls[currentIndex]} 
                          alt={`Template Slide ${currentIndex + 1}`} 
                          className="w-full h-full object-contain"
                        />
                        {/* Slide Navigation Arrows */}
                        {urls.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handlePrevSlide(activePost.id, urls.length); }}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleNextSlide(activePost.id, urls.length); }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs">
                              {urls.map((_, i) => (
                                <span 
                                  key={i} 
                                  className={`w-1.5 h-1.5 rounded-full transition ${i === currentIndex ? 'bg-[#ad9b58] w-3' : 'bg-white/60'}`} 
                                />
                              ))}
                            </div>

                            {/* Badge */}
                            <span className="absolute top-3 right-3 text-[11px] font-mono font-bold bg-black/70 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                              {currentIndex + 1} / {urls.length}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="w-full h-full relative bg-black flex items-center justify-center">
                    <video 
                      src={activePost.media_url} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#4c1315]/65 mt-2.5 text-center font-medium">
                4:5 Portrait Feed Standard (1080 x 1350) • Swipe to review slide transitions
              </p>
            </div>

            {/* RIGHT COLUMN: Template Metadata, Design Notes & Approval Desk */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                {/* Header Tag */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#4c1315]/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#4c1315] text-[#fbf7ee]">
                      Template Specification
                    </span>
                    {activePost.status === 'approved' ? (
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

                {/* Template Name & Design Specification Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#fdf8f4] border-2 border-[#ad9b58]/50 text-left shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#ad9b58]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#4c1315] font-serif-display">
                      Template Design Notes
                    </span>
                  </div>
                  <p className="text-sm text-[#4c1315] font-serif-display font-bold leading-relaxed">
                    {activePost.editor_notes || 'Master Layout Template'}
                  </p>
                  <p className="text-xs text-[#4c1315]/80 leading-relaxed">
                    This template defines the background texture, font sizing, ghost number watermarks, and photo bleed margins. Approving this template confirms the visual layout for future posts in this format.
                  </p>
                </div>

                {/* Example Content / Caption Applied */}
                <div className="p-4 rounded-2xl bg-[#fbf7ee] border border-[#4c1315]/15 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4c1315]/70 block">
                    Example Content Tested On This Layout
                  </span>
                  <p className="text-xs text-[#4c1315]/85 leading-relaxed font-body max-h-36 overflow-y-auto whitespace-pre-line pr-1">
                    {activePost.caption || 'No caption copy attached to this template.'}
                  </p>
                </div>

                {/* Inline Feedback Box */}
                <div className="space-y-1.5">
                  <label htmlFor={`template-reply-${activePost.id}`} className="block text-[11px] font-bold text-[#4c1315]/80 uppercase tracking-wider">
                    Design Feedback or Adjustments (Optional):
                  </label>
                  <textarea
                    id={`template-reply-${activePost.id}`}
                    value={replyTexts[activePost.id] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [activePost.id]: e.target.value }))}
                    placeholder="e.g. Love the typography contrast! Could we try the photo bleed on the left next time?"
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
                  onClick={() => onReviewAction(activePost, 'changes_requested', replyTexts[activePost.id] || 'Tweak requested for this template')}
                  className="px-5 py-2.5 rounded-xl text-xs font-serif-display font-bold border-2 border-[#4c1315]/20 text-[#4c1315] hover:bg-[#4c1315]/5 transition cursor-pointer disabled:opacity-50"
                >
                  Request Tweaks
                </button>
                <button
                  type="button"
                  disabled={submittingAction || activePost.status === 'approved'}
                  onClick={() => onReviewAction(activePost, 'approved', replyTexts[activePost.id])}
                  className="px-6 py-2.5 rounded-xl text-xs font-serif-display font-bold bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#ad9b58]" />
                  ) : (
                    <Check className="w-4 h-4 text-[#ad9b58] stroke-[3]" />
                  )}
                  <span>{activePost.status === 'approved' ? 'Template Approved' : 'Approve Template'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
