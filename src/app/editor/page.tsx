'use client';

import React, { useState, useEffect, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { Post, PlatformType, MediaType, PostStatus, ContentIdea } from '@/types/post';
import { 
  Plus, 
  UploadCloud, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  FileVideo, 
  FileImage, 
  Layers,
  RefreshCw,
  Video,
  Image as ImageIcon,
  Share2,
  BarChart3,
  Link2,
  Send,
  XCircle,
  Eye,
  Heart,
  Trash2,
  Edit3,
  Settings,
  Save,
  Shield,
  Lock,
  LogOut,
  Lightbulb
} from 'lucide-react';
import { ClientIdeasBacklog } from '@/components/editor/ClientIdeasBacklog';

export default function EditorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [filterBrand, setFilterBrand] = useState<'all' | 'The Finance Woman' | 'In Business Together'>('all');
  const [activeEditorTab, setActiveEditorTab] = useState<'pipeline' | 'ideas'>('pipeline');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Live URL sync input state
  const [trackingPostId, setTrackingPostId] = useState<string | null>(null);
  const [liveUrlInput, setLiveUrlInput] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Form State
  const [platform, setPlatform] = useState<PlatformType>('instagram_reel');
  const [creatorName, setCreatorName] = useState('The Finance Woman');
  const [creatorHandle, setCreatorHandle] = useState('thefinancewoman');
  const [caption, setCaption] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [editorNotes, setEditorNotes] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [directMediaUrl, setDirectMediaUrl] = useState('');

  const [activeFilter, setActiveFilter] = useState<'all' | PostStatus>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadFormRef = useRef<HTMLDivElement | null>(null);

  // Dedicated Reel Cover Image State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Admin & Post Management State
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [previewingMediaPost, setPreviewingMediaPost] = useState<Post | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [editCaption, setEditCaption] = useState('');
  const [editEditorNotes, setEditEditorNotes] = useState('');
  const [editPlatform, setEditPlatform] = useState<PlatformType>('instagram_reel');
  const [editScheduledAt, setEditScheduledAt] = useState('');
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Admin Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editorPasscodeSetting, setEditorPasscodeSetting] = useState('');
  const [portalPasscodeSetting, setPortalPasscodeSetting] = useState('');
  const [notificationEmailSetting, setNotificationEmailSetting] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async (passToVerify?: string) => {
    const enteredPass = passToVerify || password;
    if (!enteredPass.trim()) {
      setAuthError('Please enter the editor passcode.');
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError('');
      const res = await fetch('/api/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: enteredPass }),
      });

      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        setAuthError(data.error || 'Incorrect editor passcode. Please check and try again.');
        localStorage.removeItem('tfw_editor_token');
        return;
      }

      setIsAuthenticated(true);
      localStorage.setItem('tfw_editor_token', enteredPass);
      if (data.settings) {
        setEditorPasscodeSetting(data.settings.editor_passcode || '');
        setPortalPasscodeSetting(data.settings.portal_passcode || '');
        setNotificationEmailSetting(data.settings.notification_email || '');
      }
      fetchPosts();
    } catch {
      setAuthError('Failed to authenticate. Please check your connection.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tfw_editor_token');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Check saved session on mount
  useEffect(() => {
    const savedPass = localStorage.getItem('tfw_editor_token');
    if (savedPass) {
      setPassword(savedPass);
      handleLogin(savedPass);
    }
  }, []);

  const fetchPosts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [resPosts, resIdeas] = await Promise.all([
        fetch(`/api/posts?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/ideas?t=${Date.now()}`, { cache: 'no-store' }),
      ]);
      const dataPosts = await resPosts.json();
      if (dataPosts.posts) {
        setPosts(dataPosts.posts);
      }
      const dataIdeas = await resIdeas.json();
      if (dataIdeas.ideas) {
        setIdeas(dataIdeas.ideas);
      }
    } catch (err) {
      console.error('Failed to fetch posts or ideas:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Background Auto-Poll for real-time approvals across all devices
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      fetchPosts(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleConvertToDraft = (idea: ContentIdea) => {
    setCreatorName(idea.creator_name || 'The Finance Woman');
    setCreatorHandle(
      (idea.creator_name || '').toLowerCase().includes('business')
        ? 'inbusinesstogether'
        : 'thefinancewoman'
    );
    setCaption(`${idea.title}\n\n${idea.notes}`);
    if (idea.category === 'post') setPlatform('instagram_post');
    else if (idea.category === 'thought_leadership') setPlatform('linkedin');
    else setPlatform('instagram_reel');

    if (idea.raw_video_url) {
      setDirectMediaUrl(idea.raw_video_url);
      setMediaType('video');
    }

    // Switch to upload pipeline tab and scroll to form
    setActiveEditorTab('pipeline');
    handleUpdateIdeaStatus(idea.id, { stage: 'editing', status: 'in_production' });
    setTimeout(() => {
      uploadFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUpdateIdeaStatus = async (id: string, updates: Partial<ContentIdea>) => {
    try {
      const res = await fetch('/api/ideas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.idea) {
        setIdeas((prev) => prev.map((i) => (i.id === id ? data.idea : i)));
      }
    } catch (err) {
      console.error('Failed to update idea status:', err);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client idea?')) return;
    try {
      const res = await fetch(`/api/ideas?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIdeas((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete idea:', err);
    }
  };

  const handleFilesChange = (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;
    setMediaFiles(files);
    const first = files[0];
    const isVideo = first.type.startsWith('video/') || first.name.endsWith('.mp4') || first.name.endsWith('.mov');
    setMediaType(isVideo ? 'video' : 'image');
    if (!isVideo && platform === 'instagram_reel') {
      setPlatform('instagram_post');
    }
    setMediaPreviewUrls(files.map(f => URL.createObjectURL(f)));
  };

  const copyToClipboard = (token: string) => {
    const fullUrl = `${window.location.origin}/review/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!creatorName.trim()) {
      alert('Please enter a creator name');
      return;
    }

    if (mediaFiles.length === 0 && !directMediaUrl.trim()) {
      alert('Please upload a media file (video or images for carousel) or provide a media URL');
      return;
    }

    setCreating(true);

    try {
      let finalMediaUrl = directMediaUrl.trim();
      let uploadedUrls: string[] = [];

      if (mediaFiles.length > 0) {
        for (let idx = 0; idx < mediaFiles.length; idx++) {
          const f = mediaFiles[idx];
          setUploadProgress(Math.round(((idx) / mediaFiles.length) * 80) + 10);
          
          const presignRes = await fetch('/api/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: f.name,
              contentType: f.type || 'application/octet-stream',
            }),
          });
          const presignData = await presignRes.json();
          if (!presignRes.ok) throw new Error(presignData.error || 'Failed to get upload URL');

          let itemUrl = '';
          if (presignData.type === 'blob') {
            const newBlob = await upload(`media/${Date.now()}-${f.name}`, f, {
              access: 'public',
              handleUploadUrl: '/api/upload',
            });
            itemUrl = newBlob.url;
          } else if (presignData.type === 'r2' || presignData.signedUrl) {
            const uploadRes = await fetch(presignData.signedUrl, {
              method: 'PUT',
              headers: { 'Content-Type': f.type },
              body: f,
            });
            if (!uploadRes.ok) throw new Error('Direct upload failed');
            itemUrl = presignData.publicUrl;
          } else {
            itemUrl = mediaPreviewUrls[idx] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe';
          }
          uploadedUrls.push(itemUrl);
        }

        finalMediaUrl = uploadedUrls[0] || '';
        setUploadProgress(90);
      }

      // If a separate cover image was attached for a Reel/Video post, upload it and append to media_urls
      if (coverFile && mediaType === 'video') {
        setUploadProgress(92);
        const presignRes = await fetch('/api/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: coverFile.name,
            contentType: coverFile.type || 'image/jpeg',
          }),
        });
        const presignData = await presignRes.json();
        let coverItemUrl = '';
        if (presignData.type === 'blob') {
          const newBlob = await upload(`media/${Date.now()}-${coverFile.name}`, coverFile, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          coverItemUrl = newBlob.url;
        } else if (presignData.type === 'r2' || presignData.signedUrl) {
          const uploadRes = await fetch(presignData.signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': coverFile.type },
            body: coverFile,
          });
          if (uploadRes.ok) coverItemUrl = presignData.publicUrl;
        } else {
          coverItemUrl = coverPreviewUrl || '';
        }

        if (coverItemUrl) {
          if (uploadedUrls.length === 0 && finalMediaUrl) {
            uploadedUrls = [finalMediaUrl, coverItemUrl];
          } else if (uploadedUrls.length > 0) {
            uploadedUrls.push(coverItemUrl);
          }
        }
      }

      const postRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_name: creatorName.trim(),
          creator_handle: creatorHandle.trim().replace(/^@/, '') || null,
          platform,
          media_url: finalMediaUrl,
          media_urls: uploadedUrls.length > 1 ? uploadedUrls : (uploadedUrls.length === 1 ? [uploadedUrls[0]] : undefined),
          media_type: mediaType,
          caption: caption.trim() || null,
          editor_notes: editorNotes.trim() || null,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });

      const postData = await postRes.json();
      if (!postRes.ok) throw new Error(postData.error || 'Failed to create post');

      await fetchPosts();
      setCaption('');
      setScheduledAt('');
      setMediaFiles([]);
      setMediaPreviewUrls([]);
      setCoverFile(null);
      setCoverPreviewUrl(null);
      setEditorNotes('');
      setDirectMediaUrl('');
      setUploadProgress(null);

      if (postData.post?.token) {
        copyToClipboard(postData.post.token);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error creating draft');
    } finally {
      setCreating(false);
      setUploadProgress(null);
    }
  };

  const handleActivateTracking = async (postId: string) => {
    if (!liveUrlInput.trim()) {
      alert('Please enter a live post URL');
      return;
    }

    try {
      setSyncingId(postId);
      const res = await fetch('/api/sync-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          live_post_url: liveUrlInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to link live post');

      await fetchPosts();
      setTrackingPostId(null);
      setLiveUrlInput('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to synchronize live post');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      setDeletingId(postId);
      const res = await fetch(`/api/posts?id=${encodeURIComponent(postId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete post');
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting post');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (post: Post) => {
    setEditingPost(post);
    setEditCaption(post.caption || '');
    setEditEditorNotes(post.editor_notes || '');
    setEditPlatform(post.platform);
    setEditScheduledAt(post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      setIsUpdatingPost(true);
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPost.id,
          caption: editCaption.trim() || null,
          editor_notes: editEditorNotes.trim() ? editEditorNotes : null,
          platform: editPlatform,
          scheduled_at: editScheduledAt ? new Date(editScheduledAt).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update post');

      setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? { ...p, ...data.post } : p)));
      setEditingPost(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating post');
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = localStorage.getItem('tfw_editor_token') || password;

    try {
      setIsSavingSettings(true);
      setSettingsMsg(null);

      const res = await fetch('/api/editor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPass,
          updates: {
            editor_passcode: editorPasscodeSetting.trim() || undefined,
            portal_passcode: portalPasscodeSetting.trim() || undefined,
            notification_email: notificationEmailSetting.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      if (editorPasscodeSetting.trim()) {
        localStorage.setItem('tfw_editor_token', editorPasscodeSetting.trim());
        setPassword(editorPasscodeSetting.trim());
      }

      setSettingsMsg({ type: 'success', text: 'Admin configuration updated successfully.' });
      setTimeout(() => {
        setSettingsMsg(null);
        setShowSettingsModal(false);
      }, 1500);
    } catch (err: unknown) {
      setSettingsMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update settings' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // PASSCODE SCREEN FOR EDITOR
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

          <span className="inline-flex items-center text-[11px] uppercase font-bold tracking-widest px-3.5 py-1 rounded-full bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/40 mb-3">
            TFW.SOCIAL DESK
          </span>

          <h2 className="text-xl font-serif-display font-bold text-[#4c1315] mb-2">
            Editorial & Creator Desk
          </h2>
          <p className="text-xs text-[#4c1315]/75 mb-7 leading-relaxed font-body">
            Authorized personnel only. Enter the editor passcode to upload creative assets, draft captions, and submit for executive sign-off.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4 text-left">
            <div>
              <label htmlFor="editor-passcode-input" className="block text-xs uppercase tracking-wider font-bold text-[#4c1315]/80 mb-2">
                Editor Passcode
              </label>
              <div className="relative">
                <input
                  id="editor-passcode-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter editor passcode"
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
              className="w-full py-3.5 px-4 rounded-xl font-serif-display font-bold text-sm bg-[#4c1315] text-[#fbf7ee] hover:bg-[#6e1c1f] transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#ad9b58]" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <span>Unlock Editorial Desk</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#4c1315]/10 text-center">
            <span className="text-[11px] text-[#4c1315]/60 block mb-2">Looking for client review & reporting?</span>
            <a 
              href="/portal" 
              className="text-xs font-serif-display font-semibold text-[#4c1315] hover:text-[#ad9b58] transition inline-flex items-center gap-1 underline underline-offset-4"
            >
              Switch to Executive Portal (/portal) &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  const filteredPosts = posts.filter((p) => {
    if (filterBrand !== 'all') {
      const name = (p.creator_name || '').toLowerCase();
      if (filterBrand === 'The Finance Woman' && !name.includes('finance')) return false;
      if (filterBrand === 'In Business Together' && !name.includes('business')) return false;
    }
    if (activeFilter === 'all') return true;
    return p.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#fbf7ee] text-[#280c0d] font-body selection:bg-[#4c1315] selection:text-[#fbf7ee]">
      {/* Editorial Navigation Header */}
      <header className="border-b border-[#4c1315]/15 bg-[#fbf7ee]/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Authentic Brand Logo */}
            <a href="/editor" className="flex items-center gap-3 group">
              <img 
                src="/tfw-logo.svg" 
                alt="The Finance Woman" 
                className="h-10 w-auto object-contain"
              />
              <span className="hidden md:inline-block text-[11px] uppercase tracking-widest font-bold text-[#ad9b58] border-l border-[#4c1315]/20 pl-3">
                Editorial & Content Desk
              </span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Link to Influencer Portal */}
            <a
              href="/portal"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-serif-display font-bold bg-[#4c1315] text-[#fbf7ee] hover:bg-[#6e1c1f] shadow-sm transition"
            >
              <span>Open Influencer Portal (/portal)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#ad9b58]" />
            </a>

            {/* Admin Settings Button */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#ad9b58]/20 text-[#4c1315] hover:bg-[#ad9b58]/30 border border-[#ad9b58]/40 transition cursor-pointer"
              title="Admin & Passcode Settings"
            >
              <Settings className="w-3.5 h-3.5 text-[#4c1315]" />
              <span className="hidden sm:inline">Admin Settings</span>
            </button>

            <button
              type="button"
              onClick={() => fetchPosts()}
              className="p-2 rounded-xl text-[#4c1315]/70 hover:text-[#4c1315] hover:bg-[#4c1315]/10 transition"
              title="Refresh posts"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ad9b58]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#4c1315]/10 text-[#4c1315] hover:bg-[#4c1315]/20 transition cursor-pointer"
              title="Lock Editorial Desk"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Desk</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Editor Main Tabs: Pipeline vs Client Ideas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4c1315]/15 pb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveEditorTab('pipeline')}
              className={`pb-2 text-sm font-serif-display font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeEditorTab === 'pipeline'
                  ? 'border-[#4c1315] text-[#4c1315]'
                  : 'border-transparent text-[#4c1315]/60 hover:text-[#4c1315]'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-[#ad9b58]" />
              <span>Upload &amp; Content Pipeline</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#4c1315]/10 text-[#4c1315]">
                {filteredPosts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditorTab('ideas')}
              className={`pb-2 text-sm font-serif-display font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeEditorTab === 'ideas'
                  ? 'border-[#4c1315] text-[#4c1315]'
                  : 'border-transparent text-[#4c1315]/60 hover:text-[#4c1315]'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-[#ad9b58]" />
              <span>Client Ideas &amp; Raw Footage</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                ideas.length > 0 ? 'bg-[#ad9b58] text-[#280c0d]' : 'bg-[#4c1315]/10 text-[#4c1315]'
              }`}>
                {ideas.length}
              </span>
            </button>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center p-1 bg-white rounded-2xl border border-[#4c1315]/15 text-xs font-bold font-serif-display">
            <span className="text-[10px] text-[#4c1315]/60 uppercase tracking-wider px-2">Brand:</span>
            <button
              type="button"
              onClick={() => setFilterBrand('all')}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${filterBrand === 'all' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/70'}`}
            >
              All ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterBrand('The Finance Woman')}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${filterBrand === 'The Finance Woman' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/70'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ad9b58]" />
              <span>TFW</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterBrand('In Business Together')}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${filterBrand === 'In Business Together' ? 'bg-[#A8442A] text-white' : 'text-[#4c1315]/70'}`}
            >
              <img src="/ibt-logo.png" alt="IBT" className="h-3 w-auto object-contain rounded-xs bg-white px-0.5" />
              <span>IBT</span>
            </button>
          </div>
        </div>

        {activeEditorTab === 'ideas' && (
          <ClientIdeasBacklog
            ideas={ideas}
            selectedBrand={filterBrand}
            onConvertToDraft={handleConvertToDraft}
            onUpdateIdeaStatus={handleUpdateIdeaStatus}
            onDeleteIdea={handleDeleteIdea}
          />
        )}

        {activeEditorTab === 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: New Post Creation Form */}
            <div ref={uploadFormRef} className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#4c1315]/15 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#ad9b58]/15 via-[#4c1315]/5 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-[#4c1315]/10">
              <div className="p-2 rounded-xl bg-[#4c1315] text-[#fbf7ee]">
                <Sparkles className="w-4 h-4 text-[#ad9b58]" />
              </div>
              <div>
                <h2 className="text-lg font-serif-display font-bold text-[#4c1315]">
                  Add Content for Approval
                </h2>
                <p className="text-xs text-[#4c1315]/70">
                  Upload video or image draft and assign format for client review
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4c1315]/80 mb-2">
                  Broadcast Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPlatform('instagram_reel');
                      setMediaType('video');
                    }}
                    className={`py-3 px-2 rounded-2xl text-xs font-serif-display font-bold flex flex-col items-center gap-1.5 border transition cursor-pointer ${
                      platform === 'instagram_reel'
                        ? 'bg-[#4c1315] text-[#fbf7ee] border-[#ad9b58] shadow-sm'
                        : 'bg-[#fbf7ee] border-[#4c1315]/15 text-[#4c1315]/80 hover:bg-white'
                    }`}
                  >
                    <Video className={`w-4 h-4 ${platform === 'instagram_reel' ? 'text-[#ad9b58]' : ''}`} />
                    <span>IG Reel (9:16)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('instagram_post')}
                    className={`py-3 px-2 rounded-2xl text-xs font-serif-display font-bold flex flex-col items-center gap-1.5 border transition cursor-pointer ${
                      platform === 'instagram_post'
                        ? 'bg-[#4c1315] text-[#fbf7ee] border-[#ad9b58] shadow-sm'
                        : 'bg-[#fbf7ee] border-[#4c1315]/15 text-[#4c1315]/80 hover:bg-white'
                    }`}
                  >
                    <ImageIcon className={`w-4 h-4 ${platform === 'instagram_post' ? 'text-[#ad9b58]' : ''}`} />
                    <span>IG Feed Post (1:1 / 4:5)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('linkedin')}
                    className={`py-3 px-2 rounded-2xl text-xs font-serif-display font-bold flex flex-col items-center gap-1.5 border transition cursor-pointer ${
                      platform === 'linkedin'
                        ? 'bg-[#4c1315] text-[#fbf7ee] border-[#ad9b58] shadow-sm'
                        : 'bg-[#fbf7ee] border-[#4c1315]/15 text-[#4c1315]/80 hover:bg-white'
                    }`}
                  >
                    <Share2 className={`w-4 h-4 ${platform === 'linkedin' ? 'text-[#ad9b58]' : ''}`} />
                    <span>LinkedIn Card</span>
                  </button>
                </div>
              </div>

              {/* Target Brand Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4c1315]/80 mb-2 font-serif-display">
                  Target Brand for Approval
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatorName('The Finance Woman');
                      setCreatorHandle('thefinancewoman');
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                      creatorName.toLowerCase().includes('finance')
                        ? 'bg-[#4c1315] text-[#fbf7ee] border-[#ad9b58] shadow-xs'
                        : 'bg-[#fbf7ee] border-[#4c1315]/15 text-[#4c1315]/80 hover:bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#280c0d] flex items-center justify-center flex-shrink-0 p-1">
                      <img src="/tfw-logo.svg" alt="TFW" className="h-5 w-auto object-contain" />
                    </div>
                    <div>
                      <span className="block font-bold text-xs font-serif-display">The Finance Woman</span>
                      <span className="block text-[10px] opacity-75">Romany Youell • @thefinancewoman</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatorName('In Business Together');
                      setCreatorHandle('inbusinesstogether');
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                      creatorName.toLowerCase().includes('business')
                        ? 'bg-[#A8442A] text-white border-[#C98B6B] shadow-xs'
                        : 'bg-[#fbf7ee] border-[#4c1315]/15 text-[#4c1315]/80 hover:bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0 p-1 border border-[#C98B6B]/30">
                      <img src="/ibt-logo.png" alt="IBT" className="h-4 w-auto object-contain rounded-xs" />
                    </div>
                    <div>
                      <span className="block font-bold text-xs font-serif-display">In Business Together</span>
                      <span className="block text-[10px] opacity-75">Director Couples • inbusinesstogether.co.uk</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Creator Name & Handle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4c1315]/80 mb-1.5">
                    Creator Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="The Finance Woman"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs font-medium text-[#280c0d] focus:outline-none focus:border-[#ad9b58] focus:ring-1 focus:ring-[#ad9b58]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4c1315]/80 mb-1.5">
                    Handle
                  </label>
                  <input
                    type="text"
                    placeholder="thefinancewoman"
                    value={creatorHandle}
                    onChange={(e) => setCreatorHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs font-medium text-[#280c0d] focus:outline-none focus:border-[#ad9b58] focus:ring-1 focus:ring-[#ad9b58]"
                  />
                </div>
              </div>

              {/* Scheduled Date / Time */}
              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#ad9b58]" />
                  <span>Scheduled Release Date & Time (Optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs font-medium text-[#280c0d] focus:outline-none focus:border-[#ad9b58]"
                />
              </div>

              {/* Media Uploader: Drag & Drop */}
              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1.5 flex items-center justify-between">
                  <span>Attach Media Asset (Video or Carousel Images)</span>
                  <span className="text-[11px] text-[#4c1315]/60 font-normal">Select 1-10 files for carousel (.mp4, .jpg, .png)</span>
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFilesChange(e.dataTransfer.files);
                    }
                  }}
                  className="border-2 border-dashed border-[#4c1315]/25 hover:border-[#ad9b58] rounded-2xl p-5 text-center cursor-pointer transition bg-[#fbf7ee]/60 hover:bg-[#fbf7ee]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="video/mp4,video/quicktime,image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFilesChange(e.target.files);
                      }
                    }}
                  />

                  {mediaFiles.length > 0 ? (
                    <div className="flex flex-col items-center">
                      {mediaType === 'video' ? (
                        <FileVideo className="w-8 h-8 text-[#4c1315] mb-2" />
                      ) : (
                        <FileImage className="w-8 h-8 text-[#ad9b58] mb-2" />
                      )}
                      <p className="text-xs font-bold text-[#4c1315] truncate max-w-[240px]">
                        {mediaFiles.length > 1
                          ? `${mediaFiles.length} Carousel Slides Attached`
                          : mediaFiles[0].name}
                      </p>
                      <p className="text-[11px] text-[#4c1315]/60 mt-0.5">
                        {mediaFiles.length > 1
                          ? mediaFiles.map(f => f.name).slice(0, 3).join(', ') + (mediaFiles.length > 3 ? '...' : '')
                          : `${(mediaFiles[0].size / (1024 * 1024)).toFixed(2)} MB • Click to change`}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 text-[#ad9b58] mb-2" />
                      <p className="text-xs font-semibold text-[#4c1315]">
                        Drag and drop creative assets here, or <span className="text-[#ad9b58] underline">browse files</span>
                      </p>
                      <p className="text-[11px] text-[#4c1315]/60 mt-1">
                        High-definition video reel or multi-slide carousel images (hold Ctrl/Cmd to select multiple)
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct URL Input */}
                <div className="mt-2 text-left">
                  <input
                    type="url"
                    placeholder="Or paste media URL (e.g. CDN or public video link)"
                    value={directMediaUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDirectMediaUrl(val);
                      if (val.endsWith('.mp4') || val.endsWith('.mov')) {
                        setMediaType('video');
                      } else if (val.endsWith('.png') || val.endsWith('.jpg') || val.endsWith('.jpeg') || val.endsWith('.webp')) {
                        setMediaType('image');
                        if (platform === 'instagram_reel') {
                          setPlatform('instagram_post');
                        }
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#fbf7ee] border border-[#4c1315]/15 text-[#280c0d] placeholder:text-[#4c1315]/40 focus:outline-none focus:border-[#ad9b58]"
                  />
                </div>

                {/* Dedicated Reel Cover Image Uploader (Optional) */}
                {(mediaType === 'video' || platform === 'instagram_reel') && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-[#fbf7ee] border border-[#ad9b58]/40 text-left transition">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#4c1315] flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#ad9b58]" />
                        <span>Reel Cover Photo (For Profile Grid Approval)</span>
                      </label>
                      <span className="text-[10px] text-[#ad9b58] font-bold uppercase tracking-wider">
                        Client Request
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4c1315]/70 mb-2.5">
                      Upload an aesthetic 9:16 or 4:5 cover with clear title typography so Romany can preview how the video sits on her profile feed.
                    </p>

                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          setCoverFile(file);
                          setCoverPreviewUrl(URL.createObjectURL(file));
                        }
                      }}
                    />

                    {coverFile && coverPreviewUrl ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#4c1315]/15">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={coverPreviewUrl}
                            alt="Cover Preview"
                            className="w-10 h-10 rounded-lg object-cover border border-[#ad9b58]/30 flex-shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold text-[#4c1315] truncate">
                              {coverFile.name}
                            </p>
                            <p className="text-[10px] text-[#4c1315]/60">
                              {(coverFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for approval
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => coverFileInputRef.current?.click()}
                            className="text-xs text-[#ad9b58] hover:text-[#4c1315] font-semibold px-2 py-1 rounded transition cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCoverFile(null);
                              setCoverPreviewUrl(null);
                            }}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#ad9b58] bg-white/70 hover:bg-white text-xs font-semibold text-[#4c1315] flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-[#ad9b58]" />
                        <span>Upload Dedicated Cover Image</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Note for Romany */}
              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1.5 flex items-center justify-between">
                  <span>Note for Romany / Reviewer (Optional)</span>
                  <span className="text-[11px] text-[#ad9b58] font-bold">Appears prominently in client review portal</span>
                </label>
                <textarea
                  rows={2}
                  value={editorNotes}
                  onChange={(e) => setEditorNotes(e.target.value)}
                  placeholder="E.g. Hi Romany, following your feedback I tried new colour variations..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs text-[#280c0d] placeholder:text-[#4c1315]/40 focus:outline-none focus:border-[#ad9b58] resize-none"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1.5">
                  Editorial Caption
                </label>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Draft caption, high-earner tax hooks, disclosures, and hashtags..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs text-[#280c0d] placeholder:text-[#4c1315]/40 focus:outline-none focus:border-[#ad9b58] resize-none"
                />
              </div>

              {/* Progress bar if uploading */}
              {uploadProgress !== null && (
                <div className="w-full bg-[#fbf7ee] rounded-full h-2 overflow-hidden border border-[#4c1315]/15">
                  <div
                    className="bg-[#ad9b58] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3.5 rounded-xl font-serif-display font-bold text-sm bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] shadow-md active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {creating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#ad9b58]" />
                    <span>Uploading & Queuing for Review...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-[#ad9b58] stroke-[3]" />
                    <span>Upload & Queue for Client Review</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Content Pipeline & Status Monitor */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#4c1315]/15 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-serif-display font-bold text-[#4c1315] text-base">Content Pipeline</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ad9b58]/20 text-[#4c1315] font-bold border border-[#ad9b58]/35">
                  {posts.length} posts
                </span>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1 bg-[#fbf7ee] p-1 rounded-xl border border-[#4c1315]/15 text-xs">
                {(['all', 'pending', 'approved', 'changes_requested'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-lg font-serif-display font-semibold transition capitalize cursor-pointer ${
                      activeFilter === filter
                        ? 'bg-[#4c1315] text-[#fbf7ee] shadow-xs'
                        : 'text-[#4c1315]/70 hover:text-[#4c1315]'
                    }`}
                  >
                    {filter.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Cards */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white/80 border border-[#4c1315]/15 rounded-3xl p-12 text-center">
                <Clock className="w-8 h-8 text-[#ad9b58] mx-auto mb-3" />
                <p className="text-[#4c1315]/70 text-sm font-serif-display">No posts found in this filter.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredPosts.map((p) => {
                  const reviewUrl = typeof window !== 'undefined' ? `${window.location.origin}/review/${p.token}` : `/review/${p.token}`;
                  const isTrackingOpen = trackingPostId === p.id;

                  return (
                    <div
                      key={p.id || p.token}
                      className="bg-white border border-[#4c1315]/15 hover:border-[#ad9b58] rounded-2xl p-4 sm:p-5 transition shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewingMediaPost(p);
                              setActiveSlideIndex(0);
                            }}
                            className="w-14 h-14 rounded-xl bg-[#280c0d] flex items-center justify-center flex-shrink-0 border border-[#ad9b58]/40 overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-[#ad9b58] transition"
                            title="Click to view full graphics & slides"
                          >
                            {(() => {
                              const coverImg = p.media_urls && p.media_urls.length > 1
                                ? p.media_urls.find(u => u !== p.media_url && !u.endsWith('.mp4') && !u.endsWith('.mov'))
                                : null;
                              if (coverImg) {
                                return <img src={coverImg} alt="Cover preview" className="w-full h-full object-cover" />;
                              }
                              if (p.media_url) {
                                return p.media_type === 'video' ? (
                                  <video src={p.media_url} className="w-full h-full object-cover pointer-events-none" />
                                ) : (
                                  <img src={p.media_url} alt="Post preview" className="w-full h-full object-cover" />
                                );
                              }
                              return p.media_type === 'video' ? (
                                <FileVideo className="w-6 h-6 text-[#ad9b58]" />
                              ) : (
                                <FileImage className="w-6 h-6 text-[#ad9b58]" />
                              );
                            })()}
                            {p.media_urls && p.media_urls.length > 1 && (
                              <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-bold text-white px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <Layers className="w-2.5 h-2.5 text-[#ad9b58]" />
                                {p.media_urls.length}
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif-display font-bold text-[#4c1315] text-sm">
                                {p.creator_name}
                              </h3>
                              {p.creator_handle && (
                                <span className="text-xs text-[#4c1315]/60 font-mono">
                                  @{p.creator_handle}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#4c1315]/70 mt-0.5">
                              <span className="capitalize font-semibold text-[#4c1315]">
                                {p.platform.replace('_', ' ')}
                              </span>
                              <span>•</span>
                              <span>
                                {p.scheduled_at
                                  ? new Date(p.scheduled_at).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'Queue ASAP'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          {p.is_published && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/40">
                              Published Live
                            </span>
                          )}
                          {p.status === 'approved' && !p.is_published && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
                            </span>
                          )}
                          {p.status === 'changes_requested' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Changes Requested
                            </span>
                          )}
                          {p.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                              <XCircle className="w-3.5 h-3.5 text-red-600" /> Disapproved
                            </span>
                          )}
                          {p.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ad9b58]/15 text-[#4c1315] border border-[#ad9b58]/30">
                              <Clock className="w-3.5 h-3.5 text-[#ad9b58]" /> Pending Review
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notes to Romany (Editor Notes) */}
                      {p.editor_notes && (
                        <div className="p-3.5 rounded-xl bg-[#fdf8f4] border border-[#ad9b58]/40 text-xs text-[#4c1315] space-y-1">
                          <strong className="font-bold flex items-center gap-1.5 text-[#4c1315]">
                            <span className="w-2 h-2 rounded-full bg-[#ad9b58]"></span>
                            Your Note to Romany:
                          </strong>
                          <p className="whitespace-pre-wrap leading-relaxed text-[#4c1315]/90">{p.editor_notes}</p>
                        </div>
                      )}

                      {/* Client Feedback Note if available */}
                      {p.feedback && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <strong className="font-bold flex items-center gap-1.5 text-amber-950">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              Client Feedback Notes:
                            </strong>
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewingMediaPost(p);
                                setActiveSlideIndex(0);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-200/60 hover:bg-amber-200 text-amber-900 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Associated Graphics ({p.media_urls?.length || 1} slides)</span>
                            </button>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{p.feedback}</p>
                        </div>
                      )}

                      {/* Attached Graphics Carousel Strip */}
                      {p.media_urls && p.media_urls.length > 1 ? (
                        <div className="bg-[#fbf7ee] p-2.5 rounded-xl border border-[#4c1315]/15 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-[#4c1315]/80 font-bold px-1">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-[#ad9b58]" />
                              Attached Carousel Slides ({p.media_urls.length})
                            </span>
                            <span className="text-[10px] text-[#4c1315]/60 font-normal">Click any slide to enlarge</span>
                          </div>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                            {p.media_urls.map((slideUrl, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => {
                                  setPreviewingMediaPost(p);
                                  setActiveSlideIndex(sIdx);
                                }}
                                className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-[#4c1315]/20 hover:border-[#ad9b58] hover:ring-2 hover:ring-[#ad9b58] transition group cursor-pointer"
                              >
                                <img src={slideUrl} alt={`Slide ${sIdx + 1}`} className="w-full h-full object-cover" />
                                <span className="absolute bottom-0.5 left-0.5 bg-black/75 text-[9px] text-white font-bold px-1 rounded">
                                  #{sIdx + 1}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : p.media_url && p.media_type === 'image' ? (
                        <div className="flex items-center gap-3 bg-[#fbf7ee] p-2 rounded-xl border border-[#4c1315]/15">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewingMediaPost(p);
                              setActiveSlideIndex(0);
                            }}
                            className="w-12 h-12 rounded-lg overflow-hidden border border-[#4c1315]/20 hover:ring-2 hover:ring-[#ad9b58] flex-shrink-0 cursor-pointer"
                          >
                            <img src={p.media_url} alt="Attached Graphic" className="w-full h-full object-cover" />
                          </button>
                          <div className="text-xs text-[#4c1315]">
                            <span className="font-bold block">1 Attached Graphic</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewingMediaPost(p);
                                setActiveSlideIndex(0);
                              }}
                              className="text-[11px] text-[#ad9b58] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Eye className="w-3 h-3" /> Click to view full image
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* Caption snippet */}
                      {p.caption && (
                        <p className="text-xs text-[#280c0d]/80 bg-[#fbf7ee] p-2.5 rounded-xl border border-[#4c1315]/10 line-clamp-2">
                          {p.caption}
                        </p>
                      )}

                      {/* Live URL / Metrics display if published */}
                      {p.is_published && (
                        <div className="bg-[#fbf7ee] border border-[#ad9b58]/40 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-[#4c1315]">
                            <Link2 className="w-3.5 h-3.5 text-[#ad9b58]" />
                            <a
                              href={p.live_post_url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#4c1315] font-semibold hover:underline truncate max-w-[260px]"
                            >
                              {p.live_post_url}
                            </a>
                          </div>
                          <div className="flex items-center gap-3 text-[#4c1315]/80 font-serif-display font-semibold">
                            <span>👁️ {(p.views || 0).toLocaleString()}</span>
                            <span>❤️ {(p.likes || 0).toLocaleString()}</span>
                            <span>💬 {(p.comments_count || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {/* Editor Link Activation Input */}
                      {isTrackingOpen && (
                        <div className="bg-[#fbf7ee] p-3.5 rounded-xl border border-[#ad9b58]/40 space-y-2 animate-in fade-in">
                          <label className="block text-xs font-bold text-[#4c1315]">
                            Paste Live Published URL (Instagram Reel / LinkedIn Post)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={liveUrlInput}
                              onChange={(e) => setLiveUrlInput(e.target.value)}
                              placeholder="https://instagram.com/reel/... or https://linkedin.com/posts/..."
                              className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-[#4c1315]/20 text-[#280c0d] focus:outline-none focus:border-[#ad9b58]"
                            />
                            <button
                              type="button"
                              onClick={() => handleActivateTracking(p.id)}
                              disabled={syncingId === p.id}
                              className="px-4 py-2 bg-[#4c1315] text-[#fbf7ee] font-bold text-xs rounded-xl hover:bg-[#6e1c1f] transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {syncingId === p.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ad9b58]" /> : <Send className="w-3.5 h-3.5 text-[#ad9b58]" />}
                              <span>Activate</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTrackingPostId(null);
                                setLiveUrlInput('');
                              }}
                              className="px-3 py-2 text-xs text-[#4c1315]/70 hover:text-[#4c1315]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Link Copy & Actions */}
                      <div className="pt-2 border-t border-[#4c1315]/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate text-xs text-[#4c1315]/70 font-mono bg-[#fbf7ee] px-3 py-1.5 rounded-xl border border-[#4c1315]/15 flex-1 max-w-[320px]">
                          <span className="truncate">{reviewUrl}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {!p.is_published && (
                            <button
                              type="button"
                              onClick={() => {
                                setTrackingPostId(p.id);
                                setLiveUrlInput(p.live_post_url || '');
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#fbf7ee] hover:bg-[#ad9b58]/20 text-[#4c1315] flex items-center gap-1.5 transition border border-[#4c1315]/15"
                              title="Link published post for live metrics tracking"
                            >
                              <Link2 className="w-3.5 h-3.5 text-[#ad9b58]" />
                              <span>Link Live</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => copyToClipboard(p.token)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#fbf7ee] hover:bg-[#4c1315] hover:text-[#fbf7ee] text-[#4c1315] border border-[#4c1315]/20 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            {copiedToken === p.token ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#ad9b58]" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            className="p-1.5 rounded-xl text-[#4c1315]/70 hover:text-[#4c1315] hover:bg-[#4c1315]/10 transition cursor-pointer"
                            title="Edit Caption / Format / Schedule"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePost(p.id)}
                            disabled={deletingId === p.id}
                            className="p-1.5 rounded-xl text-red-600/70 hover:text-red-700 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
                            title="Delete Post"
                          >
                            {deletingId === p.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>

                          <a
                            href={`/review/${p.token}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl text-[#4c1315]/70 hover:text-[#4c1315] hover:bg-[#4c1315]/10 transition"
                            title="Preview Influencer View"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </div>
        )}
      </main>

      {/* EDIT POST MODAL */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-[#4c1315]/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#4c1315]/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#4c1315] text-[#fbf7ee]">
                  <Edit3 className="w-4 h-4 text-[#ad9b58]" />
                </div>
                <div>
                  <h3 className="font-serif-display font-bold text-base text-[#4c1315]">
                    Edit Post Details
                  </h3>
                  <p className="text-[11px] text-[#4c1315]/60">
                    Update broadcast caption, format, or scheduled release time
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="text-[#4c1315]/50 hover:text-[#4c1315] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1.5">
                  Broadcast Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['instagram_reel', 'instagram_post', 'linkedin'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setEditPlatform(fmt)}
                      className={`py-2 px-2 rounded-xl text-xs font-serif-display font-bold border transition capitalize cursor-pointer ${
                        editPlatform === fmt
                          ? 'bg-[#4c1315] text-[#fbf7ee] border-[#ad9b58]'
                          : 'bg-[#fbf7ee] border-[#4c1315]/15 text-[#4c1315]/80'
                      }`}
                    >
                      {fmt.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1.5">
                  Scheduled Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={editScheduledAt}
                  onChange={(e) => setEditScheduledAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs font-medium text-[#280c0d] focus:outline-none focus:border-[#ad9b58]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1.5">
                  Caption & Copy
                </label>
                <textarea
                  rows={5}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Caption copy..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs text-[#280c0d] focus:outline-none focus:border-[#ad9b58] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ad9b58]"></span>
                  Note to Romany (Shows on Review Portal)
                </label>
                <textarea
                  rows={3}
                  value={editEditorNotes}
                  onChange={(e) => setEditEditorNotes(e.target.value)}
                  placeholder="Add or edit instructions, pose explanations, or notes for Romany..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs text-[#280c0d] focus:outline-none focus:border-[#ad9b58] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#4c1315]/10">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4c1315]/70 hover:text-[#4c1315] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPost}
                  className="px-5 py-2.5 rounded-xl font-serif-display font-bold text-xs bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] shadow-sm flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingPost ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ad9b58]" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-[#ad9b58]" />
                      <span>Save Post</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN & PASSCODE SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-[#4c1315]/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#4c1315]/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#4c1315] text-[#fbf7ee]">
                  <Shield className="w-4 h-4 text-[#ad9b58]" />
                </div>
                <div>
                  <h3 className="font-serif-display font-bold text-base text-[#4c1315]">
                    Admin & Security Settings
                  </h3>
                  <p className="text-[11px] text-[#4c1315]/60">
                    Update portal credentials & notification email
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-[#4c1315]/50 hover:text-[#4c1315] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {settingsMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold border ${
                  settingsMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {settingsMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1">
                  Editor Desk Passcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editorPasscodeSetting}
                    onChange={(e) => setEditorPasscodeSetting(e.target.value)}
                    placeholder="e.g. Akshay@987"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs text-[#280c0d] font-mono focus:outline-none focus:border-[#ad9b58]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#ad9b58] absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-[#4c1315]/60 mt-1">
                  Passcode used to unlock this Editorial / Creator Desk
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1">
                  Client Portal Passcode (/portal)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={portalPasscodeSetting}
                    onChange={(e) => setPortalPasscodeSetting(e.target.value)}
                    placeholder="e.g. FINANCE2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs text-[#280c0d] font-mono focus:outline-none focus:border-[#ad9b58]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#ad9b58] absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-[#4c1315]/60 mt-1">
                  Passcode given to the client to review, approve & view reports
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c1315]/80 mb-1">
                  Editor Notification Email
                </label>
                <input
                  type="email"
                  value={notificationEmailSetting}
                  onChange={(e) => setNotificationEmailSetting(e.target.value)}
                  placeholder="e.g. needingadvice01@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs text-[#280c0d] focus:outline-none focus:border-[#ad9b58]"
                />
                <p className="text-[10px] text-[#4c1315]/60 mt-1">
                  Receives instant alerts whenever client approves, rejects, or asks for edits
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#4c1315]/10">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4c1315]/70 hover:text-[#4c1315] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-5 py-2.5 rounded-xl font-serif-display font-bold text-xs bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] shadow-sm flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ad9b58]" />
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-[#ad9b58]" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA ASSET & CAROUSEL SLIDES VIEWER MODAL */}
      {previewingMediaPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#fbf7ee] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border-2 border-[#4c1315]/20 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#4c1315]/15 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#4c1315] text-[#fbf7ee]">
                    {previewingMediaPost.creator_name}
                  </span>
                  <span className="text-xs font-serif-display font-bold text-[#4c1315]">
                    {previewingMediaPost.creator_handle || previewingMediaPost.platform.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-[#4c1315]/60 mt-0.5">
                  {previewingMediaPost.media_urls && previewingMediaPost.media_urls.length > 1
                    ? `Carousel Slide ${activeSlideIndex + 1} of ${previewingMediaPost.media_urls.length}`
                    : '1 Editorial Graphic / Video'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/review/${previewingMediaPost.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold font-serif-display bg-[#ad9b58]/20 text-[#4c1315] hover:bg-[#ad9b58]/30 border border-[#ad9b58]/40 transition flex items-center gap-1.5"
                >
                  <span>Open Client Review View</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#ad9b58]" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewingMediaPost(null)}
                  className="p-1.5 rounded-full text-[#4c1315]/60 hover:text-[#4c1315] hover:bg-[#4c1315]/10 text-lg font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Media Player / Slide Preview */}
              <div className="md:col-span-7 flex flex-col items-center justify-center bg-neutral-900 rounded-2xl p-3 relative min-h-[380px] sm:min-h-[440px] overflow-hidden shadow-inner">
                {previewingMediaPost.media_type === 'video' ? (
                  <video
                    src={previewingMediaPost.media_url}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
                  />
                ) : (
                  <div className="relative flex items-center justify-center w-full h-full">
                    <img
                      src={
                        previewingMediaPost.media_urls && previewingMediaPost.media_urls.length > 0
                          ? previewingMediaPost.media_urls[activeSlideIndex] || previewingMediaPost.media_url
                          : previewingMediaPost.media_url
                      }
                      alt="Active Slide"
                      className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
                    />

                    {/* Prev / Next controls for carousel */}
                    {previewingMediaPost.media_urls && previewingMediaPost.media_urls.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                          disabled={activeSlideIndex === 0}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white disabled:opacity-30 transition cursor-pointer shadow-lg"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSlideIndex(prev => Math.min(previewingMediaPost.media_urls!.length - 1, prev + 1))}
                          disabled={activeSlideIndex === previewingMediaPost.media_urls.length - 1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white disabled:opacity-30 transition cursor-pointer shadow-lg"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Bottom Slide Thumbnails Strip */}
                {previewingMediaPost.media_urls && previewingMediaPost.media_urls.length > 1 && (
                  <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full py-1 px-2 bg-black/40 rounded-xl">
                    {previewingMediaPost.media_urls.map((slide, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition flex-shrink-0 cursor-pointer ${
                          activeSlideIndex === idx ? 'border-[#ad9b58] ring-2 ring-[#ad9b58]/50' : 'border-white/30 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={slide} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Feedback, Notes & Caption */}
              <div className="md:col-span-5 space-y-4">
                {previewingMediaPost.feedback && (
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-xs text-amber-950 space-y-2 shadow-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 border-b border-amber-200 pb-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Client Instructions &amp; Feedback</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed font-medium">
                      {previewingMediaPost.feedback}
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white border border-[#4c1315]/15 space-y-2 shadow-xs">
                  <span className="text-[10px] font-bold text-[#4c1315]/70 uppercase tracking-wider block">
                    Post Caption &amp; Copy
                  </span>
                  <p className="text-xs text-[#280c0d] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {previewingMediaPost.caption || 'No caption entered yet.'}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const post = previewingMediaPost;
                      setPreviewingMediaPost(null);
                      handleStartEdit(post);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold font-serif-display bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#ad9b58]" />
                    <span>Edit Post &amp; Caption</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}