'use client';

import React, { useEffect, useState } from 'react';
import { Post, PerformanceSummary, ContentIdea } from '@/types/post';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Layers, 
  ShieldCheck,
  Award,
  Lock,
  ArrowRight,
  Check,
  XCircle,
  MessageSquare,
  Loader2,
  LogOut,
  Smartphone,
  SlidersHorizontal,
  Copy,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InstagramReelPreview } from '@/components/previews/InstagramReelPreview';
import { InstagramPostPreview } from '@/components/previews/InstagramPostPreview';
import { InstagramStoryPreview } from '@/components/previews/InstagramStoryPreview';
import { LinkedInPreview } from '@/components/previews/LinkedInPreview';
import { MultiChannelAuditPreview } from '@/components/previews/MultiChannelAuditPreview';
import { ContentCalendar } from '@/components/portal/ContentCalendar';
import { IdeasStudio } from '@/components/portal/IdeasStudio';
import { TemplateVault } from '@/components/portal/TemplateVault';

export default function UnifiedInfluencerPortal() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Format Switcher State (per post)
  const [previewFormats, setPreviewFormats] = useState<Record<string, 'reel' | 'story' | 'feed' | 'audit'>>({});

  // Portal Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'The Finance Woman' | 'In Business Together'>('all');
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'review' | 'templates' | 'calendar' | 'ideas' | 'analytics'>('review');

  // Review Action State inside portal
  const [cleanModes, setCleanModes] = useState<Record<string, boolean>>({});
  const [selectedPendingIndex, setSelectedPendingIndex] = useState<number>(0);
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);
  const [reviewViewMode, setReviewViewMode] = useState<'focused' | 'all'>('focused');
  const [activeReviewPostId, setActiveReviewPostId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [editorNoteReplies, setEditorNoteReplies] = useState<Record<string, string>>({});
  const [noteReplySentPostId, setNoteReplySentPostId] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Check saved session on mount
  useEffect(() => {
    const savedPass = localStorage.getItem('tfw_portal_token');
    if (savedPass) {
      setPassword(savedPass);
      handleLogin(savedPass);
    }
  }, []);

  const handleLogin = async (passToVerify?: string) => {
    const enteredPass = passToVerify || password;
    if (!enteredPass.trim()) {
      setAuthError('Please enter your client passcode.');
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError('');
      const res = await fetch(`/api/portal?t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ password: enteredPass }),
      });

      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        setAuthError(data.error || 'Incorrect passcode. Please check and try again.');
        localStorage.removeItem('tfw_portal_token');
        return;
      }

      setIsAuthenticated(true);
      localStorage.setItem('tfw_portal_token', enteredPass);
      if (data.posts) setPosts(data.posts);
      if (data.summary) setSummary(data.summary);
      if (data.ideas) setIdeas(data.ideas);
    } catch {
      setAuthError('Failed to authenticate. Please check your connection.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tfw_portal_token');
    setIsAuthenticated(false);
    setPassword('');
  };

  const fetchPortalData = async (silent = false) => {
    const token = localStorage.getItem('tfw_portal_token');
    if (!token) return;
    try {
      if (!silent) setLoading(true);
      const [resPortal, resIdeas] = await Promise.all([
        fetch(`/api/portal?t=${Date.now()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ password: token }),
        }),
        fetch(`/api/ideas?t=${Date.now()}`, { cache: 'no-store' }),
      ]);
      const data = await resPortal.json();
      if (data.posts) setPosts(data.posts);
      if (data.summary) setSummary(data.summary);
      if (data.ideas) setIdeas(data.ideas);

      const ideasData = await resIdeas.json();
      if (ideasData.ideas) setIdeas(ideasData.ideas);
    } catch (err) {
      console.error('Error refreshing portal:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Background Auto-Poll for real-time syncing across all active devices
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      fetchPortalData(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ad9b58', '#4c1315', '#c8b87a', '#280c0d'],
      });
    } catch {
      // safe fallback
    }
  };

  // Influencer review actions directly from the portal
  const handlePostAction = async (post: Post, action: 'approved' | 'changes_requested' | 'rejected', customFeedback?: string) => {
    if (action === 'changes_requested' && !feedbackText.trim() && !customFeedback) {
      alert('Please specify the changes or edits you would like before sending.');
      return;
    }

    const replyFromInput = editorNoteReplies[post.id] !== undefined ? editorNoteReplies[post.id] : '';
    const finalFeedback = customFeedback || (action === 'changes_requested' ? feedbackText.trim() : (replyFromInput.trim() || undefined));

    try {
      setSubmittingAction(true);
      const res = await fetch(`/api/review/${post.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          feedback: finalFeedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      // Update local state
      setPosts(prev => prev.map(p => p.id === post.id ? (data.post || { ...p, status: action, feedback: finalFeedback || p.feedback }) : p));
      setActiveReviewPostId(null);
      setFeedbackText('');

      const msg = 
        action === 'approved' ? (finalFeedback ? 'Post Approved with your note! Email sent to Akshay.' : 'Post Approved! Editor notified via email.') :
        action === 'rejected' ? 'Post Disapproved. Editor notified via email.' :
        'Changes submitted! Editor notified via email.';

      setActionSuccessMsg(msg);
      if (action === 'approved') triggerConfetti();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error submitting action');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSendNoteOnly = async (post: Post) => {
    const replyText = (editorNoteReplies[post.id] !== undefined ? editorNoteReplies[post.id] : (post.feedback || '')).trim();
    if (!replyText) {
      alert('Please write a note or reply first.');
      return;
    }

    try {
      setSubmittingAction(true);
      const res = await fetch(`/api/review/${post.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: post.status === 'approved' ? 'approved' : 'pending',
          feedback: replyText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send note');

      setPosts(prev => prev.map(p => p.id === post.id ? (data.post || { ...p, feedback: replyText }) : p));
      setNoteReplySentPostId(post.id);
      setTimeout(() => setNoteReplySentPostId(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error sending reply');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filter posts by selected brand
  // Robust Brand Classification
  const isPostIBT = (p: Post) => {
    const combined = `${p.creator_name || ''} ${p.creator_handle || ''} ${p.caption || ''}`.toLowerCase();
    return (
      combined.includes('in business together') ||
      combined.includes('inbusinesstogether') ||
      combined.includes('business together') ||
      combined.includes('director couple') ||
      combined.includes('damian')
    );
  };

  const tfwPosts = posts.filter(p => !isPostIBT(p));
  const ibtPosts = posts.filter(p => isPostIBT(p));

  const brandFilteredPosts = selectedBrand === 'In Business Together'
    ? ibtPosts
    : selectedBrand === 'The Finance Woman'
    ? tfwPosts
    : posts;

  // Template Detection Helper: strictly dedicated templates
  const isPostTemplate = (p: Post) => {
    // Dedicated template objects always have media_type === 'template' or platform === 'template'
    if (p.media_type === ('template' as any) || p.platform === ('template' as any)) return true;
    // Or if explicitly marked as master template without being a scheduled broadcast post
    if (!p.scheduled_at && p.editor_notes && p.editor_notes.toLowerCase().includes('master template')) return true;
    return false;
  };

  const portalTemplates = brandFilteredPosts.filter(isPostTemplate);
  const broadcastPosts = brandFilteredPosts.filter(p => !isPostTemplate(p));

  // Calculations for Streamlined Reporting (excluding standalone templates from standard broadcast counts)
  const inCreationPosts = broadcastPosts.filter(p => p.status === 'pending' || p.status === 'action_required' || p.status === 'in_review');
  const approvedPosts = broadcastPosts.filter(p => p.status === 'approved' && !p.is_published);
  const rejectedPosts = broadcastPosts.filter(p => p.status === 'rejected');
  const postedPosts = broadcastPosts.filter(p => p.is_published);
  const editsRequestedPosts = broadcastPosts.filter(p => p.status === 'changes_requested');

  // Convenience aliases for tabs & counter badges
  const pendingPosts = inCreationPosts;
  const publishedPosts = postedPosts;
  const scheduledPosts = approvedPosts;
  const pendingTemplates = portalTemplates.filter(p => p.status === 'pending' || p.status === 'action_required' || p.status === 'in_review');

  // Filter ideas by selected brand
  const isIdeaIBT = (i: ContentIdea) => {
    const combined = `${i.creator_name || ''} ${i.title || ''} ${i.notes || ''}`.toLowerCase();
    return (
      combined.includes('in business together') ||
      combined.includes('inbusinesstogether') ||
      combined.includes('business together') ||
      combined.includes('director couple') ||
      combined.includes('damian')
    );
  };

  const tfwIdeas = ideas.filter(i => !isIdeaIBT(i));
  const ibtIdeas = ideas.filter(i => isIdeaIBT(i));

  const filteredIdeas = selectedBrand === 'In Business Together'
    ? ibtIdeas
    : selectedBrand === 'The Finance Woman'
    ? tfwIdeas
    : ideas;


  // PASSCODE SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fbf7ee] flex flex-col items-center justify-center p-4 sm:p-6 text-[#280c0d] font-body selection:bg-[#4c1315] selection:text-[#fbf7ee]">
        <div className="max-w-md w-full bg-white/95 rounded-3xl p-8 sm:p-10 border-2 border-[#4c1315]/15 shadow-xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#ad9b58]/20 to-transparent rounded-bl-full pointer-events-none" />

          {/* Authentic Brand Logo */}
          <div className="mx-auto mb-6 flex justify-center">
            <img 
              src="/tfw-logo.svg" 
              alt="The Finance Woman" 
              className="h-14 w-auto object-contain"
            />
          </div>

          <span className="inline-flex items-center text-[11px] uppercase font-bold tracking-widest px-3.5 py-1 rounded-full bg-[#ad9b58]/15 text-[#4c1315] border border-[#ad9b58]/30 mb-3">
            TFW.SOCIAL
          </span>


          <p className="text-xs text-[#4c1315]/75 mb-7 leading-relaxed font-body">
            Enter your passcode to review pending broadcasts, approve creative assets, and inspect client performance analytics.
          </p>


          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4 text-left">
            <div>
              <label htmlFor="passcode-input" className="block text-xs uppercase tracking-wider font-bold text-[#4c1315]/80 mb-2">
                Client Passcode
              </label>
              <div className="relative">
                <input
                  id="passcode-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode (e.g. FINANCE2026)"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/25 text-[#280c0d] placeholder:text-[#4c1315]/40 text-sm font-medium focus:outline-none focus:border-[#ad9b58] focus:ring-2 focus:ring-[#ad9b58]/20 transition"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-[#ad9b58] absolute right-3.5 top-4 pointer-events-none" />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-lg border border-red-200">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl font-serif-display font-bold text-sm bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {authLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#ad9b58]" />
              ) : (
                <>
                  <span>Open Executive Portal</span>
                  <ArrowRight className="w-4 h-4 text-[#ad9b58]" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-[#4c1315]/50 mt-6">
            Protected session • Accessible across all your mobile & desktop devices
          </p>
        </div>
      </div>
    );
  }

  // AUTHENTICATED PORTAL
  return (
    <div className="min-h-screen bg-[#fbf7ee] text-[#280c0d] font-body selection:bg-[#4c1315] selection:text-[#fbf7ee]">
      {/* Top Banner & Navigation */}
      <header className="border-b border-[#4c1315]/15 bg-[#fbf7ee]/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Brand Identity Branding */}
          <div className="flex items-center gap-3.5">
            {selectedBrand === 'In Business Together' ? (
              <div className="flex items-center gap-3">
                <img 
                  src="/ibt-logo.png" 
                  alt="In Business Together" 
                  className="h-8 sm:h-9 w-auto object-contain rounded-md"
                />
                <div className="hidden sm:block border-l border-[#A8442A]/20 pl-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#A8442A]/15 text-[#A8442A] border border-[#A8442A]/30">
                      Director Couples
                    </span>
                  </div>
                  <p className="text-[10px] text-[#2C2E35]/70 tracking-widest uppercase font-medium mt-0.5">
                    Damian, Romany &amp; Matthew • inbusinesstogether.co.uk
                  </p>
                </div>
              </div>
            ) : selectedBrand === 'The Finance Woman' ? (
              <div className="flex items-center gap-3">
                <img 
                  src="/tfw-logo.svg" 
                  alt="The Finance Woman" 
                  className="h-10 w-auto object-contain"
                />
                <div className="hidden sm:block border-l border-[#4c1315]/20 pl-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ad9b58]/15 text-[#4c1315] border border-[#ad9b58]/30">
                      TFW.SOCIAL
                    </span>
                  </div>
                  <p className="text-[10px] text-[#4c1315]/70 tracking-widest uppercase font-medium mt-0.5">
                    Romany Review Portal
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img 
                  src="/tfw-logo.svg" 
                  alt="The Finance Woman" 
                  className="h-8 sm:h-9 w-auto object-contain"
                />
                <span className="text-[#4c1315]/30 font-light">&amp;</span>
                <img 
                  src="/ibt-logo.png" 
                  alt="In Business Together" 
                  className="h-6 sm:h-7 w-auto object-contain rounded-sm"
                />
                <div className="hidden lg:block border-l border-[#4c1315]/20 pl-3">
                  <p className="text-[10px] text-[#4c1315]/70 tracking-widest uppercase font-medium mt-0.5">
                    Romany Review Portal
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Center Brand Switcher Pill (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center p-1 bg-[#4c1315]/10 rounded-2xl border border-[#4c1315]/15 text-xs font-bold font-serif-display">
            <button
              type="button"
              onClick={() => {
                setSelectedBrand('all');
                setSelectedPendingIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedBrand === 'all' 
                  ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs' 
                  : 'text-[#4c1315]/75 hover:text-[#4c1315]'
              }`}
            >
              All Brands ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedBrand('The Finance Woman');
                setSelectedPendingIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                selectedBrand === 'The Finance Woman' 
                  ? 'bg-[#4c1315] text-[#fbf7ee] shadow-2xs' 
                  : 'text-[#4c1315]/75 hover:text-[#4c1315]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#ad9b58]" />
              <span>The Finance Woman ({tfwPosts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedBrand('In Business Together');
                setSelectedPendingIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                selectedBrand === 'In Business Together' 
                  ? 'bg-[#A8442A] text-white shadow-2xs' 
                  : 'text-[#4c1315]/75 hover:text-[#A8442A]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#C98B6B]" />
              <span>In Business Together ({ibtPosts.length})</span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchPortalData()}
              className="p-2 rounded-xl text-[#4c1315]/70 hover:text-[#4c1315] hover:bg-[#4c1315]/5 transition"
              title="Refresh Portal Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ad9b58]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#4c1315]/10 text-[#4c1315] hover:bg-[#4c1315]/20 transition"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Portal</span>
            </button>
          </div>
        </div>

        {/* Mobile Brand Switcher */}
        <div className="sm:hidden px-4 pb-3 flex items-center justify-center gap-1.5 border-t border-[#4c1315]/10 pt-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setSelectedBrand('all');
              setSelectedPendingIndex(0);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] ${selectedBrand === 'all' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/70'}`}
          >
            All ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedBrand('The Finance Woman');
              setSelectedPendingIndex(0);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 ${selectedBrand === 'The Finance Woman' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/70'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ad9b58]" />
            <span>TFW ({tfwPosts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedBrand('In Business Together');
              setSelectedPendingIndex(0);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 ${selectedBrand === 'In Business Together' ? 'bg-[#A8442A] text-white' : 'text-[#4c1315]/70'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C98B6B]" />
            <span>IBT ({ibtPosts.length})</span>
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {actionSuccessMsg && (
        <div className="bg-[#4c1315] text-[#fbf7ee] py-3 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Portal Header & Quick Counts */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[#4c1315]/10 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#4c1315] tracking-tight">
              {selectedBrand === 'In Business Together'
                ? 'In Business Together'
                : selectedBrand === 'The Finance Woman'
                ? 'The Finance Woman'
                : 'Content Review Portal'}
            </h1>
            <p className="text-sm text-[#4c1315]/75 mt-1">
              {selectedBrand === 'In Business Together'
                ? 'Review director couple videos, log financial planning hooks, and inspect scheduled releases.'
                : 'Review pending creative assets, approve broadcasts, log content ideas, and check live calendar reach.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {pendingTemplates.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('templates');
                  const el = document.getElementById('template-section-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1 rounded-full bg-[#4c1315] text-[#fbf7ee] font-bold border border-[#ad9b58] shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-[#6e1c1f] transition animate-pulse"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ad9b58]" />
                <span>{pendingTemplates.length} New Templates to Review</span>
                <ArrowRight className="w-3 h-3 text-[#ad9b58]" />
              </button>
            )}
            <span className="px-3 py-1 rounded-full bg-[#ad9b58]/20 text-[#4c1315] font-bold border border-[#ad9b58]/40">
              {pendingPosts.length} Pending Approval
            </span>
          </div>
        </div>

        {/* EYE-CATCHING TEMPLATE GUIDE BANNER FOR ROMANY (IF TEMPLATES AWAIT REVIEW) */}
        {pendingTemplates.length > 0 && activeTab !== 'templates' && (
          <div className="bg-[#fdf8f4] border-2 border-[#ad9b58] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#4c1315] text-[#ad9b58] flex items-center justify-center shrink-0 shadow-xs">
                <Layers className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ad9b58]/25 text-[#4c1315] px-2 py-0.5 rounded-md">
                    Action Needed
                  </span>
                  <h3 className="text-sm sm:text-base font-bold font-serif-display text-[#4c1315]">
                    {pendingTemplates.length} Design Templates Waiting for Approval
                  </h3>
                </div>
                <p className="text-xs text-[#4c1315]/80 font-medium">
                  Quick visual look check only. Click below to view and approve the slide layouts.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('templates');
                const el = document.getElementById('template-section-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] font-serif-display text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
            >
              <span>Review Templates</span>
              <ArrowRight className="w-4 h-4 text-[#ad9b58]" />
            </button>
          </div>
        )}

        {/* PROMINENT DEDICATED BRAND SELECTOR STRIP */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#4c1315]/15 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#4c1315]/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#4c1315] text-[#ad9b58]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-serif-display font-bold text-[#4c1315] uppercase tracking-wider">
                  Select Brand to View
                </h2>
                <p className="text-xs text-[#4c1315]/65">
                  Click a brand to filter review posts, schedule calendar, and creative ideas
                </p>
              </div>
            </div>

            <span className="text-xs font-serif-display font-bold px-3 py-1 rounded-full bg-[#fbf7ee] border border-[#4c1315]/15 text-[#4c1315] self-start sm:self-auto flex items-center gap-1.5">
              <span className="text-[#4c1315]/60 font-normal">Active Filter:</span>
              <span className="text-[#4c1315] font-bold">
                {selectedBrand === 'all' ? 'All Brands (Combined)' : selectedBrand}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* 1. All Brands */}
            <button
              type="button"
              onClick={() => {
                setSelectedBrand('all');
                setSelectedPendingIndex(0);
              }}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                selectedBrand === 'all'
                  ? 'bg-[#4c1315] text-[#fbf7ee] border-[#ad9b58] shadow-md ring-2 ring-[#ad9b58]/40'
                  : 'bg-[#fbf7ee] border-[#4c1315]/15 text-[#4c1315] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${selectedBrand === 'all' ? 'bg-[#ad9b58]' : 'bg-[#4c1315]/30'}`} />
                <div>
                  <span className="block font-bold text-xs font-serif-display">All Brands</span>
                  <span className={`block text-[10px] ${selectedBrand === 'all' ? 'text-[#fbf7ee]/75' : 'text-[#4c1315]/60'}`}>
                    Combined view of both brands
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                selectedBrand === 'all' ? 'bg-[#ad9b58] text-[#280c0d]' : 'bg-[#4c1315]/10 text-[#4c1315]'
              }`}>
                {posts.length} posts
              </span>
            </button>

            {/* 2. The Finance Woman */}
            <button
              type="button"
              onClick={() => {
                setSelectedBrand('The Finance Woman');
                setSelectedPendingIndex(0);
              }}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                selectedBrand === 'The Finance Woman'
                  ? 'bg-[#4c1315] text-[#fbf7ee] border-[#ad9b58] shadow-md ring-2 ring-[#ad9b58]/40'
                  : 'bg-[#fbf7ee] border-[#4c1315]/15 text-[#4c1315] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <img src="/tfw-logo.svg" alt="TFW" className="h-6 w-auto object-contain flex-shrink-0" />
                <div>
                  <span className="block font-bold text-xs font-serif-display">The Finance Woman</span>
                  <span className={`block text-[10px] ${selectedBrand === 'The Finance Woman' ? 'text-[#fbf7ee]/75' : 'text-[#4c1315]/60'}`}>
                    Romany Youell • @thefinancewoman
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                selectedBrand === 'The Finance Woman' ? 'bg-[#ad9b58] text-[#280c0d]' : 'bg-[#4c1315]/10 text-[#4c1315]'
              }`}>
                {tfwPosts.length} posts
              </span>
            </button>

            {/* 3. In Business Together */}
            <button
              type="button"
              onClick={() => {
                setSelectedBrand('In Business Together');
                setSelectedPendingIndex(0);
              }}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                selectedBrand === 'In Business Together'
                  ? 'bg-[#A8442A] text-white border-[#C98B6B] shadow-md ring-2 ring-[#C98B6B]/50'
                  : 'bg-[#fbf7ee] border-[#4c1315]/15 text-[#4c1315] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <img src="/ibt-logo.png" alt="IBT" className="h-5 w-auto object-contain rounded-sm flex-shrink-0" />
                <div>
                  <span className="block font-bold text-xs font-serif-display">In Business Together</span>
                  <span className={`block text-[10px] ${selectedBrand === 'In Business Together' ? 'text-white/80' : 'text-[#4c1315]/60'}`}>
                    Director Couples • Damian &amp; Romany
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                selectedBrand === 'In Business Together' ? 'bg-[#C98B6B] text-[#280c0d]' : 'bg-[#4c1315]/10 text-[#4c1315]'
              }`}>
                {ibtPosts.length} posts
              </span>
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="border-b border-[#4c1315]/15 flex items-center gap-4 sm:gap-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`pb-3.5 text-sm font-bold tracking-wide border-b-2 transition flex items-center gap-2 font-serif-display whitespace-nowrap cursor-pointer ${
              activeTab === 'review'
                ? 'border-[#4c1315] text-[#4c1315]'
                : 'border-transparent text-[#4c1315]/60 hover:text-[#4c1315]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#ad9b58]" />
            <span>Needs Review</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-body font-semibold ${
              pendingPosts.length > 0 ? 'bg-[#4c1315] text-[#fbf7ee]' : 'bg-[#4c1315]/10 text-[#4c1315]'
            }`}>
              {pendingPosts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`pb-3.5 text-sm font-bold tracking-wide border-b-2 transition flex items-center gap-2 font-serif-display whitespace-nowrap cursor-pointer ${
              activeTab === 'templates'
                ? 'border-[#4c1315] text-[#4c1315]'
                : 'border-transparent text-[#4c1315]/60 hover:text-[#4c1315]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#ad9b58]" />
            <span>Templates</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-body font-semibold ${
              pendingTemplates.length > 0 ? 'bg-[#ad9b58] text-[#280c0d]' : 'bg-[#4c1315]/10 text-[#4c1315]'
            }`}>
              {portalTemplates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`pb-3.5 text-sm font-bold tracking-wide border-b-2 transition flex items-center gap-2 font-serif-display whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'border-[#4c1315] text-[#4c1315]'
                : 'border-transparent text-[#4c1315]/60 hover:text-[#4c1315]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#ad9b58]" />
            <span>Content Calendar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ad9b58]/25 text-[#4c1315] font-body font-semibold">
              {scheduledPosts.length + publishedPosts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ideas')}
            className={`pb-3.5 text-sm font-bold tracking-wide border-b-2 transition flex items-center gap-2 font-serif-display whitespace-nowrap cursor-pointer ${
              activeTab === 'ideas'
                ? 'border-[#4c1315] text-[#4c1315]'
                : 'border-transparent text-[#4c1315]/60 hover:text-[#4c1315]'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-[#ad9b58]" />
            <span>Ideas &amp; Raw Footage</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#4c1315]/10 text-[#4c1315] font-body font-semibold">
              {filteredIdeas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`pb-3.5 text-sm font-bold tracking-wide border-b-2 transition flex items-center gap-2 font-serif-display whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-[#4c1315] text-[#4c1315]'
                : 'border-transparent text-[#4c1315]/60 hover:text-[#4c1315]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#ad9b58]" />
            <span>Reporting &amp; Performance</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#4c1315]/10 text-[#4c1315] font-body font-semibold">
              {publishedPosts.length}
            </span>
          </button>
        </div>

        {/* TAB 1: NEEDS REVIEW (SPACIOUS EXECUTIVE STUDIO LAYOUT) */}
        {activeTab === 'review' && (
          <section className="space-y-6">
            {pendingPosts.length === 0 ? (
              <div className="bg-white/80 rounded-3xl p-12 text-center border border-[#4c1315]/15 max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-serif-display text-xl font-bold text-[#4c1315] mb-2">
                    All Caught Up on Broadcasts!
                  </h3>
                  <p className="text-xs text-[#4c1315]/70 leading-relaxed font-body">
                    {selectedBrand !== 'all'
                      ? `There are no scheduled posts for ${selectedBrand} waiting for approval right now.`
                      : 'There are no scheduled posts waiting for your approval right now.'}
                  </p>
                </div>

                {/* Direct Gateway to Pending Templates if any await approval */}
                {pendingTemplates.length > 0 && (
                  <div className="pt-3 border-t border-[#4c1315]/15">
                    <div className="bg-[#fdf8f4] border-2 border-[#ad9b58] rounded-2xl p-4 text-center space-y-2">
                      <p className="text-xs font-bold text-[#4c1315] font-serif-display">
                        ✨ {pendingTemplates.length} Master Templates Waiting for Approval
                      </p>
                      <p className="text-[11px] text-[#4c1315]/75">
                        Quick visual check only (dates and captions will be approved later).
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('templates')}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#4c1315] text-[#fbf7ee] text-xs font-serif-display font-bold hover:bg-[#6e1c1f] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Open Templates Vault</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#ad9b58]" />
                      </button>
                    </div>
                  </div>
                )}
                {selectedBrand !== 'all' && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrand('all');
                        setSelectedPendingIndex(0);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4c1315] text-[#fbf7ee] text-xs font-serif-display font-bold hover:bg-[#6e1c1f] transition cursor-pointer"
                    >
                      <span>View All Brands ({posts.length} posts)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#ad9b58]" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Queue Navigator for Multiple Pending Posts */}
                {pendingPosts.length > 1 && (
                  <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#4c1315]/15 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-serif-display text-[#4c1315]">
                        Pending Queue:
                      </span>
                      <span className="text-xs text-[#4c1315]/70 font-medium">
                        Draft {selectedPendingIndex + 1} of {pendingPosts.length}
                      </span>
                    </div>

                    {/* Post selector pills */}
                    <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                      {pendingPosts.map((p, idx) => {
                        const firstLine = ((p.caption || '').split('\n')[0] || `Draft #${idx + 1}`).trim();
                        const isSelected = selectedPendingIndex === idx;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPendingIndex(idx);
                              setActiveReviewPostId(null);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-serif-display whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs'
                                : 'bg-[#fbf7ee] text-[#4c1315]/70 hover:bg-[#ad9b58]/20 hover:text-[#4c1315]'
                            }`}
                          >
                            <span>#{idx + 1}</span>
                            <span className="max-w-[130px] truncate">{firstLine}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* View Mode Toggle: Single Studio vs Stack All */}
                    <div className="flex items-center gap-1 bg-[#fbf7ee] p-1 rounded-xl border border-[#4c1315]/15">
                      <button
                        type="button"
                        onClick={() => setReviewViewMode('focused')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          reviewViewMode === 'focused' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                        }`}
                      >
                        Studio View
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewViewMode('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          reviewViewMode === 'all' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                        }`}
                      >
                        All Drafts ({pendingPosts.length})
                      </button>
                    </div>
                  </div>
                )}

                {/* Render Post Cards in Spacious Studio Layout */}
                {(reviewViewMode === 'focused' 
                  ? [pendingPosts[Math.min(selectedPendingIndex, pendingPosts.length - 1)]] 
                  : pendingPosts
                ).map((post) => {
                  const isClean = cleanModes[post.id] !== false; // DEFAULT: clean unblocked video!
                  const isFeedPost = post.platform !== 'instagram_reel' && (post.platform === 'instagram_post' || post.platform === 'instagram_feed' || post.platform === 'facebook_group' || post.media_type === 'image' || (post.media_urls && post.media_urls.length > 0));
                  const defaultFormat = isFeedPost ? 'feed' : post.platform === 'linkedin' ? 'linkedin' : post.platform === 'instagram_story' ? 'story' : 'reel';
                  const currentFormat = previewFormats[post.id] || defaultFormat;
                  const lines = (post.caption || '').split('\n').filter(l => l.trim().length > 0);
                  const hookSnippet = lines[0] || 'Draft Creative Video';
                  const hasFca = (post.caption || '').toLowerCase().includes('fca') || 
                                 (post.caption || '').toLowerCase().includes('capital at risk') || 
                                 (post.caption || '').toLowerCase().includes('financial advice');
                  const isPetGroup = post.platform === 'facebook_group' || 
                                     (post.editor_notes || '').toLowerCase().includes('pet accountant') ||
                                     (post.caption || '').toLowerCase().includes('pet accountant');

                  return (
                    <div
                      key={post.id}
                      className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-[#4c1315]/15 shadow-sm hover:border-[#ad9b58] transition duration-300"
                    >
                      {/* Post Brand Header Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#4c1315]/10">
                        {isPostIBT(post) ? (
                          <div className="flex items-center gap-2.5">
                            <img src="/ibt-logo.png" alt="In Business Together" className="h-6 w-auto object-contain rounded-xs" />
                            <div className="border-l border-[#A8442A]/25 pl-2.5">
                              <span className="text-xs font-serif font-bold text-[#A8442A]">
                                In Business Together
                              </span>
                              <span className="text-[10px] text-[#A8442A]/70 ml-2 font-medium">
                                Director Couples Financial Planning
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <img src="/tfw-logo.svg" alt="The Finance Woman" className="h-7 w-auto object-contain" />
                            <div className="border-l border-[#4c1315]/20 pl-2.5">
                              <span className="text-xs font-serif-display font-bold text-[#4c1315]">
                                The Finance Woman
                              </span>
                              <span className="text-[10px] text-[#4c1315]/70 ml-2 font-medium">
                                Romany Youell • @thefinancewoman
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {isPetGroup ? (
                            <span className="text-[11px] px-3 py-1 rounded-full bg-[#4c1315] text-[#fbf7ee] font-bold border border-[#ad9b58]/40 shadow-xs flex items-center gap-1.5">
                              <span>🐾</span> Facebook Group: The Pet Accountant
                            </span>
                          ) : (
                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#ad9b58]/15 text-[#4c1315] font-bold border border-[#ad9b58]/30">
                              {post.platform === 'instagram_reel' && post.media_type === 'video'
                                ? 'Instagram Reel'
                                : isFeedPost
                                ? 'Instagram Post'
                                : post.platform === 'linkedin'
                                ? 'LinkedIn Broadcast'
                                : 'Social Broadcast'}
                            </span>
                          )}
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-900 font-bold border border-amber-500/30">
                            Awaiting Review
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* LEFT COLUMN: 5 COLS - STUDIO PLAYER */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                          {/* 1. Format Switcher (Reel / Story / Feed / Audit) */}
                          <div className="w-full max-w-[420px] flex items-center justify-between bg-[#fbf7ee] p-1.5 rounded-2xl border border-[#4c1315]/15 mb-3">
                            <span className="text-[10px] font-bold text-[#4c1315]/70 pl-2 uppercase tracking-wider">
                              Format:
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setPreviewFormats(prev => ({ ...prev, [post.id]: 'feed' }))}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer ${
                                  currentFormat === 'feed' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                                }`}
                              >
                                Feed Post
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewFormats(prev => ({ ...prev, [post.id]: 'reel' }))}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer ${
                                  currentFormat === 'reel' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                                }`}
                              >
                                Reel (9:16)
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewFormats(prev => ({ ...prev, [post.id]: 'story' }))}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer ${
                                  currentFormat === 'story' ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                                }`}
                              >
                                Story
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewFormats(prev => ({ ...prev, [post.id]: 'audit' }))}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer flex items-center gap-1 ${
                                  currentFormat === 'audit' ? 'bg-[#ad9b58] text-[#4c1315] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315] border border-[#ad9b58]/40'
                                }`}
                                title="Check how this post looks across all 16 Instagram and Facebook placement surfaces"
                              >
                                <Sparkles className="w-3 h-3 text-[#ad9b58]" />
                                <span>Placement Audit</span>
                              </button>
                            </div>
                          </div>

                          {/* 2. Display Mode Switcher (Clean Video vs IG Chrome Simulation) */}
                          {currentFormat !== 'feed' && currentFormat !== 'audit' && post.platform !== 'linkedin' && (
                            <div className="w-full max-w-[380px] flex items-center justify-between bg-white p-1.5 rounded-2xl border border-[#4c1315]/15 mb-3 shadow-2xs">
                              <span className="text-[10px] font-bold text-[#4c1315]/70 pl-2 uppercase tracking-wider flex items-center gap-1">
                                <SlidersHorizontal className="w-3 h-3 text-[#ad9b58]" /> View Mode:
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setCleanModes(prev => ({ ...prev, [post.id]: true }))}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer ${
                                    isClean ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                                  }`}
                                  title="Watch video completely unobstructed without overlays"
                                >
                                  Clean Video
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCleanModes(prev => ({ ...prev, [post.id]: false }))}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold font-serif-display transition cursor-pointer ${
                                    !isClean ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs' : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                                  }`}
                                  title="Preview with native Instagram app icons and layout"
                                >
                                  Instagram UI
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 3. Phone / Post Preview Mockup */}
                          <div className={`w-full my-2 ${currentFormat === 'audit' ? 'max-w-2xl' : 'max-w-[440px]'}`}>
                            {currentFormat === 'audit' ? (
                              <MultiChannelAuditPreview post={post} />
                            ) : post.platform === 'linkedin' ? (
                              <LinkedInPreview post={post} />
                            ) : currentFormat === 'story' ? (
                              <InstagramStoryPreview post={post} cleanMode={isClean} />
                            ) : currentFormat === 'feed' ? (
                              <InstagramPostPreview post={post} />
                            ) : (
                              <InstagramReelPreview post={post} cleanMode={isClean} />
                            )}
                          </div>

                          {/* Indicator message */}
                          <div className="mt-2 text-center">
                            <span className="text-[11px] text-[#4c1315]/70 font-medium">
                              {isPetGroup
                                ? '🐾 The Pet Accountant Facebook Group: 5-Slide Carousel Infographic.'
                                : currentFormat === 'feed'
                                ? 'Instagram Feed Post: 100% uncropped graphic with authentic feed interactions.'
                                : isClean 
                                ? 'Clean Video: Speaker, graphics & subtitles are 100% unobstructed.' 
                                : 'Instagram Simulation: Checking UI margins.'}
                            </span>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: 7 COLS - EDITORIAL & APPROVAL DESK */}
                        <div className="lg:col-span-7 flex flex-col justify-between h-full">
                          <div>
                            {/* Header Metadata */}
                            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#4c1315]/10 mb-4 gap-2">
                              <div className="flex items-center gap-2">
                                {((post.creator_name || '').toLowerCase().includes('business')) ? (
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#A8442A] text-white">
                                    In Business Together
                                  </span>
                                ) : (
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#4c1315] text-[#fbf7ee]">
                                    The Finance Woman
                                  </span>
                                )}
                                {isPetGroup ? (
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#ad9b58] text-[#4c1315] border border-[#ad9b58]/60 shadow-2xs flex items-center gap-1 font-serif-display">
                                    <span>🐾</span> Facebook Group • The Pet Accountant
                                  </span>
                                ) : (
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/40">
                                    {post.platform.replace('_', ' ')} • {currentFormat.toUpperCase()}
                                  </span>
                                )}
                                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                                  Action Required
                                </span>
                              </div>
                              <div className="text-xs text-[#4c1315]/70 flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-[#ad9b58]" />
                                <span>
                                  {post.scheduled_at
                                    ? `Scheduled: ${new Date(post.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                                    : 'Broadcast: Immediately upon approval'}
                                </span>
                              </div>
                            </div>

                            {/* Destination Channel Spotlight */}
                            {isPetGroup && (
                              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#ad9b58]/15 border-2 border-[#ad9b58]/50 text-left mb-5 shadow-xs flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#4c1315] text-[#fbf7ee] flex items-center justify-center text-base flex-shrink-0 shadow-xs">
                                  🐾
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#4c1315] font-serif-display">
                                      Destination: The Pet Accountant Facebook Group
                                    </span>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#4c1315]/10 text-[#4c1315] border border-[#4c1315]/20">
                                      Weekly Partner Slot
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#4c1315]/90 leading-relaxed">
                                    This post is scheduled specifically for your weekly slot in <strong>The Pet Professional Business &amp; Finance Hub</strong> (The Pet Accountant Facebook group).
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Hook Spotlight */}
                            <div className="p-4 rounded-2xl bg-[#ad9b58]/15 border border-[#ad9b58]/30 mb-5">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4c1315]/80">
                                  {isPetGroup ? 'Carousel Hook / Slide 1 Headline' : isFeedPost ? 'Carousel / Graphic Hook' : 'Opening Video Hook'}
                                </span>
                                <span className="text-[10px] font-semibold text-[#4c1315]/60">
                                  {isPetGroup || isFeedPost ? 'Cover Slide' : 'First 3 Seconds'}
                                </span>
                              </div>
                              <p className="text-base font-serif-display font-bold text-[#4c1315] leading-snug">
                                "{hookSnippet.replace(/^["'\s]+|["'\s]+$/g, '')}"
                              </p>
                            </div>

                            {/* Note to Romany from Editor & Inline Reply Box */}
                            {(post.editor_notes || post.status === 'approved') && (
                              <div className="p-4 sm:p-5 rounded-2xl bg-[#fdf8f4] border-2 border-[#ad9b58]/50 text-left mb-5 shadow-xs">
                                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#ad9b58]/20">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#ad9b58]" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#4c1315] font-serif-display">
                                      {post.editor_notes ? 'Note from Akshay (Editor)' : 'Reply / Note to Akshay'}
                                    </span>
                                  </div>
                                  {post.status === 'approved' && (
                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                      Approved
                                    </span>
                                  )}
                                </div>
                                {post.editor_notes && (
                                  <p className="text-xs sm:text-sm text-[#4c1315] font-medium leading-relaxed whitespace-pre-wrap mb-3.5">
                                    {post.editor_notes}
                                  </p>
                                )}

                                {/* Dedicated Reply Box so Romany can reply and give feedback directly on /portal */}
                                <div className="pt-3 border-t border-[#ad9b58]/20">
                                  <label htmlFor={`editor-reply-${post.id}`} className="block text-[11px] font-bold text-[#4c1315]/80 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                    <span>Your reply or feedback on this note (optional):</span>
                                    {noteReplySentPostId === post.id && (
                                      <span className="text-emerald-700 font-bold normal-case flex items-center gap-1">
                                        <Check className="w-3 h-3 text-emerald-600" /> Reply sent to Akshay by email!
                                      </span>
                                    )}
                                  </label>
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <textarea
                                      id={`editor-reply-${post.id}`}
                                      value={editorNoteReplies[post.id] !== undefined ? editorNoteReplies[post.id] : (post.feedback || '')}
                                      onChange={(e) => setEditorNoteReplies(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      placeholder=""
                                      rows={2}
                                      className="flex-1 p-2.5 rounded-xl bg-white border border-[#ad9b58]/40 text-xs sm:text-sm text-[#280c0d] placeholder:text-[#4c1315]/40 focus:outline-none focus:border-[#4c1315] resize-none"
                                    />
                                    {post.status === 'approved' && (
                                      <button
                                        type="button"
                                        onClick={() => handleSendNoteOnly(post)}
                                        disabled={submittingAction || !((editorNoteReplies[post.id] !== undefined ? editorNoteReplies[post.id] : (post.feedback || '')).trim())}
                                        className="self-end sm:self-center px-3.5 py-2 rounded-xl text-xs font-serif-display font-bold bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs whitespace-nowrap"
                                      >
                                        {submittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ad9b58]" /> : <Send className="w-3.5 h-3.5 text-[#ad9b58]" />}
                                        <span>Send Reply</span>
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-[#4c1315]/60 mt-1.5">
                                    {post.status === 'approved' 
                                      ? 'You can update this reply anytime and click Send Reply to email Akshay directly.'
                                      : 'Tip: You can write your reply here and click "Approve & Schedule" below. Your reply will be emailed to Akshay along with your approval!'}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Full Editorial Caption Card */}
                            <div className="p-5 sm:p-6 rounded-2xl bg-[#fbf7ee] border border-[#4c1315]/15 text-left mb-5">
                              <div className="flex items-center justify-between pb-3 border-b border-[#4c1315]/10 mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#4c1315] font-serif-display">
                                  Official Instagram Caption & Copy
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(post.caption || '');
                                    setCopiedCaptionId(post.id);
                                    setTimeout(() => setCopiedCaptionId(null), 2500);
                                  }}
                                  className="text-xs font-bold text-[#4c1315] bg-white px-3 py-1.5 rounded-xl border border-[#4c1315]/15 hover:bg-[#4c1315] hover:text-[#fbf7ee] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  {copiedCaptionId === post.id ? (
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
                                {post.caption || 'No caption provided.'}
                              </div>

                              <div className="mt-3 pt-3 border-t border-[#4c1315]/10 flex items-center justify-between text-[11px] text-[#4c1315]/60">
                                <span>Length: {(post.caption || '').length} characters • {((post.caption || '').split(/\s+/).filter(Boolean)).length} words</span>
                                <span>Hashtags: {((post.caption || '').match(/#[\w]+/g) || []).length}</span>
                              </div>
                            </div>

                            {/* Compliance Tag if applicable */}
                            {hasFca && (
                              <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span>FCA Compliance: Regulatory risk disclosure detected & verified.</span>
                              </div>
                            )}

                            {/* Previous Feedback Notes if any */}
                            {post.feedback && (
                              <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 shadow-2xs">
                                <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-800 font-serif-display">
                                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Notes for Editor:
                                </span>
                                <p className="whitespace-pre-wrap leading-relaxed font-body">{post.feedback}</p>
                              </div>
                            )}

                            {/* Inline Feedback Textarea if active */}
                            {activeReviewPostId === post.id && (
                              <div className="mb-5 p-5 rounded-2xl bg-[#fdf2f2] border border-[#f8b4b4] text-left animate-in fade-in duration-200 shadow-sm">
                                <label htmlFor={`edit-notes-${post.id}`} className="block text-xs font-bold text-[#9b1c1c] mb-1.5 font-serif-display">
                                  What revisions would you like the editor to make?
                                </label>
                                <textarea
                                  id={`edit-notes-${post.id}`}
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                  placeholder="e.g. Trim the first 2 seconds of the video, tighten the bullet points in the caption, or clarify the pension tax relief percentage..."
                                  rows={3}
                                  className="w-full p-3.5 rounded-xl bg-white border border-[#f8b4b4] text-xs sm:text-sm text-[#280c0d] placeholder:text-gray-400 focus:outline-none focus:border-[#9b1c1c] resize-none mb-3"
                                  autoFocus
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => { setActiveReviewPostId(null); setFeedbackText(''); }}
                                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#4c1315]/70 hover:text-[#4c1315] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePostAction(post, 'changes_requested')}
                                    disabled={submittingAction}
                                    className="px-5 py-2 rounded-xl text-xs font-bold font-serif-display bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] shadow-sm flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                                  >
                                    {submittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                    <span>Submit Revisions & Email Editor</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 3 Executive Action Decision Buttons */}
                          <div className="pt-4 border-t border-[#4c1315]/15 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Approve */}
                            <button
                              type="button"
                              onClick={() => {
                                triggerConfetti();
                                handlePostAction(post, 'approved');
                              }}
                              disabled={submittingAction}
                              className="sm:order-1 order-1 py-3.5 px-4 rounded-2xl font-bold font-serif-display text-sm bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#ad9b58] stroke-[2.5]" />
                              <span>Approve & Schedule</span>
                            </button>

                            {/* Request Edits */}
                            <button
                              type="button"
                              onClick={() => setActiveReviewPostId(post.id)}
                              disabled={submittingAction}
                              className="sm:order-2 order-2 py-3.5 px-4 rounded-2xl font-bold font-serif-display text-xs sm:text-sm bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                            >
                              <MessageSquare className="w-4 h-4 text-amber-600" />
                              <span>Request Edits</span>
                            </button>

                            {/* Disapprove */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Disapprove this draft? Your editor will be notified.')) {
                                  handlePostAction(post, 'rejected');
                                }
                              }}
                              disabled={submittingAction}
                              className="sm:order-3 order-3 py-3.5 px-3 rounded-2xl font-bold font-serif-display text-xs bg-white hover:bg-red-50 text-red-700 border border-red-200 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span>Disapprove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: REPORTING (Approved, Rejected, Posted, In Creation) */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* 4 CORE EXECUTIVE STATUS CARDS */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: In Creation / Pending */}
              <div className="bg-white rounded-3xl p-6 border-2 border-[#4c1315]/15 shadow-sm hover:border-[#ad9b58] transition relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#4c1315]/70">
                    In Creation
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#ad9b58]/15 flex items-center justify-center text-[#4c1315]">
                    <Clock className="w-4 h-4 text-[#ad9b58]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-serif-display font-bold text-[#4c1315]">
                    {inCreationPosts.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#4c1315]/60 mt-1">
                  Awaiting review
                </p>
              </div>

              {/* Card 2: Content Approved */}
              <div className="bg-white rounded-3xl p-6 border-2 border-[#4c1315]/15 shadow-sm hover:border-emerald-500 transition relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800">
                    Content Approved
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-serif-display font-bold text-emerald-800">
                    {approvedPosts.length}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700/80 mt-1">
                  Queued for release
                </p>
              </div>

              {/* Card 3: Rejected / Disapproved */}
              <div className="bg-white rounded-3xl p-6 border-2 border-[#4c1315]/15 shadow-sm hover:border-red-400 transition relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-red-800">
                    Rejected
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-700">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-serif-display font-bold text-red-800">
                    {rejectedPosts.length}
                  </span>
                </div>
                <p className="text-[11px] text-red-700/80 mt-1">
                  Cancelled drafts
                </p>
              </div>

              {/* Card 4: Posted / Published Live */}
              <div className="bg-white rounded-3xl p-6 border-2 border-[#4c1315]/15 shadow-sm hover:border-[#ad9b58] transition relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#4c1315]/70">
                    Posted Live
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#4c1315] flex items-center justify-center text-[#fbf7ee]">
                    <Sparkles className="w-4 h-4 text-[#ad9b58]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-serif-display font-bold text-[#4c1315]">
                    {postedPosts.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#4c1315]/60 mt-1">
                  Active broadcasts
                </p>
              </div>
            </section>

            {/* STATUS BREAKDOWN ACCORDION / LIST */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4c1315]/15 shadow-sm space-y-4">
              <h3 className="text-lg font-serif-display font-bold text-[#4c1315]">
                Content Pipeline Summary
              </h3>

              {broadcastPosts.length === 0 ? (
                <div className="py-8 text-center text-[#4c1315]/60 text-xs font-serif-display">
                  No broadcast assets currently in the portal. Upload drafts from the Editor Desk to populate your report.
                </div>
              ) : (
                <div className="divide-y divide-[#4c1315]/10">
                  {broadcastPosts.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ad9b58]/20 text-[#4c1315]">
                          {p.platform.replace('_', ' ')}
                        </span>
                        <p className="text-[#280c0d] font-medium truncate max-w-sm sm:max-w-md">
                          {p.caption || 'Creative draft'}
                        </p>
                      </div>

                      <div>
                        {p.is_published && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ad9b58]/20 text-[#4c1315]">
                            Posted
                          </span>
                        )}
                        {p.status === 'approved' && !p.is_published && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            Approved
                          </span>
                        )}
                        {p.status === 'rejected' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                            Rejected
                          </span>
                        )}
                        {p.status === 'changes_requested' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            Edits Requested
                          </span>
                        )}
                        {p.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                            In Creation
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


        {/* TAB 1.5: TEMPLATES APPROVAL VAULT */}
        {activeTab === 'templates' && (
          <div id="template-section-anchor">
            <TemplateVault
              posts={portalTemplates}
              selectedBrand={selectedBrand}
              onReviewAction={handlePostAction}
              submittingAction={submittingAction}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          </div>
        )}

        {/* TAB 2: CONTENT CALENDAR */}
        {activeTab === 'calendar' && (
          <ContentCalendar 
            posts={posts} 
            selectedBrand={selectedBrand} 
            onSelectReviewPost={(id) => {
              const idx = pendingPosts.findIndex(p => p.id === id);
              if (idx !== -1) setSelectedPendingIndex(idx);
              setActiveTab('review');
            }} 
          />
        )}

        {/* TAB 3: IDEAS & RAW FOOTAGE STUDIO */}
        {activeTab === 'ideas' && (
          <IdeasStudio 
            ideas={ideas} 
            posts={posts}
            selectedBrand={selectedBrand} 
            onIdeaCreated={(newIdea) => setIdeas(prev => [newIdea, ...prev])} 
            onIdeaUpdated={(updatedIdea) => setIdeas(prev => prev.map(i => i.id === updatedIdea.id ? updatedIdea : i))}
            onIdeaDeleted={(deletedId) => setIdeas(prev => prev.filter(i => i.id !== deletedId))}
            onNavigateToTab={(tab) => setActiveTab(tab)} 
          />
        )}
      </main>
    </div>
  );
}