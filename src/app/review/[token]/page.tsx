'use client';

import React, { useEffect, useState, use } from 'react';
import { Post } from '@/types/post';
import { InstagramReelPreview } from '@/components/previews/InstagramReelPreview';
import { InstagramPostPreview } from '@/components/previews/InstagramPostPreview';
import { InstagramStoryPreview } from '@/components/previews/InstagramStoryPreview';
import { LinkedInPreview } from '@/components/previews/LinkedInPreview';
import { CheckCircle2, AlertCircle, Sparkles, Clock, MessageSquare, Loader2, Check, XCircle, SlidersHorizontal, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFormat, setPreviewFormat] = useState<'reel' | 'story' | 'feed'>('reel');
  const [isCleanMode, setIsCleanMode] = useState<boolean>(true);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);

  // Changes requested state
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Confirmation screen
  const [confirmedStatus, setConfirmedStatus] = useState<'approved' | 'changes_requested' | 'rejected' | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const res = await fetch(`/api/review/${token}`);
        const data = await res.json();
        if (!res.ok || !data.post) {
          throw new Error(data.error || 'Failed to load post');
        }
        setPost(data.post);
        if (data.post.platform === 'instagram_post' || data.post.platform === 'instagram_feed' || data.post.media_type === 'image') {
          setPreviewFormat('feed');
        } else {
          setPreviewFormat('reel');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Invalid or expired review link');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchPost();
    }
  }, [token]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ad9b58', '#4c1315', '#c8b87a', '#280c0d'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/review/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve');

      setPost(data.post);
      setConfirmedStatus('approved');
      triggerConfetti();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit approval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisapprove = async () => {
    if (!confirm('Disapprove this post? Your editor will be notified.')) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/review/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit disapproval');

      setPost(data.post);
      setConfirmedStatus('rejected');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit disapproval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      alert('Please provide some notes on what changes are needed.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/review/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'changes_requested',
          feedback: feedbackText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit changes request');

      setPost(data.post);
      setConfirmedStatus('changes_requested');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf7ee] text-[#280c0d] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-[#4c1315] animate-spin mb-4" />
        <p className="text-sm font-serif-display font-medium text-[#4c1315]/80">Loading post preview...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#fbf7ee] text-[#280c0d] flex flex-col items-center justify-center p-6 text-center font-body">
        <div className="w-16 h-16 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-700 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-serif-display font-bold text-[#4c1315] mb-2">Review Link Unavailable</h1>
        <p className="text-[#4c1315]/70 text-sm max-w-md mb-6 leading-relaxed">
          {error || 'This review link is invalid, expired, or has been removed.'}
        </p>
      </div>
    );
  }

  // Confirmation screen when action is taken
  if (confirmedStatus === 'approved') {
    return (
      <div className="min-h-screen bg-[#fbf7ee] text-[#280c0d] flex flex-col items-center justify-center p-6 text-center font-body animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-700 mb-6 shadow-lg">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/40 mb-3 font-serif-display">
          <Sparkles className="w-3.5 h-3.5 text-[#ad9b58]" /> Post Approved & Locked
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#4c1315] mb-3 tracking-tight">Approved for Broadcast!</h1>
        <p className="text-[#4c1315]/75 text-sm max-w-md mb-8 leading-relaxed">
          Thank you! Your editor has been notified by email and the post is now queued in your editorial broadcast calendar.
        </p>
        <button
          type="button"
          onClick={() => setConfirmedStatus(null)}
          className="text-xs text-[#4c1315]/70 hover:text-[#4c1315] underline underline-offset-4 transition font-medium"
        >
          Return to preview
        </button>
      </div>
    );
  }

  if (confirmedStatus === 'changes_requested') {
    return (
      <div className="min-h-screen bg-[#fbf7ee] text-[#280c0d] flex flex-col items-center justify-center p-6 text-center font-body animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-amber-800 mb-6 shadow-lg">
          <MessageSquare className="w-9 h-9" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-3 font-serif-display">
          Edits Dispatched
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#4c1315] mb-3 tracking-tight">Changes Sent to Editor</h1>
        <p className="text-[#4c1315]/75 text-sm max-w-md mb-8 leading-relaxed">
          Your editor has received your exact notes by email and will revise the draft accordingly. You will get a refreshed link once it is ready.
        </p>
        <button
          type="button"
          onClick={() => setConfirmedStatus(null)}
          className="text-xs text-[#4c1315]/70 hover:text-[#4c1315] underline underline-offset-4 transition font-medium"
        >
          Return to preview
        </button>
      </div>
    );
  }

  if (confirmedStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-[#fbf7ee] text-[#280c0d] flex flex-col items-center justify-center p-6 text-center font-body animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center text-red-700 mb-6 shadow-lg">
          <XCircle className="w-9 h-9" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 mb-3 font-serif-display">
          Post Disapproved
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#4c1315] mb-3 tracking-tight">Broadcast Cancelled</h1>
        <p className="text-[#4c1315]/75 text-sm max-w-md mb-8 leading-relaxed">
          The draft has been marked as disapproved and removed from the upcoming schedule. Your editor has been notified by email.
        </p>
        <button
          type="button"
          onClick={() => setConfirmedStatus(null)}
          className="text-xs text-[#4c1315]/70 hover:text-[#4c1315] underline underline-offset-4 transition font-medium"
        >
          Return to preview
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf7ee] text-[#280c0d] flex flex-col justify-between font-body selection:bg-[#4c1315] selection:text-[#fbf7ee]">
      {/* Top Banner & Authentic Logo */}
      <header className="sticky top-0 z-30 bg-[#fbf7ee]/95 backdrop-blur-md border-b border-[#4c1315]/15 px-4 py-3.5 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/tfw-logo.svg" 
              alt="The Finance Woman" 
              className="h-8 w-auto object-contain"
            />
            <span className="text-xs text-[#4c1315]/40">|</span>
            <span className="text-xs font-bold font-serif-display text-[#4c1315] truncate max-w-[160px] sm:max-w-[220px]">
              {post.creator_name}
            </span>
          </div>

          {/* Status Badge */}
          <div>
            {post.status === 'approved' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
              </span>
            )}
            {post.status === 'changes_requested' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Changes Requested
              </span>
            )}
            {post.status === 'rejected' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                <XCircle className="w-3.5 h-3.5 text-red-600" /> Disapproved
              </span>
            )}
            {post.status === 'pending' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/40">
                <Clock className="w-3.5 h-3.5 text-[#ad9b58]" /> Pending Review
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (Spacious Executive Studio Layout) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-[#4c1315]/15 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: 5 COLS - STUDIO PLAYER */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* Format Switcher */}
              {post.platform !== 'linkedin' && (
                <div className="w-full max-w-[380px] mb-3 flex items-center justify-between bg-[#fbf7ee] p-1.5 rounded-2xl border border-[#4c1315]/15">
                  <span className="text-[10px] font-bold text-[#4c1315]/70 pl-2 uppercase tracking-wider">
                    Format:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewFormat('feed')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer ${
                        previewFormat === 'feed' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                      }`}
                    >
                      Feed Post
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewFormat('reel')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer ${
                        previewFormat === 'reel' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                      }`}
                    >
                      Reel (9:16)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewFormat('story')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer ${
                        previewFormat === 'story' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                      }`}
                    >
                      Story
                    </button>
                  </div>
                </div>
              )}

              {/* View Mode Switcher (Clean Video vs IG App Simulation) */}
              {previewFormat !== 'feed' && post.platform !== 'linkedin' && (
                <div className="w-full max-w-[380px] flex items-center justify-between bg-white p-1.5 rounded-2xl border border-[#4c1315]/15 mb-3 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#4c1315]/70 pl-2 uppercase tracking-wider flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-[#ad9b58]" /> View Mode:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsCleanMode(true)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer ${
                        isCleanMode ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                      }`}
                    >
                      Clean Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCleanMode(false)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer ${
                        !isCleanMode ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                      }`}
                    >
                      Instagram UI
                    </button>
                  </div>
                </div>
              )}

              {/* Phone / Post Mockup Frame */}
              <div className="w-full max-w-[440px] my-2">
                {post.platform === 'linkedin' ? (
                  <LinkedInPreview post={post} />
                ) : previewFormat === 'story' ? (
                  <InstagramStoryPreview post={post} cleanMode={isCleanMode} />
                ) : previewFormat === 'feed' ? (
                  <InstagramPostPreview post={post} />
                ) : (
                  <InstagramReelPreview post={post} cleanMode={isCleanMode} />
                )}
              </div>

              {/* Guidance pill */}
              <div className="mt-2 text-center">
                <span className="text-[11px] text-[#4c1315]/70 font-medium">
                  {previewFormat === 'feed'
                    ? 'Instagram Feed Post: 100% uncropped graphic with authentic feed interactions.'
                    : isCleanMode 
                    ? 'Clean Video: Speaker & subtitles are 100% visible.' 
                    : 'Instagram Simulation: Checking layout margins.'}
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: 7 COLS - EDITORIAL & DECISION DESK */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full">
              <div>
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#4c1315]/10 mb-4 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/40">
                      {post.platform.replace('_', ' ')} • {previewFormat.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      Action Required
                    </span>
                  </div>
                  <div className="text-xs text-[#4c1315]/70 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#ad9b58]" />
                    <span>
                      {post.scheduled_at
                        ? `Scheduled: ${new Date(post.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                        : 'Broadcast: Immediately upon approval'}
                    </span>
                  </div>
                </div>

                {/* Hook Spotlight */}
                {post.caption && (
                  <div className="p-4 rounded-2xl bg-[#ad9b58]/15 border border-[#ad9b58]/30 mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4c1315]/80">
                        Opening Video Hook
                      </span>
                      <span className="text-[10px] font-semibold text-[#4c1315]/60">
                        First 3 Seconds
                      </span>
                    </div>
                    <p className="text-base font-serif-display font-bold text-[#4c1315] leading-snug">
                      "{(post.caption.split('\n').filter(Boolean)[0] || 'Draft Video Post')}"
                    </p>
                  </div>
                )}

                {/* Note to Romany from Editor */}
                {post.editor_notes && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#fdf8f4] border-2 border-[#ad9b58]/50 text-left mb-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#ad9b58]/20">
                      <Sparkles className="w-4 h-4 text-[#ad9b58]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4c1315] font-serif-display">
                        Note from Akshay (Editor)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#4c1315] font-medium leading-relaxed whitespace-pre-wrap">
                      {post.editor_notes}
                    </p>
                  </div>
                )}

                {/* Dedicated Full Caption Card */}
                {post.caption && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#fbf7ee] border border-[#4c1315]/15 text-left mb-5">
                    <div className="flex items-center justify-between pb-3 border-b border-[#4c1315]/10 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4c1315] font-serif-display">
                        Official Instagram Caption & Copy
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(post.caption || '');
                          setCopiedCaption(true);
                          setTimeout(() => setCopiedCaption(false), 2500);
                        }}
                        className="text-xs font-bold text-[#4c1315] bg-white px-3 py-1.5 rounded-xl border border-[#4c1315]/15 hover:bg-[#4c1315] hover:text-[#fbf7ee] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {copiedCaption ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#ad9b58]" />
                            <span>Copy Caption</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs sm:text-sm text-[#280c0d] font-body leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-2 select-text">
                      {post.caption}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#4c1315]/10 flex items-center justify-between text-[11px] text-[#4c1315]/60">
                      <span>Length: {post.caption.length} characters</span>
                      <span>Hashtags: {(post.caption.match(/#[\w]+/g) || []).length}</span>
                    </div>
                  </div>
                )}

                {/* Previous Feedback Notice if any */}
                {post.feedback && (
                  <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 shadow-2xs">
                    <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-800 font-serif-display">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Latest Notes on Draft:
                    </span>
                    <p className="whitespace-pre-wrap leading-relaxed">{post.feedback}</p>
                  </div>
                )}

                {/* Change Request Drawer / Textarea */}
                {showFeedbackBox && (
                  <form onSubmit={handleRequestChanges} className="mb-5 p-5 rounded-3xl bg-[#fdf2f2] border-2 border-[#f8b4b4] text-left animate-in fade-in duration-200 shadow-sm">
                    <label htmlFor="feedback-text" className="block text-xs font-bold text-[#9b1c1c] mb-2 font-serif-display">
                      What revisions would you like the editor to make?
                    </label>
                    <textarea
                      id="feedback-text"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="e.g. Cut the first 2 seconds, adjust the font color of the hook, or tighten the 2nd paragraph of the caption..."
                      rows={3}
                      className="w-full p-3.5 rounded-xl bg-white border border-[#f8b4b4] text-xs sm:text-sm text-[#280c0d] placeholder:text-gray-400 focus:outline-none focus:border-[#9b1c1c] resize-none mb-3"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowFeedbackBox(false)}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-[#4c1315]/70 hover:text-[#4c1315] transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-xs font-serif-display font-bold bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ad9b58]" /> : null}
                        <span>Submit Revisions & Email Editor</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* 3 Executive Action Decision Buttons */}
              <div className="pt-4 border-t border-[#4c1315]/15 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Approve */}
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={submitting}
                  className="sm:order-1 order-1 py-3.5 px-4 rounded-2xl font-bold font-serif-display text-sm bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#ad9b58]" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#ad9b58] stroke-[2.5]" />
                      <span>Approve & Schedule</span>
                    </>
                  )}
                </button>

                {/* Request Changes */}
                <button
                  type="button"
                  onClick={() => setShowFeedbackBox(true)}
                  disabled={submitting}
                  className="sm:order-2 order-2 py-3.5 px-4 rounded-2xl font-bold font-serif-display text-xs sm:text-sm bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>Request Edits</span>
                </button>

                {/* Disapprove */}
                <button
                  type="button"
                  onClick={handleDisapprove}
                  disabled={submitting}
                  className="sm:order-3 order-3 py-3.5 px-3 rounded-2xl font-bold font-serif-display text-xs bg-white hover:bg-red-50 text-red-700 border border-red-200 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Disapprove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}