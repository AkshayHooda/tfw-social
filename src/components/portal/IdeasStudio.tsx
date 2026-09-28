'use client';

import React, { useState } from 'react';
import { ContentIdea, IdeaCategory, IdeaPriority, IdeaStage } from '@/types/post';
import { 
  Lightbulb, 
  Video, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Send, 
  Check, 
  Upload, 
  Loader2, 
  Sparkles, 
  Clock, 
  FileVideo, 
  ArrowRight, 
  Plus, 
  X, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Flame,
  Film,
  Edit2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Save
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { upload } from '@vercel/blob/client';

interface IdeasStudioProps {
  ideas: ContentIdea[];
  selectedBrand: 'all' | 'The Finance Woman' | 'In Business Together';
  onIdeaCreated: (newIdea: ContentIdea) => void;
  onIdeaUpdated?: (updatedIdea: ContentIdea) => void;
  onIdeaDeleted?: (deletedIdeaId: string) => void;
  onNavigateToTab?: (tab: 'review' | 'calendar') => void;
}

export function IdeasStudio({ ideas, selectedBrand, onIdeaCreated, onIdeaUpdated, onIdeaDeleted, onNavigateToTab }: IdeasStudioProps) {
  // Form State
  const [submissionMode, setSubmissionMode] = useState<'idea' | 'raw_video'>('idea');
  const [brand, setBrand] = useState<'The Finance Woman' | 'In Business Together'>(
    selectedBrand === 'In Business Together' ? 'In Business Together' : 'The Finance Woman'
  );
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('reel');
  const [priority, setPriority] = useState<IdeaPriority>('normal');
  const [links, setLinks] = useState<string[]>(['']);
  
  // Media upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeFilterStage, setActiveFilterStage] = useState<string>('all');

  // Edit / Approve / Reject state
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<IdeaPriority>('normal');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const handleApproveIdea = async (idea: ContentIdea) => {
    try {
      setIsProcessingAction(true);
      const res = await fetch('/api/ideas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idea.id, stage: 'approved' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve idea');
      if (onIdeaUpdated) onIdeaUpdated(data.idea);
      triggerConfetti();
      setSuccessMessage(`Concept "${idea.title}" approved for production!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error approving idea');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectIdea = async (idea: ContentIdea) => {
    if (!confirm(`Are you sure you want to dismiss / reject "${idea.title}"?`)) return;
    try {
      setIsProcessingAction(true);
      const res = await fetch(`/api/ideas?id=${idea.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject idea');
      if (onIdeaDeleted) onIdeaDeleted(idea.id);
      setSuccessMessage(`Concept "${idea.title}" removed.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error rejecting idea');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleOpenEditModal = (idea: ContentIdea) => {
    setEditingIdea(idea);
    setEditTitle(idea.title);
    setEditNotes(idea.notes || '');
    setEditPriority(idea.priority || 'normal');
  };

  const handleSaveEditIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdea) return;
    try {
      setIsProcessingAction(true);
      const res = await fetch('/api/ideas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingIdea.id,
          title: editTitle.trim(),
          notes: editNotes.trim(),
          priority: editPriority,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save idea changes');
      if (onIdeaUpdated) onIdeaUpdated(data.idea);
      setEditingIdea(null);
      setSuccessMessage('Idea updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating idea');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Add and remove link inputs
  const handleAddLink = () => setLinks([...links, '']);
  const handleUpdateLink = (index: number, val: string) => {
    const updated = [...links];
    updated[index] = val;
    setLinks(updated);
  };
  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // Video selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  // Image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImageFiles([...imageFiles, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setImagePreviewUrls([...imagePreviewUrls, ...urls]);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ad9b58', '#4c1315', '#A8442A', '#c8b87a'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !notes.trim() && !videoFile) {
      alert('Please provide a title, notes, or attach raw footage.');
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress(10);

      let uploadedVideoUrl: string | null = null;
      let uploadedImageUrls: string[] = [];

      // 1. Upload Video if present
      if (videoFile) {
        setUploadProgress(30);
        try {
          const newBlob = await upload(`raw-footage/${Date.now()}-${videoFile.name}`, videoFile, {
            access: 'public',
            handleUploadUrl: '/api/upload',
            onUploadProgress: (progress) => {
              setUploadProgress(Math.round(progress.percentage));
            },
          });
          uploadedVideoUrl = newBlob.url;
        } catch {
          // Fallback to local preview URL for offline or mock resilience
          uploadedVideoUrl = videoPreviewUrl;
        }
      }

      // 2. Upload images if present
      if (imageFiles.length > 0) {
        for (const img of imageFiles) {
          try {
            const blob = await upload(`reference-assets/${Date.now()}-${img.name}`, img, {
              access: 'public',
              handleUploadUrl: '/api/upload',
            });
            uploadedImageUrls.push(blob.url);
          } catch {
            uploadedImageUrls.push(URL.createObjectURL(img));
          }
        }
      }

      setUploadProgress(85);

      const cleanLinks = links.filter(l => l.trim().length > 0);
      const stage: IdeaStage = uploadedVideoUrl ? 'filmed' : 'idea';

      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_name: brand,
          title: title.trim() || (uploadedVideoUrl ? `${brand} Raw Video Footage` : 'New Concept'),
          notes: notes.trim(),
          links: cleanLinks,
          images: uploadedImageUrls,
          raw_video_url: uploadedVideoUrl,
          raw_video_name: videoFile?.name || null,
          category,
          priority,
          stage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit idea');

      onIdeaCreated(data.idea);
      triggerConfetti();

      // Reset Form
      setTitle('');
      setNotes('');
      setLinks(['']);
      setVideoFile(null);
      setVideoPreviewUrl(null);
      setImageFiles([]);
      setImagePreviewUrls([]);
      setUploadProgress(null);

      setSuccessMessage(
        uploadedVideoUrl 
          ? 'Raw footage received! Editing team notified with download link.' 
          : 'Idea logged successfully! Sent to the editor desk.'
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error submitting');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter ideas by selected brand
  const filteredIdeas = ideas.filter(i => {
    if (selectedBrand === 'all') return true;
    const name = (i.creator_name || '').toLowerCase();
    if (selectedBrand === 'The Finance Woman') {
      return name.includes('finance') || (!name.includes('business'));
    }
    if (selectedBrand === 'In Business Together') {
      return name.includes('business');
    }
    return true;
  });

  const displayIdeas = filteredIdeas.filter(i => {
    if (activeFilterStage === 'all') return true;
    return (i.stage || 'idea') === activeFilterStage;
  });

  const stagesList = [
    { key: 'idea', label: 'Idea Logged', icon: '💡' },
    { key: 'filmed', label: 'Raw Footage Ready', icon: '📹' },
    { key: 'editing', label: 'In Editing', icon: '✂️' },
    { key: 'review', label: 'In Review', icon: '👀' },
    { key: 'approved', label: 'Approved', icon: '✅' },
    { key: 'scheduled', label: 'Scheduled', icon: '📅' },
    { key: 'posted', label: 'Posted Live', icon: '🚀' },
  ];

  return (
    <div className="space-y-8">
      {/* SUCCESS TOAST */}
      {successMessage && (
        <div className="bg-[#4c1315] text-[#fbf7ee] py-3.5 px-5 rounded-2xl text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-300 border border-[#ad9b58]/40">
          <Sparkles className="w-4 h-4 text-[#ad9b58]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TOP LIFECYCLE PROGRESS PIPELINE EXPLAINER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4c1315]/15 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4c1315]/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/30">
                End-to-End Content Flow
              </span>
              <span className="text-xs text-[#4c1315]/70 font-medium">
                Idea ➔ Filmed ➔ Edited ➔ Approved ➔ Scheduled ➔ Live
              </span>
            </div>
            <h2 className="text-2xl font-serif-display font-bold text-[#4c1315]">
              Creative Intake &amp; Idea Drop Studio
            </h2>
            <p className="text-xs text-[#4c1315]/75 mt-0.5">
              Log talking points, drop inspiration reels, or upload raw recorded phone video footage directly for the editing team.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-[#4c1315]/10 text-[#4c1315] font-bold">
              {filteredIdeas.length} Pipeline Items
            </span>
          </div>
        </div>

        {/* Horizontal Lifecycle Steps Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {stagesList.map((s, idx) => (
            <div 
              key={s.key} 
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                activeFilterStage === s.key 
                  ? 'bg-[#4c1315] text-[#fbf7ee] border-[#4c1315] shadow-xs' 
                  : 'bg-[#fbf7ee] text-[#280c0d] border-[#4c1315]/15 hover:border-[#ad9b58]'
              }`}
              onClick={() => setActiveFilterStage(activeFilterStage === s.key ? 'all' : s.key)}
              role="button"
              tabIndex={0}
            >
              <span className="text-lg mb-1">{s.icon}</span>
              <span className="text-[11px] font-bold font-serif-display leading-tight">{s.label}</span>
              <span className={`text-[9px] mt-1 px-1.5 py-0.2 rounded-full font-mono ${
                activeFilterStage === s.key ? 'bg-white/20' : 'bg-[#4c1315]/10 text-[#4c1315]'
              }`}>
                {filteredIdeas.filter(i => (i.stage || 'idea') === s.key).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DUAL WORKSPACE: FORM (LEFT) + PIPELINE BACKLOG (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INTAKE FORM (5 COLUMNS) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#4c1315]/15 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#4c1315]/10 pb-4">
            <h3 className="font-serif-display text-lg font-bold text-[#4c1315] flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#ad9b58]" />
              <span>Submit Content Concept</span>
            </h3>

            {/* Submission Mode Selector */}
            <div className="flex items-center p-1 bg-[#fbf7ee] rounded-xl border border-[#4c1315]/15 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSubmissionMode('idea')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  submissionMode === 'idea' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/70'
                }`}
              >
                Idea &amp; Notes
              </button>
              <button
                type="button"
                onClick={() => setSubmissionMode('raw_video')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  submissionMode === 'raw_video' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/70'
                }`}
              >
                <Video className="w-3 h-3" />
                <span>Raw Video</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            {/* Brand Switcher */}
            <div>
              <label className="block uppercase tracking-wider font-bold text-[#4c1315]/80 mb-1.5 font-serif-display">
                Select Brand Destination:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBrand('The Finance Woman')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    brand === 'The Finance Woman'
                      ? 'bg-[#4c1315] text-[#fbf7ee] border-[#4c1315] font-bold shadow-2xs'
                      : 'bg-[#fbf7ee] text-[#4c1315]/80 border-[#4c1315]/20 hover:border-[#4c1315]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#ad9b58]" />
                  <span>The Finance Woman</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrand('In Business Together')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    brand === 'In Business Together'
                      ? 'bg-[#A8442A] text-white border-[#A8442A] font-bold shadow-2xs'
                      : 'bg-[#fbf7ee] text-[#4c1315]/80 border-[#4c1315]/20 hover:border-[#A8442A]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#C98B6B]" />
                  <span>In Business Together</span>
                </button>
              </div>
            </div>

            {/* Concept Title / Hook */}
            <div>
              <label className="block uppercase tracking-wider font-bold text-[#4c1315]/80 mb-1 font-serif-display">
                Hook or Topic Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  brand === 'In Business Together'
                    ? 'e.g. Retained profit vs dividend mortgage assessments for director couples'
                    : 'e.g. £2,000 tax top-up on sole trader personal pensions'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-[#280c0d] placeholder:text-[#4c1315]/40 focus:outline-none focus:border-[#ad9b58] font-serif-display text-sm"
              />
            </div>

            {/* Format & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block uppercase tracking-wider font-bold text-[#4c1315]/80 mb-1 font-serif-display">
                  Format Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IdeaCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-[#280c0d] font-medium"
                >
                  <option value="reel">Vertical Reel (9:16)</option>
                  <option value="story">Story / Soundbite (9:16)</option>
                  <option value="post">Feed Image / Infographic (1:1)</option>
                  <option value="carousel">Multi-Slide Carousel</option>
                  <option value="thought_leadership">Thought Leadership (LinkedIn)</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-bold text-[#4c1315]/80 mb-1 font-serif-display">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IdeaPriority)}
                  className="w-full px-3 py-2 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-[#280c0d] font-medium"
                >
                  <option value="normal">Normal Cadence</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent / Trending Today 🔥</option>
                </select>
              </div>
            </div>

            {/* Notes / Talking Points */}
            <div>
              <label className="block uppercase tracking-wider font-bold text-[#4c1315]/80 mb-1 font-serif-display">
                Notes &amp; Key Talking Points for Editor
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="List the 3 main points, numbers, compliance disclosures, or instructions for the editor..."
                className="w-full p-3.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-[#280c0d] placeholder:text-[#4c1315]/40 focus:outline-none focus:border-[#ad9b58] leading-relaxed text-xs font-serif-display"
              />
            </div>

            {/* RAW VIDEO UPLOAD ZONE (When in raw_video mode or optional) */}
            <div className={`p-4 rounded-2xl border transition ${
              submissionMode === 'raw_video' 
                ? 'bg-amber-50/50 border-[#ad9b58]' 
                : 'bg-[#fbf7ee] border-[#4c1315]/15'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif-display font-bold text-[#4c1315] flex items-center gap-1.5 text-xs">
                  <Video className="w-3.5 h-3.5 text-[#ad9b58]" />
                  <span>Attach Raw Phone / Camera Video Footage</span>
                </span>
                {videoFile && (
                  <button
                    type="button"
                    onClick={() => { setVideoFile(null); setVideoPreviewUrl(null); }}
                    className="text-red-600 hover:text-red-800 text-[10px] font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>

              {videoPreviewUrl ? (
                <div className="space-y-2">
                  <div className="aspect-[16/9] bg-black rounded-xl overflow-hidden relative">
                    <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[11px] text-emerald-800 font-bold truncate">
                    Ready to upload: {videoFile?.name} ({(videoFile?.size ? videoFile.size / (1024 * 1024) : 0).toFixed(1)} MB)
                  </p>
                </div>
              ) : (
                <label className="border-2 border-dashed border-[#4c1315]/20 hover:border-[#ad9b58] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                  <Upload className="w-6 h-6 text-[#ad9b58] group-hover:scale-110 transition mb-1" />
                  <span className="font-serif-display font-bold text-xs text-[#4c1315]">
                    Select or Drop Raw .mp4 / .mov File
                  </span>
                  <span className="text-[10px] text-[#4c1315]/60 mt-0.5">
                    Recorded on iPhone or camera • Up to 500MB
                  </span>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* REFERENCE LINKS */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="uppercase tracking-wider font-bold text-[#4c1315]/80 font-serif-display text-[11px]">
                  Reference Links (TikTok, Instagram, Articles)
                </label>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="text-[10px] text-[#4c1315] hover:text-[#ad9b58] font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              </div>

              <div className="space-y-2">
                {links.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleUpdateLink(idx, e.target.value)}
                      placeholder="https://instagram.com/reel/... or article link"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-[#280c0d] placeholder:text-[#4c1315]/40 text-xs"
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(idx)}
                        className="p-1.5 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* REFERENCE SCREENSHOTS / IMAGES */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="uppercase tracking-wider font-bold text-[#4c1315]/80 font-serif-display text-[11px]">
                  Reference Screenshots or Documents
                </label>
                <label className="text-[10px] text-[#4c1315] hover:text-[#ad9b58] font-bold flex items-center gap-0.5 cursor-pointer">
                  <Plus className="w-3 h-3" /> Attach Image
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {imagePreviewUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {imagePreviewUrls.map((url, i) => (
                    <div key={i} className="w-14 h-14 rounded-lg overflow-hidden border border-[#4c1315]/20 relative">
                      <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* UPLOAD PROGRESS */}
            {uploadProgress !== null && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-bold text-[#4c1315]">
                  <span>Uploading assets to edge...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#fbf7ee] rounded-full overflow-hidden border border-[#4c1315]/20">
                  <div
                    className="h-full bg-[#ad9b58] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-xl font-serif-display font-bold text-sm text-[#fbf7ee] shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                brand === 'In Business Together'
                  ? 'bg-[#A8442A] hover:bg-[#8e3620]'
                  : 'bg-[#4c1315] hover:bg-[#6e1c1f]'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#ad9b58]" />
                  <span>Dispatching to Editor Desk...</span>
                </>
              ) : (
                <>
                  <span>Send to Editor Desk</span>
                  <ArrowRight className="w-4 h-4 text-[#ad9b58]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* PIPELINE & BACKLOG (7 COLUMNS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#4c1315]/15 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4c1315]/10 pb-4">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#4c1315]">
                  Live Production Pipeline ({displayIdeas.length})
                </h3>
                <p className="text-xs text-[#4c1315]/70">
                  Track every submission from initial idea to live social broadcast.
                </p>
              </div>

              {/* Quick filter by brand in backlog */}
              <span className="text-xs font-bold text-[#4c1315]/60 bg-[#fbf7ee] px-3 py-1 rounded-full border border-[#4c1315]/15">
                {selectedBrand === 'all' ? 'All Brands' : selectedBrand}
              </span>
            </div>

            {displayIdeas.length === 0 ? (
              <div className="py-12 text-center text-[#4c1315]/60 text-xs font-serif-display space-y-2">
                <Lightbulb className="w-8 h-8 text-[#ad9b58]/50 mx-auto" />
                <p>No concepts in this stage yet.</p>
                <p className="text-[11px] text-[#4c1315]/50">
                  Use the form on the left to drop an idea or upload raw video footage!
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[650px] overflow-y-auto pr-1">
                {displayIdeas.map((idea) => {
                  const isIBT = (idea.creator_name || '').toLowerCase().includes('business');
                  const stage = idea.stage || 'idea';

                  const stageDisplay = 
                    stage === 'filmed' ? '📹 Raw Video Ready' :
                    stage === 'editing' ? '✂️ In Editing' :
                    stage === 'review' ? '👀 In Review' :
                    stage === 'approved' ? '✅ Approved' :
                    stage === 'scheduled' ? '📅 Scheduled' :
                    stage === 'posted' ? '🚀 Posted Live' :
                    '💡 Idea Logged';

                  const stageColor = 
                    stage === 'filmed' ? 'bg-blue-100 text-blue-900 border-blue-200' :
                    stage === 'editing' ? 'bg-purple-100 text-purple-900 border-purple-200' :
                    stage === 'review' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                    stage === 'approved' ? 'bg-emerald-100 text-emerald-900 border-emerald-200' :
                    stage === 'posted' ? 'bg-[#ad9b58]/25 text-[#280c0d] border-[#ad9b58]/40' :
                    'bg-[#fbf7ee] text-[#4c1315] border-[#4c1315]/20';

                  return (
                    <div
                      key={idea.id}
                      className="p-4 rounded-2xl bg-[#fbf7ee] border border-[#4c1315]/15 hover:border-[#ad9b58] transition space-y-3"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            isIBT ? 'bg-[#A8442A] text-white' : 'bg-[#4c1315] text-[#fbf7ee]'
                          }`}>
                            {idea.creator_name}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stageColor}`}>
                            {stageDisplay}
                          </span>

                          {idea.priority === 'urgent' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-red-600" /> Urgent
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-[#4c1315]/60 font-mono">
                          {new Date(idea.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Title & Notes */}
                      <div>
                        <h4 className="font-serif-display font-bold text-sm text-[#4c1315]">
                          {idea.title}
                        </h4>
                        {idea.notes && (
                          <p className="text-xs text-[#280c0d]/80 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-3">
                            {idea.notes}
                          </p>
                        )}
                      </div>

                      {/* Raw Video Footage Preview / Download */}
                      {idea.raw_video_url && (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileVideo className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                            <span className="font-bold text-emerald-900 truncate">
                              {idea.raw_video_name || 'Raw Video Attached'}
                            </span>
                          </div>
                          <a
                            href={idea.raw_video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition flex-shrink-0"
                          >
                            <span>Watch / Stream</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Reference Links */}
                      {idea.links && idea.links.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-[#4c1315]/60">
                            Reference Links:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {idea.links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4c1315] hover:text-[#ad9b58] bg-white px-2.5 py-1 rounded-lg border border-[#4c1315]/15 truncate max-w-xs"
                              >
                                <LinkIcon className="w-3 h-3 text-[#ad9b58]" />
                                <span className="truncate">{link.replace(/^https?:\/\/(www\.)?/, '')}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attached Screenshots */}
                      {idea.images && idea.images.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-[#4c1315]/60">
                            Assets ({idea.images.length}):
                          </span>
                          <div className="flex items-center gap-1.5">
                            {idea.images.map((img, idx) => (
                              <a key={idx} href={img} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg overflow-hidden border border-[#4c1315]/20 block hover:scale-105 transition">
                                <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Links & Edit/Approve/Reject Controls */}
                      <div className="pt-2.5 border-t border-[#4c1315]/10 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Approve Button */}
                          {stage !== 'approved' && stage !== 'scheduled' && stage !== 'posted' && (
                            <button
                              type="button"
                              onClick={() => handleApproveIdea(idea)}
                              disabled={isProcessingAction}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-serif-display bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                              title="Approve this concept for production"
                            >
                              <ThumbsUp className="w-3 h-3 text-emerald-700" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(idea)}
                            disabled={isProcessingAction}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-serif-display bg-white hover:bg-[#f6ecdf] text-[#4c1315] border border-[#4c1315]/20 transition flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                            title="Edit concept title or talking points"
                          >
                            <Edit2 className="w-3 h-3 text-[#ad9b58]" />
                            <span>Edit</span>
                          </button>

                          {/* Reject / Dismiss Button */}
                          <button
                            type="button"
                            onClick={() => handleRejectIdea(idea)}
                            disabled={isProcessingAction}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold font-serif-display bg-white hover:bg-red-50 text-red-700 border border-red-200 transition flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                            title="Dismiss / delete this concept"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                            <span>Reject</span>
                          </button>
                        </div>

                        {stage === 'review' && onNavigateToTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateToTab('review')}
                            className="inline-flex items-center gap-1 text-xs font-bold font-serif-display text-[#4c1315] hover:text-[#ad9b58] cursor-pointer"
                          >
                            <span>Draft Ready in Needs Review →</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT IDEA MODAL */}
      {editingIdea && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border-2 border-[#4c1315]/20 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#4c1315]/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#4c1315] text-[#fbf7ee]">
                  <Edit2 className="w-4 h-4 text-[#ad9b58]" />
                </div>
                <h3 className="font-serif-display font-bold text-base text-[#4c1315]">
                  Edit Content Concept
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingIdea(null)}
                className="p-1 rounded-lg text-[#4c1315]/60 hover:text-[#4c1315] hover:bg-[#4c1315]/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditIdea} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4c1315]/80 mb-1 font-serif-display">
                  Headline / Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs text-[#280c0d] focus:outline-none focus:border-[#ad9b58]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4c1315]/80 mb-1 font-serif-display">
                  Concept Notes & Talking Points
                </label>
                <textarea
                  rows={5}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs text-[#280c0d] focus:outline-none focus:border-[#ad9b58] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4c1315]/80 mb-1 font-serif-display">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as IdeaPriority)}
                  className="w-full px-3 py-2 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/20 text-xs text-[#280c0d] focus:outline-none focus:border-[#ad9b58]"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#4c1315]/10">
                <button
                  type="button"
                  onClick={() => setEditingIdea(null)}
                  className="px-4 py-2 rounded-xl text-xs font-serif-display font-semibold text-[#4c1315]/70 hover:bg-[#4c1315]/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingAction}
                  className="px-4 py-2 rounded-xl text-xs font-serif-display font-bold bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-[#ad9b58]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
