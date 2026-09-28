'use client';

import React, { useState, useRef } from 'react';
import { Post } from '@/types/post';
import { 
  MoreHorizontal, 
  Volume2, 
  VolumeX, 
  Send, 
  Heart, 
  Play, 
  Pause,
  RotateCcw,
  RotateCw,
  RefreshCw
} from 'lucide-react';

interface Props {
  post: Post;
  cleanMode?: boolean;
}

export function InstagramStoryPreview({ post, cleanMode = false }: Props) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSecs, setCurrentSecs] = useState(0);
  const [durationSecs, setDurationSecs] = useState(0);
  const [seekBadge, setSeekBadge] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handle = post.creator_handle || 'thefinancewoman.co.uk';

  const formatSecs = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const showBadge = (text: string) => {
    setSeekBadge(text);
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = setTimeout(() => setSeekBadge(null), 900);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudio = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentSecs(cur);
    if (dur && !isNaN(dur)) {
      setDurationSecs(dur);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDurationSecs(videoRef.current.duration || 0);
  };

  const handleSkip = (deltaSecs: number, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const maxDur = videoRef.current.duration || 1000;
    const target = Math.max(0, Math.min(maxDur, videoRef.current.currentTime + deltaSecs));
    videoRef.current.currentTime = target;
    setCurrentSecs(target);
    showBadge(deltaSecs > 0 ? `+${deltaSecs}s` : `${deltaSecs}s`);
  };

  const handleSliderSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentSecs(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleRestart = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setCurrentSecs(0);
    videoRef.current.play();
    setIsPlaying(true);
    showBadge('Replay');
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftSide = clickX < rect.width / 2;

    if (now - lastTapRef.current.time < 350) {
      if (isLeftSide) {
        handleSkip(-5);
      } else {
        handleSkip(5);
      }
      lastTapRef.current = { time: 0, x: 0 };
    } else {
      lastTapRef.current = { time: now, x: clickX };
      setTimeout(() => {
        if (Date.now() - lastTapRef.current.time >= 350 && lastTapRef.current.time !== 0) {
          togglePlay();
          lastTapRef.current = { time: 0, x: 0 };
        }
      }, 350);
    }
  };

  return (
    <div className="w-full max-w-[360px] mx-auto flex flex-col items-center select-none text-left">
      <div className="relative w-full aspect-[9/16] bg-black rounded-[36px] overflow-hidden shadow-2xl border-[6px] border-neutral-900 flex flex-col justify-between">
        {/* Top Story Progress Bars & Header */}
        {!cleanMode ? (
          <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-3.5 bg-gradient-to-b from-black/75 to-transparent">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="h-0.5 flex-1 bg-white rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-200" 
                  style={{ width: `${durationSecs > 0 ? (currentSecs / durationSecs) * 100 : 65}%` }} 
                />
              </div>
              <div className="h-0.5 flex-1 bg-white/40 rounded-full" />
              <div className="h-0.5 flex-1 bg-white/40 rounded-full" />
            </div>

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-black p-[1px] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                      alt={post.creator_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-xs drop-shadow tracking-tight">{handle}</span>
                    <svg className="w-3 h-3 text-[#3897f0] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="text-[11px] text-white/70 font-normal ml-1">2h</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
                  aria-label="Toggle mute"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <MoreHorizontal className="w-5 h-5 text-white/90" />
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-3 flex items-center justify-between text-white bg-gradient-to-b from-black/60 to-transparent">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-black/60 text-[#ad9b58] border border-[#ad9b58]/40 backdrop-blur-sm">
              Story Unobstructed
            </span>
            <button
              type="button"
              onClick={toggleAudio}
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition"
              aria-label="Toggle mute"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Main Story Media */}
        <div 
          className="relative w-full h-full flex items-center justify-center bg-neutral-950 cursor-pointer" 
          onClick={handleVideoClick}
        >
          {post.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={post.media_url}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={post.media_url}
              alt="Instagram Story"
              className="w-full h-full object-cover"
            />
          )}

          {/* Seek Badge */}
          {seekBadge && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-75 duration-150">
              <div className="px-4 py-2 rounded-2xl bg-black/85 text-[#ad9b58] font-bold text-sm border border-[#ad9b58]/40 shadow-2xl backdrop-blur-md flex items-center gap-1.5">
                {seekBadge.includes('-') ? <RotateCcw className="w-4 h-4" /> : seekBadge.includes('+') ? <RotateCw className="w-4 h-4" /> : null}
                <span>{seekBadge}</span>
              </div>
            </div>
          )}

          {/* Play / Pause indicator overlay */}
          {!isPlaying && !seekBadge && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px] transition-all pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/70 flex items-center justify-center text-white pl-1 shadow-2xl border border-white/20">
                <Play className="w-8 h-8 fill-white" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Story Interaction Bar */}
        {!cleanMode && (
          <div className="absolute bottom-0 left-0 right-0 z-30 p-3 pb-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-2.5 text-white">
            <div className="flex-1 px-4 py-2 rounded-full border border-white/40 bg-black/30 backdrop-blur-md text-xs text-white/70 font-normal">
              Send message...
            </div>
            <button type="button" className="p-2 rounded-full hover:bg-white/10 text-white transition">
              <Heart className="w-6 h-6 stroke-[2]" />
            </button>
            <button type="button" className="p-2 rounded-full hover:bg-white/10 text-white transition">
              <Send className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        )}
      </div>

      {/* DEDICATED TOUCH-FRIENDLY CONTROLLER DOCK */}
      {post.media_type === 'video' && (
        <div className="w-full mt-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-[#4c1315]/15 shadow-sm text-left">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-[11px] font-mono font-bold text-[#4c1315] min-w-[34px]">
              {formatSecs(currentSecs)}
            </span>
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min={0}
                max={durationSecs || 100}
                step={0.1}
                value={currentSecs}
                onChange={handleSliderSeek}
                className="video-scrubber-light cursor-pointer"
                aria-label="Drag story scrubber"
              />
            </div>
            <span className="text-[11px] font-mono text-[#4c1315]/60 min-w-[34px] text-right">
              {formatSecs(durationSecs)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#4c1315]/10">
            <button
              type="button"
              onClick={() => handleSkip(-5)}
              className="flex-1 py-2 px-1 rounded-xl bg-[#fbf7ee] hover:bg-[#ad9b58]/20 text-[#4c1315] border border-[#4c1315]/15 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 text-xs font-bold"
              title="Rewind 5 seconds"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#ad9b58]" />
              <span>-5s</span>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="flex-1 py-2 px-3 rounded-xl bg-[#4c1315] hover:bg-[#6e1c1f] text-[#fbf7ee] transition flex items-center justify-center cursor-pointer active:scale-95 text-xs font-bold shadow-xs mx-0.5"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white mr-1" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white mr-1" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSkip(5)}
              className="flex-1 py-2 px-1 rounded-xl bg-[#fbf7ee] hover:bg-[#ad9b58]/20 text-[#4c1315] border border-[#4c1315]/15 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 text-xs font-bold"
              title="Fast forward 5 seconds"
            >
              <span>+5s</span>
              <RotateCw className="w-3.5 h-3.5 text-[#ad9b58]" />
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-xl bg-[#fbf7ee] hover:bg-[#ad9b58]/20 text-[#4c1315] border border-[#4c1315]/15 transition cursor-pointer active:scale-95"
              title="Restart"
              aria-label="Restart story"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#ad9b58]" />
            </button>

            <button
              type="button"
              onClick={toggleAudio}
              className="p-2 rounded-xl bg-[#fbf7ee] hover:bg-[#ad9b58]/20 text-[#4c1315] border border-[#4c1315]/15 transition cursor-pointer active:scale-95"
              title={isMuted ? "Unmute" : "Mute"}
              aria-label="Toggle audio mute"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-700" /> : <Volume2 className="w-3.5 h-3.5 text-[#ad9b58]" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
