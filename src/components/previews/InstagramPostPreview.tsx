'use client';

import React, { useState, useRef } from 'react';
import { Post } from '@/types/post';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  RefreshCw,
  Maximize2,
  Square,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

interface Props {
  post: Post;
}

export function InstagramPostPreview({ post }: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSecs, setCurrentSecs] = useState(0);
  const [durationSecs, setDurationSecs] = useState(0);

  // Carousel slides support
  const slides: string[] = (post.media_urls && post.media_urls.length > 0)
    ? post.media_urls
    : [post.media_url];
  const [activeSlide, setActiveSlide] = useState(0);

  // Aspect ratio controls: '4:5' (Portrait Infographic), '1:1' (Square), 'fit' (Original Unconstrained)
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1' | 'fit'>('4:5');
  const [userSelectedRatio, setUserSelectedRatio] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Brand Recognition
  const isIBT = (post.creator_name || '').toLowerCase().includes('business') || 
                (post.creator_handle || '').toLowerCase().includes('business') ||
                (post.caption || '').toLowerCase().includes('in business together');

  const handle = post.creator_handle || (isIBT ? 'inbusinesstogether' : 'thefinancewoman');
  const creatorTitle = post.creator_name || (isIBT ? 'In Business Together' : 'The Finance Woman');
  const locationText = isIBT ? 'United Kingdom • Director Couples' : 'London, United Kingdom';
  const avatarUrl = isIBT 
    ? '/ibt-logo.png' 
    : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';

  const formatSecs = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (userSelectedRatio) return;
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > naturalWidth * 1.08) {
      setAspectRatio('4:5');
    } else {
      setAspectRatio('1:1');
    }
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
    const dur = videoRef.current.duration || 0;
    setDurationSecs(dur);
    if (!userSelectedRatio && videoRef.current.videoHeight && videoRef.current.videoWidth) {
      if (videoRef.current.videoHeight > videoRef.current.videoWidth * 1.08) {
        setAspectRatio('4:5');
      } else {
        setAspectRatio('1:1');
      }
    }
  };

  const handleSkip = (deltaSecs: number, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const maxDur = videoRef.current.duration || 1000;
    const target = Math.max(0, Math.min(maxDur, videoRef.current.currentTime + deltaSecs));
    videoRef.current.currentTime = target;
    setCurrentSecs(target);
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
  };

  const caption = post.caption || '';
  const isLongCaption = caption.length > 120;

  return (
    <div className="w-full max-w-[440px] mx-auto flex flex-col items-center select-none text-left">
      
      {/* Aspect Ratio Framing Selector */}
      <div className="w-full mb-2.5 flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs text-xs">
        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
          Feed Framing:
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setAspectRatio('4:5');
              setUserSelectedRatio(true);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
              aspectRatio === '4:5'
                ? 'bg-[#4c1315] text-white shadow-xs font-bold'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="4:5 Portrait (1080x1350) - Standard for infographics & carousel posts"
          >
            <Smartphone className="w-3 h-3" />
            <span>4:5 Portrait</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAspectRatio('1:1');
              setUserSelectedRatio(true);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
              aspectRatio === '1:1'
                ? 'bg-[#4c1315] text-white shadow-xs font-bold'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="1:1 Square (1080x1080) - Standard grid post"
          >
            <Square className="w-3 h-3" />
            <span>1:1 Square</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAspectRatio('fit');
              setUserSelectedRatio(true);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
              aspectRatio === 'fit'
                ? 'bg-[#4c1315] text-white shadow-xs font-bold'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Natural Fit - Zero cropping, full graphic edge-to-edge"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Full Fit</span>
          </button>
        </div>
      </div>

      {/* Main Instagram Feed Post Card */}
      <div className="w-full bg-white rounded-2xl overflow-hidden shadow-xl border border-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-neutral-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex-shrink-0 shadow-xs">
              <div className="w-full h-full rounded-full bg-white p-[1px] overflow-hidden flex items-center justify-center">
                <img
                  src={avatarUrl}
                  alt={creatorTitle}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <div className="font-semibold text-xs text-neutral-900 leading-tight flex items-center gap-1">
                <span>{handle}</span>
                <svg className="w-3.5 h-3.5 text-[#3897f0] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <p className="text-[10.5px] text-neutral-500 leading-tight mt-0.5">{locationText}</p>
            </div>
          </div>
          <button type="button" className="text-neutral-500 hover:text-neutral-800 transition p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Media Stage Container - ZERO CROPPING */}
        <div 
          className={`relative w-full bg-neutral-950 flex items-center justify-center overflow-hidden cursor-pointer ${
            aspectRatio === '4:5'
              ? 'aspect-[4/5]'
              : aspectRatio === '1:1'
              ? 'aspect-square'
              : 'min-h-[360px] max-h-[540px]'
          }`}
          onClick={togglePlay}
        >
          {post.media_type === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center group">
              {/* Blurred atmospheric backdrop */}
              <video
                src={post.media_url}
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
              />
              {/* Foreground Video */}
              <video
                ref={videoRef}
                src={post.media_url}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="relative z-10 max-w-full max-h-full object-contain"
              />
              <button
                type="button"
                onClick={toggleAudio}
                className="absolute bottom-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition z-20"
                aria-label="Toggle mute"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4" />}
              </button>
              {!isPlaying && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 backdrop-blur-[1px] pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center text-white pl-1 shadow-lg">
                    <Play className="w-7 h-7 fill-white" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="relative w-full h-full flex items-center justify-center overflow-hidden group/stage select-none"
              onClick={(e) => {
                if (slides.length <= 1) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                if (clickX < rect.width / 2) {
                  setActiveSlide((prev) => Math.max(0, prev - 1));
                } else {
                  setActiveSlide((prev) => Math.min(slides.length - 1, prev + 1));
                }
              }}
            >
              {/* Soft blurred background for non-standard image bounds */}
              <img
                src={slides[activeSlide] || post.media_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
              />
              {/* 100% Uncropped Feed Graphic */}
              <img
                key={activeSlide}
                src={slides[activeSlide] || post.media_url}
                alt={`Instagram post slide ${activeSlide + 1}`}
                onLoad={handleImageLoad}
                className="relative z-10 max-w-full max-h-full object-contain shadow-sm transition-opacity duration-150"
              />

              {/* Note to Romany pill badge (Top Left) */}
              {post.editor_notes && (
                <div className="absolute top-3.5 left-3.5 z-30 max-w-[70%] px-3 py-1.5 rounded-xl bg-[#4c1315]/90 backdrop-blur-md text-[#fbf7ee] text-[11px] font-medium shadow-lg border border-[#ad9b58]/40 pointer-events-none line-clamp-2">
                  <span className="font-bold text-[#ad9b58] mr-1">Note:</span>
                  {post.editor_notes}
                </div>
              )}

              {/* Carousel Slide Counter Badge (Top Right) */}
              {slides.length > 1 && (
                <div className="absolute top-3.5 right-3.5 z-30 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20 pointer-events-none">
                  <Layers className="w-3.5 h-3.5 text-[#ad9b58]" />
                  <span>{String(activeSlide + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}</span>
                </div>
              )}

              {/* Left Carousel Arrow Button */}
              {slides.length > 1 && activeSlide > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlide((prev) => Math.max(0, prev - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-neutral-900 flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer border border-neutral-200"
                  aria-label="Previous slide"
                  title="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6 -ml-0.5 stroke-[2.5]" />
                </button>
              )}

              {/* Right Carousel Arrow Button */}
              {slides.length > 1 && activeSlide < slides.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlide((prev) => Math.min(slides.length - 1, prev + 1));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-neutral-900 flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer border border-neutral-200"
                  aria-label="Next slide"
                  title="Next slide"
                >
                  <ChevronRight className="w-6 h-6 -mr-0.5 stroke-[2.5]" />
                </button>
              )}

              {/* Swipe guidance bar on bottom of image for multiple slides */}
              {slides.length > 1 && (
                <div className="absolute bottom-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm pointer-events-none">
                  {slides.map((_, i) => (
                    <div
                      key={i}
                      className={`transition-all duration-200 rounded-full ${
                        i === activeSlide
                          ? 'w-4 h-1.5 bg-[#3897f0]'
                          : 'w-1.5 h-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-3.5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className="transition hover:opacity-75 focus:outline-none"
              >
                <Heart
                  className={`w-6 h-6 transition ${
                    isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-neutral-900 stroke-[2]'
                  }`}
                />
              </button>
              <MessageCircle className="w-6 h-6 text-neutral-900 stroke-[2] cursor-pointer hover:opacity-75" />
              <Send className="w-5 h-5 text-neutral-900 stroke-[2] cursor-pointer hover:opacity-75" />
            </div>

            {/* Carousel Dot Indicators in Action Bar */}
            {slides.length > 1 && (
              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlide(i)}
                    className={`transition-all duration-200 rounded-full cursor-pointer ${
                      i === activeSlide
                        ? 'w-2 h-2 bg-[#3897f0]'
                        : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className="transition hover:opacity-75 focus:outline-none"
            >
              <Bookmark
                className={`w-6 h-6 ${
                  isSaved ? 'fill-neutral-900 text-neutral-900' : 'text-neutral-900 stroke-[2]'
                }`}
              />
            </button>
          </div>

          {/* Likes */}
          <div className="text-xs font-semibold text-neutral-900 mb-1.5">
            {isLiked ? '1,843 likes' : '1,842 likes'}
          </div>

          {/* Caption snippet with full line-break fidelity */}
          {caption && (
            <div className="text-xs text-neutral-800 leading-relaxed mb-2">
              <span className="font-semibold text-neutral-900 mr-1.5">{handle}</span>
              <span className={isExpanded ? 'whitespace-pre-line' : 'line-clamp-3 whitespace-pre-line'}>
                {caption}
              </span>
              {isLongCaption && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-neutral-400 hover:text-neutral-700 ml-1 font-semibold cursor-pointer"
                >
                  {isExpanded ? 'less' : '... more'}
                </button>
              )}
            </div>
          )}

          <div className="text-[10px] text-neutral-400 uppercase tracking-wide mt-2">
            {post.scheduled_at
              ? `Scheduled for ${new Date(post.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
              : '2 hours ago'}
          </div>
        </div>
      </div>

      {/* DEDICATED CONTROLLER DOCK FOR FEED VIDEOS */}
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
                aria-label="Drag video scrubber"
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
              title="Forward 5 seconds"
            >
              <span>+5s</span>
              <RotateCw className="w-3.5 h-3.5 text-[#ad9b58]" />
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-xl bg-[#fbf7ee] hover:bg-[#ad9b58]/20 text-[#4c1315] border border-[#4c1315]/15 transition cursor-pointer active:scale-95"
              title="Restart"
              aria-label="Restart feed video"
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
