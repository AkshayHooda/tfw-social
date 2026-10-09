'use client';

import React, { useState } from 'react';
import { ContentIdea } from '@/types/post';
import { getEffectiveIdeaStage } from '@/components/portal/IdeasStudio';
import { 
  Lightbulb, 
  Video, 
  FileVideo, 
  ExternalLink, 
  Link as LinkIcon, 
  Check, 
  ArrowRight, 
  Trash2, 
  Clock, 
  Flame, 
  Sparkles,
  RefreshCw,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ClientIdeasBacklogProps {
  ideas: ContentIdea[];
  selectedBrand: 'all' | 'The Finance Woman' | 'In Business Together';
  onConvertToDraft: (idea: ContentIdea) => void;
  onUpdateIdeaStatus: (id: string, updates: Partial<ContentIdea>) => Promise<void>;
  onDeleteIdea: (id: string) => Promise<void>;
}

export function ClientIdeasBacklog({
  ideas,
  selectedBrand,
  onConvertToDraft,
  onUpdateIdeaStatus,
  onDeleteIdea,
}: ClientIdeasBacklogProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterBrand, setFilterBrand] = useState<'all' | 'The Finance Woman' | 'In Business Together'>(selectedBrand);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [savedFeedbackId, setSavedFeedbackId] = useState<string | null>(null);

  const filteredIdeas = ideas.filter(i => {
    if (filterBrand !== 'all') {
      const name = (i.creator_name || '').toLowerCase();
      if (filterBrand === 'The Finance Woman' && !name.includes('finance')) return false;
      if (filterBrand === 'In Business Together' && !name.includes('business')) return false;
    }
    if (filterStage !== 'all') {
      if (getEffectiveIdeaStage(i) !== filterStage) return false;
    }
    return true;
  });

  const handleStageChange = async (idea: ContentIdea, newStage: string) => {
    try {
      setUpdatingId(idea.id);
      await onUpdateIdeaStatus(idea.id, { 
        stage: newStage as any, 
        status: newStage === 'review' || newStage === 'approved' ? 'drafted' : 'in_production' 
      });
      setSavedFeedbackId(idea.id);
      setTimeout(() => setSavedFeedbackId(null), 2500);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4c1315]/15 shadow-sm space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4c1315]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/30">
              Client Intake Backlog
            </span>
            <span className="text-xs text-[#4c1315]/70 font-semibold">
              Live ideas, script hooks &amp; raw video footage submitted from /portal
            </span>
          </div>
          <h3 className="text-xl font-serif-display font-bold text-[#4c1315]">
            Client Ideas &amp; Raw Footage Studio ({filteredIdeas.length})
          </h3>
        </div>

        {/* Brand Filter */}
        <div className="flex items-center p-1 bg-[#fbf7ee] rounded-xl border border-[#4c1315]/15 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterBrand('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterBrand === 'all' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/70'
            }`}
          >
            All Brands ({ideas.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterBrand('The Finance Woman')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterBrand === 'The Finance Woman' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'text-[#4c1315]/70'
            }`}
          >
            TFW ({ideas.filter(i => (i.creator_name || '').toLowerCase().includes('finance')).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterBrand('In Business Together')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterBrand === 'In Business Together' ? 'bg-[#A8442A] text-white' : 'text-[#4c1315]/70'
            }`}
          >
            IBT ({ideas.filter(i => (i.creator_name || '').toLowerCase().includes('business')).length})
          </button>
        </div>
      </div>

      {/* FILTER STAGE PILLS */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setFilterStage('all')}
          className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
            filterStage === 'all' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'bg-[#fbf7ee] text-[#4c1315]/70 border border-[#4c1315]/15'
          }`}
        >
          All Stages
        </button>
        <button
          type="button"
          onClick={() => setFilterStage('idea')}
          className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
            filterStage === 'idea' ? 'bg-[#4c1315] text-[#fbf7ee]' : 'bg-[#fbf7ee] text-[#4c1315]/70 border border-[#4c1315]/15'
          }`}
        >
          💡 Concept Only
        </button>
        <button
          type="button"
          onClick={() => setFilterStage('editing')}
          className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
            filterStage === 'editing' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 border border-purple-200'
          }`}
        >
          ✂️ In Editing
        </button>
      </div>

      {/* CARDS LIST */}
      {filteredIdeas.length === 0 ? (
        <div className="py-12 text-center text-[#4c1315]/60 text-xs font-serif-display space-y-2">
          <Lightbulb className="w-8 h-8 text-[#ad9b58]/40 mx-auto" />
          <p>No client ideas or footage in this view.</p>
          <p className="text-[11px] text-[#4c1315]/50">
            Clients can submit concepts directly from the Executive Portal at /portal!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => {
            const isIBT = (idea.creator_name || '').toLowerCase().includes('business');
            const stage = idea.stage || 'idea';

            return (
              <div
                key={idea.id}
                className="p-5 rounded-2xl bg-[#fbf7ee] border border-[#4c1315]/15 hover:border-[#ad9b58] transition space-y-3 relative"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                      isIBT ? 'bg-[#A8442A] text-white' : 'bg-[#4c1315] text-[#fbf7ee]'
                    }`}>
                      {idea.creator_name}
                    </span>

                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ad9b58]/20 text-[#4c1315]">
                      {idea.category || 'Reel'}
                    </span>

                    {idea.priority === 'urgent' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-600" /> Urgent
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#4c1315]/60 font-mono">
                      {new Date(idea.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <button
                      type="button"
                      onClick={() => onDeleteIdea(idea.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition"
                      title="Delete idea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Concept Title & Notes */}
                <div>
                  <h4 className="font-serif-display font-bold text-base text-[#4c1315]">
                    {idea.title}
                  </h4>
                  {idea.notes && (
                    <p className="text-xs text-[#280c0d]/85 mt-1.5 leading-relaxed whitespace-pre-wrap font-serif-display">
                      {idea.notes}
                    </p>
                  )}
                </div>

                {/* Raw Video Footage Box */}
                {idea.raw_video_url && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileVideo className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-900 block truncate">
                          {idea.raw_video_name || 'Client Raw Recording (.mp4/.mov)'}
                        </span>
                        <span className="text-[10px] text-emerald-700/80">
                          Filmed on phone/camera • Ready for editing &amp; captions
                        </span>
                      </div>
                    </div>

                    <a
                      href={idea.raw_video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg transition self-end sm:self-auto flex-shrink-0"
                    >
                      <span>Download / Stream Footage</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Reference Links */}
                {idea.links && idea.links.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#4c1315]/60">
                      Inspiration / Research Links:
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
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reference Images */}
                {idea.images && idea.images.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#4c1315]/60">
                      Attached Assets:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {idea.images.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg overflow-hidden border border-[#4c1315]/20 block hover:scale-105 transition">
                          <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Action Row: Stage Dropdown + Convert to Draft */}
                <div className="pt-3 border-t border-[#4c1315]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#4c1315]/70 font-bold">Lifecycle Stage:</span>
                    <select
                      value={stage}
                      onChange={(e) => handleStageChange(idea, e.target.value)}
                      disabled={updatingId === idea.id}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#4c1315]/20 text-xs font-semibold text-[#4c1315]"
                    >
                      <option value="idea">💡 Idea Logged</option>
                      <option value="editing">✂️ In Editing</option>
                      <option value="review">👀 Queued for Review</option>
                      <option value="approved">✅ Approved</option>
                      <option value="scheduled">📅 Scheduled</option>
                      <option value="posted">🚀 Posted Live</option>
                    </select>

                    {updatingId === idea.id && (
                      <span className="text-[10px] text-[#ad9b58] font-bold animate-pulse">Saving...</span>
                    )}

                    {savedFeedbackId === idea.id && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold animate-in fade-in">
                        Saved ✓
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onConvertToDraft(idea)}
                    className="px-4 py-2 rounded-xl text-xs font-bold font-serif-display bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] shadow-2xs transition flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#ad9b58]" />
                    <span>Turn Concept into Production Draft →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
