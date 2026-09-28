'use client';

import React, { useState } from 'react';
import { Post } from '@/types/post';
import { ThumbsUp, MessageSquare, Repeat2, Send, Globe, MoreHorizontal, Volume2, VolumeX } from 'lucide-react';

interface Props {
  post: Post;
}

export function LinkedInPreview({ post }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const caption = post.caption || '';
  const isLongCaption = caption.length > 140;

  return (
    <div className="w-full max-w-[520px] mx-auto bg-white dark:bg-[#1B1F23] rounded-xl overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-800 select-none text-left font-sans">
      {/* Post Header */}
      <div className="p-4 pb-3 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.creator_name)}`}
              alt={post.creator_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer">
                {post.creator_name}
              </span>
              <span className="text-xs text-neutral-500">• 1st</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-tight truncate max-w-[260px]">
              {post.creator_handle ? `@${post.creator_handle}` : 'Creator & Digital Strategist'}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5">
              <span>{post.scheduled_at ? `Scheduled` : `1d`}</span>
              <span>•</span>
              <Globe className="w-3 h-3 text-neutral-400 inline" />
            </div>
          </div>
        </div>
        <button type="button" className="text-neutral-500 hover:text-neutral-700 p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Caption Text with "see more" toggle */}
      {caption && (
        <div className="px-4 pb-3 text-sm text-neutral-900 dark:text-neutral-200 whitespace-pre-line leading-relaxed">
          <span>{isExpanded || !isLongCaption ? caption : caption.slice(0, 140) + '...'}</span>
          {isLongCaption && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neutral-500 dark:text-neutral-400 font-semibold hover:text-[#0A66C2] ml-1.5 focus:outline-none"
            >
              {isExpanded ? 'see less' : 'see more'}
            </button>
          )}
        </div>
      )}

      {/* Media Attachment */}
      <div className="relative w-full aspect-video bg-neutral-900 flex items-center justify-center overflow-hidden">
        {post.media_type === 'video' ? (
          <div className="relative w-full h-full">
            <video
              src={post.media_url}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              aria-label="Toggle mute"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <img
            src={post.media_url}
            alt="Post preview"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Social Reaction Counts */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#0A66C2] flex items-center justify-center text-[9px] text-white">👍</span>
            <span className="w-4 h-4 rounded-full bg-[#D9381E] flex items-center justify-center text-[9px] text-white">❤️</span>
            <span className="w-4 h-4 rounded-full bg-[#6DAE2C] flex items-center justify-center text-[9px] text-white">💡</span>
          </span>
          <span>{isLiked ? '129' : '128'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>24 comments</span>
          <span>•</span>
          <span>5 reposts</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-2 py-1 flex items-center justify-around text-neutral-600 dark:text-neutral-400 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setIsLiked(!isLiked)}
          className={`flex items-center gap-1.5 py-2 px-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition ${
            isLiked ? 'text-[#0A66C2]' : ''
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#0A66C2]' : ''}`} />
          <span>Like</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 py-2 px-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 py-2 px-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <Repeat2 className="w-4 h-4" />
          <span>Repost</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 py-2 px-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
