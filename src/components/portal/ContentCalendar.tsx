'use client';

import React, { useState } from 'react';
import { Post } from '@/types/post';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  ExternalLink, 
  Video, 
  Image as ImageIcon, 
  Filter, 
  Grid, 
  List, 
  X, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { InstagramReelPreview } from '@/components/previews/InstagramReelPreview';
import { InstagramPostPreview } from '@/components/previews/InstagramPostPreview';
import { InstagramStoryPreview } from '@/components/previews/InstagramStoryPreview';
import { LinkedInPreview } from '@/components/previews/LinkedInPreview';

interface ContentCalendarProps {
  posts: Post[];
  selectedBrand: 'all' | 'The Finance Woman' | 'In Business Together';
  onSelectReviewPost?: (postId: string) => void;
}

export function ContentCalendar({ posts, selectedBrand, onSelectReviewPost }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'posted' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [inspectingPost, setInspectingPost] = useState<Post | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Filter posts by selected brand
  const brandFilteredPosts = posts.filter(p => {
    if (selectedBrand === 'all') return true;
    const name = (p.creator_name || '').toLowerCase();
    if (selectedBrand === 'The Finance Woman') {
      return name.includes('finance') || (!name.includes('business'));
    }
    if (selectedBrand === 'In Business Together') {
      return name.includes('business');
    }
    return true;
  });

  // Filter posts by status
  const filteredPosts = brandFilteredPosts.filter(p => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'posted') return p.is_published;
    if (statusFilter === 'scheduled') return p.status === 'approved' && !p.is_published;
    if (statusFilter === 'pending') return p.status === 'pending' || p.status === 'changes_requested';
    return true;
  });

  // Helper to find posts on a specific day of the active month
  const getPostsForDay = (dayNumber: number) => {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    
    return filteredPosts.filter(p => {
      // 1. Check scheduled_at
      if (p.scheduled_at) {
        const d = new Date(p.scheduled_at);
        const postDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (postDateStr === targetDateStr) return true;
      }
      // 2. If published, check published_at
      if (p.is_published && p.published_at) {
        const d = new Date(p.published_at);
        const postDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (postDateStr === targetDateStr) return true;
      }
      // 3. Fallback to created_at if neither scheduled nor published date is set
      if (!p.scheduled_at && !p.published_at && p.created_at) {
        const d = new Date(p.created_at);
        const postDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (postDateStr === targetDateStr) return true;
      }
      return false;
    });
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Status counts
  const totalPosted = brandFilteredPosts.filter(p => p.is_published).length;
  const totalScheduled = brandFilteredPosts.filter(p => p.status === 'approved' && !p.is_published).length;
  const totalPending = brandFilteredPosts.filter(p => p.status === 'pending').length;

  const handleCopyCaption = (text?: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* CALENDAR HEADER & CONTROLS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4c1315]/15 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#4c1315]/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/30">
                Editorial Schedule
              </span>
              <span className="text-xs text-[#4c1315]/60 font-medium">
                {selectedBrand === 'all' ? 'All Brands' : selectedBrand}
              </span>
            </div>
            <h2 className="text-2xl font-serif-display font-bold text-[#4c1315]">
              Content Release Calendar
            </h2>
            <p className="text-xs text-[#4c1315]/75 mt-0.5">
              Inspect scheduled releases, broadcast dates, and live published content across your social pipeline.
            </p>
          </div>

          {/* Month Navigation & Today */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#fbf7ee] rounded-2xl p-1 border border-[#4c1315]/15">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl text-[#4c1315] hover:bg-[#4c1315]/10 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-4 py-1 font-serif-display font-bold text-sm text-[#4c1315] min-w-[140px] text-center">
                {monthNames[month]} {year}
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl text-[#4c1315] hover:bg-[#4c1315]/10 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={goToToday}
              className="px-3.5 py-2 rounded-xl text-xs font-bold font-serif-display bg-[#4c1315]/10 text-[#4c1315] hover:bg-[#4c1315] hover:text-[#fbf7ee] transition border border-[#4c1315]/20 cursor-pointer"
            >
              Today
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#fbf7ee] rounded-xl p-1 border border-[#4c1315]/15 ml-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/60 hover:text-[#4c1315]'}`}
                title="Month Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'timeline' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/60 hover:text-[#4c1315]'}`}
                title="Timeline List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* STATUS FILTER BUTTONS & SUMMARY COUNTERS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#4c1315]/70 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#ad9b58]" /> Filter:
            </span>

            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs'
                  : 'bg-[#fbf7ee] text-[#4c1315]/70 hover:text-[#4c1315] border border-[#4c1315]/15'
              }`}
            >
              All Posts ({brandFilteredPosts.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('scheduled')}
              className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'scheduled'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approved & Scheduled ({totalScheduled})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('posted')}
              className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'posted'
                  ? 'bg-[#ad9b58] text-[#280c0d] shadow-2xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ad9b58]" />
              <span>Posted Live ({totalPosted})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50/70 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>In Review / Pending ({totalPending})</span>
            </button>
          </div>

          {/* Legend */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-[#4c1315]/70">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ad9b58]" /> Posted Live
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Awaiting Review
            </span>
          </div>
        </div>

        {/* VIEW 1: MONTHLY 7-COLUMN CALENDAR GRID */}
        {viewMode === 'grid' && (
          <div className="border border-[#4c1315]/15 rounded-2xl overflow-hidden bg-white">
            {/* Days of week header */}
            <div className="grid grid-cols-7 bg-[#fbf7ee] border-b border-[#4c1315]/15 text-center text-[11px] font-bold font-serif-display text-[#4c1315] uppercase tracking-wider py-3">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 auto-rows-[115px] sm:auto-rows-[135px] divide-x divide-y divide-[#4c1315]/10">
              {/* Previous Month Padding */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                const prevDay = daysInPrevMonth - firstDayOfWeek + i + 1;
                return (
                  <div key={`prev-${i}`} className="p-2 bg-[#fbf7ee]/40 text-[#4c1315]/30 text-xs font-medium">
                    <span>{prevDay}</span>
                  </div>
                );
              })}

              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = isCurrentMonth && dayNum === todayDate;
                const dayPosts = getPostsForDay(dayNum);

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`p-1.5 sm:p-2.5 flex flex-col justify-between transition relative overflow-hidden group ${
                      isToday ? 'bg-[#ad9b58]/10 font-bold' : 'hover:bg-[#fbf7ee]/60'
                    }`}
                  >
                    {/* Day number header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-serif-display ${
                          isToday
                            ? 'w-6 h-6 rounded-full bg-[#4c1315] text-[#fbf7ee] flex items-center justify-center font-bold shadow-2xs'
                            : 'text-[#4c1315] font-semibold'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {dayPosts.length > 0 && (
                        <span className="text-[10px] font-bold text-[#4c1315]/70 bg-[#4c1315]/10 px-1.5 py-0.2 rounded-full sm:hidden">
                          {dayPosts.length}
                        </span>
                      )}
                    </div>

                    {/* Posts chips container inside cell */}
                    <div className="space-y-1.5 mt-1 overflow-y-auto max-h-[85px] sm:max-h-[95px] pr-0.5">
                      {dayPosts.map((post) => {
                        const isLive = post.is_published;
                        const isApproved = post.status === 'approved' && !isLive;
                        const isPending = post.status === 'pending';
                        const isIBT = (post.creator_name || '').toLowerCase().includes('business');

                        const chipStyle = isLive
                          ? 'bg-[#ad9b58]/25 text-[#280c0d] border-[#ad9b58]/50 hover:bg-[#ad9b58]/35'
                          : isApproved
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100';

                        const timeDisplay = post.scheduled_at 
                          ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '';

                        return (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => setInspectingPost(post)}
                            className={`w-full text-left p-1 sm:p-1.5 rounded-lg border text-[10px] transition block cursor-pointer shadow-2xs ${chipStyle}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5 font-bold">
                              <span className="truncate flex items-center gap-1">
                                {post.media_type === 'video' ? (
                                  <Video className="w-2.5 h-2.5 flex-shrink-0" />
                                ) : (
                                  <ImageIcon className="w-2.5 h-2.5 flex-shrink-0" />
                                )}
                                <span className={`text-[8px] uppercase tracking-wider px-1 py-0.2 rounded font-bold ${
                                  isIBT ? 'bg-[#A8442A] text-white' : 'bg-[#4c1315] text-[#fbf7ee]'
                                }`}>
                                  {isIBT ? 'IBT' : 'TFW'}
                                </span>
                              </span>
                              {timeDisplay && (
                                <span className="text-[9px] opacity-80 flex-shrink-0 font-mono">
                                  {timeDisplay}
                                </span>
                              )}
                            </div>

                            <p className="line-clamp-1 font-medium text-[10px] leading-tight">
                              {post.caption || 'Creative Draft'}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Trailing blanks for remaining cells to complete grid */}
              {Array.from({
                length: (7 - ((firstDayOfWeek + daysInMonth) % 7)) % 7
              }).map((_, i) => (
                <div key={`next-${i}`} className="p-2 bg-[#fbf7ee]/40 text-[#4c1315]/30 text-xs font-medium">
                  <span>{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: TIMELINE / AGENDA FEED */}
        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="py-12 text-center text-[#4c1315]/60 text-sm">
                No posts found matching your current filter in this schedule.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => {
                  const isLive = post.is_published;
                  const isApproved = post.status === 'approved' && !isLive;
                  const isPending = post.status === 'pending';
                  const isIBT = (post.creator_name || '').toLowerCase().includes('business');

                  return (
                    <div
                      key={post.id}
                      onClick={() => setInspectingPost(post)}
                      className="p-4 rounded-2xl bg-[#fbf7ee] border border-[#4c1315]/15 hover:border-[#ad9b58] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-[#280c0d] overflow-hidden flex-shrink-0 relative border border-[#4c1315]/20">
                          {(() => {
                            const cover = post.media_urls && post.media_urls.length > 1
                              ? post.media_urls.find(u => u !== post.media_url && !u.endsWith('.mp4') && !u.endsWith('.mov'))
                              : null;
                            if (cover) {
                              return <img src={cover} alt="Cover" className="w-full h-full object-cover" />;
                            }
                            if (post.media_type === 'video') {
                              return <video src={post.media_url} className="w-full h-full object-cover" />;
                            }
                            return <img src={post.media_url} alt="Media" className="w-full h-full object-cover" />;
                          })()}
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] p-0.5 rounded">
                            {post.media_type === 'video' ? <Video className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                          </span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                              isIBT ? 'bg-[#A8442A] text-white' : 'bg-[#4c1315] text-[#fbf7ee]'
                            }`}>
                              {isIBT ? 'In Business Together' : 'The Finance Woman'}
                            </span>

                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ad9b58]/20 text-[#4c1315]">
                              {post.platform.replace('_', ' ')}
                            </span>

                            <span className="text-xs font-semibold text-[#4c1315]/70 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-[#ad9b58]" />
                              {post.scheduled_at 
                                ? new Date(post.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : post.published_at
                                ? `Posted ${new Date(post.published_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                                : `Created ${new Date(post.created_at || '').toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
                            </span>
                          </div>

                          <p className="text-xs text-[#280c0d] font-medium line-clamp-2 max-w-xl">
                            {post.caption || 'Creative draft'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {isLive && (
                          <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold bg-[#ad9b58]/25 text-[#4c1315] border border-[#ad9b58]/40">
                            <Sparkles className="w-3 h-3 text-[#ad9b58]" /> Live Broadcast
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved &amp; Queued
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" /> Awaiting Review
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-[#4c1315]/40" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* INSPECTION MODAL / DRAWER */}
      {inspectingPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-[#4c1315]/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#fbf7ee] border-b border-[#4c1315]/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                  (inspectingPost.creator_name || '').toLowerCase().includes('business')
                    ? 'bg-[#A8442A] text-white'
                    : 'bg-[#4c1315] text-[#fbf7ee]'
                }`}>
                  {inspectingPost.creator_name || 'The Finance Woman'}
                </span>
                <span className="text-xs font-serif-display font-bold text-[#4c1315]">
                  Post Details
                </span>
              </div>

              <button
                type="button"
                onClick={() => setInspectingPost(null)}
                className="p-1.5 rounded-full hover:bg-[#4c1315]/10 text-[#4c1315] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Media Preview Stage - Native Platform Mockup */}
              <div className="w-full flex justify-center py-2">
                {inspectingPost.platform === 'instagram_reel' ? (
                  <div className="w-full max-w-[340px] drop-shadow-xl">
                    <InstagramReelPreview post={inspectingPost} />
                  </div>
                ) : inspectingPost.platform === 'instagram_story' ? (
                  <div className="w-full max-w-[340px] drop-shadow-xl">
                    <InstagramStoryPreview post={inspectingPost} />
                  </div>
                ) : inspectingPost.platform === 'linkedin' ? (
                  <div className="w-full max-w-[480px]">
                    <LinkedInPreview post={inspectingPost} />
                  </div>
                ) : (
                  <div className="w-full max-w-[420px] drop-shadow-xl">
                    <InstagramPostPreview post={inspectingPost} />
                  </div>
                )}
              </div>

              {/* Status and Platform Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {inspectingPost.platform === 'facebook_group' || (inspectingPost.editor_notes || '').toLowerCase().includes('pet accountant') ? (
                    <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#ad9b58] text-[#4c1315] border border-[#ad9b58]/50 flex items-center gap-1 font-serif-display">
                      🐾 Facebook Group • The Pet Accountant
                    </span>
                  ) : (
                    <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/30">
                      {inspectingPost.platform.replace('_', ' ')}
                    </span>
                  )}
                  {inspectingPost.is_published ? (
                    <span className="px-2.5 py-1 rounded-full font-bold bg-[#ad9b58]/25 text-[#4c1315]">
                      🟢 Live Published
                    </span>
                  ) : inspectingPost.status === 'approved' ? (
                    <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      🔵 Approved &amp; Queued
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800">
                      🟡 Pending Client Review
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#4c1315]/70 font-mono">
                  {inspectingPost.scheduled_at
                    ? `Scheduled: ${new Date(inspectingPost.scheduled_at).toLocaleString()}`
                    : inspectingPost.published_at
                    ? `Live: ${new Date(inspectingPost.published_at).toLocaleString()}`
                    : `Created: ${new Date(inspectingPost.created_at || '').toLocaleDateString()}`}
                </div>
              </div>

              {/* Caption & Copy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider font-bold text-[#4c1315]/80 font-serif-display">
                    Caption &amp; Editorial Copy
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyCaption(inspectingPost.caption)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#4c1315] hover:text-[#ad9b58] font-semibold transition cursor-pointer"
                  >
                    {copiedCaption ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
                  </button>
                </div>
                <div className="p-3.5 bg-[#fbf7ee] rounded-xl border border-[#4c1315]/15 text-xs text-[#280c0d] font-serif-display leading-relaxed whitespace-pre-wrap max-h-44 overflow-y-auto">
                  {inspectingPost.caption || 'No caption provided.'}
                </div>
              </div>

              {/* Live Link (if available) */}
              {inspectingPost.live_post_url && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-900 font-semibold truncate max-w-sm">
                    {inspectingPost.live_post_url}
                  </span>
                  <a
                    href={inspectingPost.live_post_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline flex-shrink-0"
                  >
                    <span>View Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-[#fbf7ee] border-t border-[#4c1315]/15 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInspectingPost(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4c1315] hover:bg-[#4c1315]/10 transition cursor-pointer"
              >
                Close
              </button>

              {inspectingPost.status === 'pending' && onSelectReviewPost && (
                <button
                  type="button"
                  onClick={() => {
                    const id = inspectingPost.id;
                    setInspectingPost(null);
                    onSelectReviewPost(id);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold font-serif-display bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Review Draft Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ad9b58]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
