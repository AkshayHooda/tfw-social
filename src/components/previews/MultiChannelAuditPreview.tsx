'use client';

import React, { useState } from 'react';
import { Post } from '@/types/post';
import { 
  Grid3X3, 
  Compass, 
  Clapperboard, 
  Layers, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Users, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Share2
} from 'lucide-react';

interface MultiChannelAuditPreviewProps {
  post: Post;
  activeSlideIndex?: number;
  onSlideChange?: (index: number) => void;
}

export type ChannelViewMode = 
  | 'ig_feed'            // 1. Feed: 4:5 carousel or single post
  | 'ig_grid'            // 2. Profile Grid: 3:4 tile
  | 'ig_explore'         // 3. Explore / Search: cropped preview
  | 'ig_reel_full'       // 4. Reel: 9:16 Full Screen + Safe Zones
  | 'ig_reel_feed'       // 5. Reel in Feed: 4:5 center crop
  | 'ig_reel_grid'       // 6. Reel Cover on Grid: 3:4 crop
  | 'ig_story'           // 7. Stories: 9:16 + top/bottom safe zones
  | 'ig_story_share'     // 8. Post shared to Story card
  | 'ig_desktop'         // 9. Desktop Web: 4:5 / 3:4
  | 'fb_mobile_feed'     // 10. Single image / Carousel Mobile Feed
  | 'fb_desktop_feed'    // 11. Desktop Page Feed
  | 'fb_multi_grid'      // 12. Multi-photo grid (+N tile)
  | 'fb_photo_viewer'    // 13. Photo Viewer modal
  | 'fb_photos_tab'      // 14. Page Photos Tab: 1:1 square
  | 'fb_reels'           // 15. FB Reels: 9:16 safe zones
  | 'fb_group';          // 16. Facebook Group feed

interface ViewSpec {
  id: ChannelViewMode;
  num: number;
  platform: 'instagram' | 'facebook';
  title: string;
  sizeShape: string;
  whatToCheck: string;
  badge: string;
}

const VIEW_SPECS: ViewSpec[] = [
  // INSTAGRAM VIEWS
  {
    id: 'ig_feed',
    num: 1,
    platform: 'instagram',
    title: 'Feed Carousel / Single Post',
    sizeShape: '1080×1350 (4:5) or 1080×1080 (1:1)',
    whatToCheck: 'Every slide must match the same aspect ratio because slide 1 locks it for the carousel.',
    badge: 'IG Feed (4:5)'
  },
  {
    id: 'ig_grid',
    num: 2,
    platform: 'instagram',
    title: 'Profile Grid Tile',
    sizeShape: '3:4 Tile (Center Cropped)',
    whatToCheck: 'Headline, face, and logo sit inside middle 1012px width. Views counter sits at bottom-left.',
    badge: 'IG Grid (3:4)'
  },
  {
    id: 'ig_explore',
    num: 3,
    platform: 'instagram',
    title: 'Explore & Search Tile',
    sizeShape: 'Mixed Mosaic Grid (Center Cropped)',
    whatToCheck: 'Hook and visual focal point make sense immediately even when cropped in search discovery.',
    badge: 'IG Explore'
  },
  {
    id: 'ig_reel_full',
    num: 4,
    platform: 'instagram',
    title: 'Reels: 9:16 Full Screen',
    sizeShape: '1080×1920 (9:16)',
    whatToCheck: 'Safe zones: 220px clear top, 420px clear bottom (caption & sound), 120px clear right (action icons).',
    badge: 'Reel 9:16'
  },
  {
    id: 'ig_reel_feed',
    num: 5,
    platform: 'instagram',
    title: 'Reel in Main Home Feed',
    sizeShape: '1080×1350 (4:5 Center Crop)',
    whatToCheck: 'Hook text, title banner, and face stay completely visible inside the center 1080×1350 cut.',
    badge: 'Reel in Feed (4:5)'
  },
  {
    id: 'ig_reel_grid',
    num: 6,
    platform: 'instagram',
    title: 'Reel Cover on Profile Grid',
    sizeShape: '3:4 Crop (1080×1440 centered)',
    whatToCheck: 'Dedicated cover photo title typography sits inside 1080×1440 without overlapping the reel play badge.',
    badge: 'Reel Cover (3:4)'
  },
  {
    id: 'ig_story',
    num: 7,
    platform: 'instagram',
    title: 'Instagram Stories',
    sizeShape: '1080×1920 (9:16)',
    whatToCheck: 'Keep ~250px clear at top (profile handle & time bar) and ~340px at bottom (reply pill & stickers).',
    badge: 'Story 9:16'
  },
  {
    id: 'ig_story_share',
    num: 8,
    platform: 'instagram',
    title: 'Post Shared to Stories',
    sizeShape: 'Shrunk Card with Tap Sticker',
    whatToCheck: 'Cover title, headline text, and visual clarity remain easily legible at smaller sticker scale.',
    badge: 'Shared Card'
  },
  {
    id: 'ig_desktop',
    num: 9,
    platform: 'instagram',
    title: 'Desktop (instagram.com)',
    sizeShape: 'Web Desktop Container (4:5 / 3:4)',
    whatToCheck: 'Wide web browser presentation, side-by-side caption comments, and high-DPI scaling.',
    badge: 'Desktop Web'
  },

  // FACEBOOK PAGE VIEWS
  {
    id: 'fb_mobile_feed',
    num: 10,
    platform: 'facebook',
    title: 'Single Image Mobile Feed',
    sizeShape: '1080×1350 or 1080×1080',
    whatToCheck: 'Displays in full on iOS / Android FB app without auto-cropping headlines or disclaimers.',
    badge: 'FB Mobile Feed'
  },
  {
    id: 'fb_desktop_feed',
    num: 11,
    platform: 'facebook',
    title: 'Single Image Desktop Feed',
    sizeShape: '1080×1350 in Desktop Feed',
    whatToCheck: 'Text, font sizing, and legal risk warnings remain sharp on laptop/monitor displays.',
    badge: 'FB Desktop Feed'
  },
  {
    id: 'fb_multi_grid',
    num: 12,
    platform: 'facebook',
    title: 'Multi-Photo Collage (+N Grid)',
    sizeShape: '2x2 Mosaic Collage with +N',
    whatToCheck: 'Slide 1 acts as primary anchor. Anything after 4th/5th image is behind +N; key message must be on slide 1.',
    badge: 'FB Multi-Photo'
  },
  {
    id: 'fb_photo_viewer',
    num: 13,
    platform: 'facebook',
    title: 'Full Screen Photo Lightbox',
    sizeShape: 'Theater Mode Blackout',
    whatToCheck: 'Full resolution swipe order is chronologically intact from slide 1 to CTA slide.',
    badge: 'FB Lightbox'
  },
  {
    id: 'fb_photos_tab',
    num: 14,
    platform: 'facebook',
    title: 'Facebook Page Photos Tab',
    sizeShape: '1:1 Square Grid Tile',
    whatToCheck: 'Square center-crop keeps main headline and branding centered on Romany’s page gallery.',
    badge: 'FB Photos (1:1)'
  },
  {
    id: 'fb_reels',
    num: 15,
    platform: 'facebook',
    title: 'Facebook Reels & Stories',
    sizeShape: '1080×1920 (9:16) FB Player',
    whatToCheck: 'Top 310px safe margin avoids Facebook header buttons; bottom 420px clears sound info.',
    badge: 'FB Reels 9:16'
  },
  {
    id: 'fb_group',
    num: 16,
    platform: 'facebook',
    title: 'Facebook Group (Pet Hub)',
    sizeShape: 'Community Feed Card',
    whatToCheck: 'Community context badge, author attribution, and readable first 3 lines before "See more".',
    badge: 'FB Group Hub'
  }
];

export function MultiChannelAuditPreview({ post, activeSlideIndex = 0, onSlideChange }: MultiChannelAuditPreviewProps) {
  const [selectedView, setSelectedView] = useState<ChannelViewMode>('ig_feed');
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [localSlide, setLocalSlide] = useState<number>(activeSlideIndex);

  // All carousel slides or single media URL
  const slides: string[] = (post.media_urls && post.media_urls.length > 0)
    ? post.media_urls
    : [post.media_url];

  // Reel cover image detection
  const coverUrl = post.media_urls && post.media_urls.length > 1
    ? post.media_urls.find(u => u !== post.media_url && !u.endsWith('.mp4') && !u.endsWith('.mov'))
    : null;

  const currentSlideIndex = onSlideChange ? activeSlideIndex : localSlide;
  const currentSlide = slides[currentSlideIndex] || slides[0] || post.media_url;

  const handleSlideSelect = (idx: number) => {
    if (onSlideChange) onSlideChange(idx);
    else setLocalSlide(idx);
  };

  const activeSpec = VIEW_SPECS.find(v => v.id === selectedView) || VIEW_SPECS[0];
  const isVideo = post.media_type === 'video' || post.media_url.endsWith('.mp4') || post.media_url.endsWith('.mov');

  return (
    <div className="w-full bg-[#fbf7ee] rounded-3xl border-2 border-[#4c1315]/20 shadow-md overflow-hidden text-[#280c0d]">
      {/* 1. TOP HEADER & VIEW CATEGORIES */}
      <div className="p-4 sm:p-5 bg-white border-b border-[#4c1315]/15 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#4c1315] text-[#fbf7ee]">
              <ShieldCheck className="w-4 h-4 text-[#ad9b58]" />
            </div>
            <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#4c1315]">
              Meta Multi-Channel Placement Audit
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ad9b58]/20 text-[#4c1315] border border-[#ad9b58]/40 uppercase tracking-wider">
              16 Placement Simulator
            </span>
          </div>
          <p className="text-xs text-[#4c1315]/70 mt-1">
            Preview exactly how this draft will crop, render, and display across every Instagram & Facebook surface before broadcast.
          </p>
        </div>

        {/* Toggle Safe Zone Guides */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              showSafeZones
                ? 'bg-[#ad9b58] text-[#4c1315] border-[#ad9b58] font-bold shadow-2xs'
                : 'bg-[#fbf7ee] text-[#4c1315]/70 border-[#4c1315]/20 hover:text-[#4c1315]'
            }`}
            title="Toggle Instagram and Facebook interface cut-off safe zones"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showSafeZones ? 'Safe Zones ON' : 'Safe Zones OFF'}</span>
          </button>
        </div>
      </div>

      {/* 2. PLACEMENT VIEW SELECTOR BUTTONS */}
      <div className="p-3 sm:p-4 bg-[#fbf7ee] border-b border-[#4c1315]/10 space-y-2.5">
        {/* Instagram Row */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#4c1315]/80 mb-1.5">
            <svg className="w-3.5 h-3.5 text-pink-700 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram Placements (1–9):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {VIEW_SPECS.filter(v => v.platform === 'instagram').map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedView(v.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-serif-display font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  selectedView === v.id
                    ? 'bg-[#4c1315] text-[#fbf7ee] border-[#ad9b58] shadow-xs'
                    : 'bg-white border-[#4c1315]/15 text-[#4c1315]/80 hover:bg-[#fbf7ee]'
                }`}
              >
                <span className="text-[10px] opacity-70">#{v.num}</span>
                <span>{v.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Facebook Row */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#4c1315]/80 mb-1.5">
            <svg className="w-3.5 h-3.5 text-blue-700 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook Page & Groups Placements (10–16):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {VIEW_SPECS.filter(v => v.platform === 'facebook').map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedView(v.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-serif-display font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  selectedView === v.id
                    ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-xs'
                    : 'bg-white border-[#4c1315]/15 text-[#4c1315]/80 hover:bg-[#fbf7ee]'
                }`}
              >
                <span className="text-[10px] opacity-70">#{v.num}</span>
                <span>{v.badge}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. SIMULATOR STAGE & AUDIT INFO */}
      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: THE INTERACTIVE DEVICE FRAME (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          {/* Surface Mockup Container */}
          <div className="w-full max-w-[390px] bg-neutral-950 rounded-[32px] p-3 shadow-2xl border-4 border-neutral-800 relative overflow-hidden transition-all duration-300">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-8 h-1 bg-neutral-700 rounded-full" />
            </div>

            {/* Simulated Canvas by View Mode */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-900 flex items-center justify-center">
              {/* VIEW 1, 9, 10, 11: 4:5 FEED CAROUSEL / POST */}
              {(selectedView === 'ig_feed' || selectedView === 'ig_desktop' || selectedView === 'fb_mobile_feed' || selectedView === 'fb_desktop_feed') && (
                <div className="relative w-full aspect-[4/5] bg-neutral-900 flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <video src={post.media_url} controls playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={currentSlide} alt="Feed Slide" className="w-full h-full object-cover" />
                  )}

                  {/* Header bar simulation */}
                  <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between pointer-events-none text-white text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#4c1315] border border-[#ad9b58] overflow-hidden flex items-center justify-center text-[10px] font-bold">
                        TFW
                      </div>
                      <span className="font-semibold text-xs drop-shadow">thefinancewoman</span>
                    </div>
                    {slides.length > 1 && (
                      <span className="bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-mono border border-white/20">
                        {currentSlideIndex + 1}/{slides.length}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2, 6, 9: 3:4 PROFILE GRID TILE */}
              {(selectedView === 'ig_grid' || selectedView === 'ig_reel_grid') && (
                <div className="relative w-full aspect-[3/4] bg-neutral-900 flex items-center justify-center overflow-hidden">
                  <img 
                    src={selectedView === 'ig_reel_grid' && coverUrl ? coverUrl : (slides[0] || post.media_url)} 
                    alt="Grid Tile" 
                    className="w-full h-full object-cover" 
                  />

                  {/* 3:4 Crop Boundaries Visual Guide */}
                  {showSafeZones && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-[#ad9b58] flex flex-col justify-between p-2">
                      <div className="bg-[#4c1315]/80 text-[#ad9b58] text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm self-start">
                        Tile: 3:4 Center Crop
                      </div>
                      <div className="bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-sm self-end">
                        1012px Center Target
                      </div>
                    </div>
                  )}

                  {/* Views count simulated on bottom-left */}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold text-white flex items-center gap-1 border border-white/20">
                    <Clapperboard className="w-3 h-3 text-[#ad9b58]" />
                    <span>1,842 views</span>
                  </div>
                </div>
              )}

              {/* VIEW 3: EXPLORE MOSAIC TILE */}
              {selectedView === 'ig_explore' && (
                <div className="relative w-full aspect-square bg-neutral-900 flex items-center justify-center overflow-hidden">
                  <img src={slides[0] || post.media_url} alt="Explore Tile" className="w-full h-full object-cover" />
                  {showSafeZones && (
                    <div className="absolute inset-0 border-2 border-dashed border-amber-400 pointer-events-none flex items-center justify-center">
                      <span className="bg-black/70 text-amber-300 text-[10px] px-2 py-1 rounded font-bold">
                        Explore Square Crop
                      </span>
                    </div>
                  )}
                  {isVideo && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white">
                      <Clapperboard className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {slides.length > 1 && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 4, 15: REEL 9:16 FULL SCREEN WITH SAFE ZONES */}
              {(selectedView === 'ig_reel_full' || selectedView === 'fb_reels') && (
                <div className="relative w-full aspect-[9/16] bg-neutral-950 flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <video src={post.media_url} controls playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={currentSlide} alt="Reel Still" className="w-full h-full object-cover" />
                  )}

                  {/* SAFE ZONE OVERLAY GUIDES */}
                  {showSafeZones && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                      {/* Top Danger Zone (220px on 1920 ~ 11.5%) */}
                      <div className="h-[12%] bg-red-600/35 border-b-2 border-red-500 flex items-center justify-center text-white text-[10px] font-bold tracking-wider">
                        ⚠️ Top Danger Zone (FB/IG Header: ~220px)
                      </div>

                      {/* Middle Verified Safe Creative Window */}
                      <div className="flex-1 border-y-2 border-dashed border-emerald-400 flex items-center justify-center">
                        <span className="bg-black/60 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-400/40">
                          ✓ Verified Safe Text Window
                        </span>
                      </div>

                      {/* Bottom Danger Zone (420px on 1920 ~ 22%) */}
                      <div className="h-[22%] bg-red-600/35 border-t-2 border-red-500 flex flex-col items-center justify-center text-white text-[10px] font-bold p-1">
                        <span>⚠️ Bottom Danger Zone (~420px)</span>
                        <span className="text-[8px] font-normal opacity-80">Captions, Audio & Engagement Controls</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 5: REEL IN FEED (4:5 CUT) */}
              {selectedView === 'ig_reel_feed' && (
                <div className="relative w-full aspect-[4/5] bg-neutral-950 flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <video src={post.media_url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={currentSlide} alt="Reel Feed Cut" className="w-full h-full object-cover" />
                  )}

                  {showSafeZones && (
                    <div className="absolute inset-0 border-2 border-emerald-500 pointer-events-none flex flex-col justify-between p-2">
                      <span className="bg-[#4c1315]/90 text-[#ad9b58] text-[9px] font-bold px-2 py-0.5 rounded self-start">
                        4:5 Home Feed Crop
                      </span>
                      <span className="bg-black/70 text-white text-[9px] px-2 py-0.5 rounded self-end">
                        Hook Must Sit Here
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 7: STORIES (9:16 WITH BAR & REPLY PILL) */}
              {selectedView === 'ig_story' && (
                <div className="relative w-full aspect-[9/16] bg-neutral-950 flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <video src={post.media_url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={currentSlide} alt="Story Frame" className="w-full h-full object-cover" />
                  )}

                  {showSafeZones && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                      {/* Top Story Safe Zone (~250px / 13%) */}
                      <div className="h-[13%] bg-red-600/30 border-b-2 border-red-500 flex items-center justify-center text-white text-[10px] font-bold">
                        Top 250px: Account Bar & Timer
                      </div>
                      {/* Bottom Story Safe Zone (~340px / 18%) */}
                      <div className="h-[18%] bg-red-600/30 border-t-2 border-red-500 flex items-center justify-center text-white text-[10px] font-bold">
                        Bottom 340px: Reply Message Box
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 8: POST SHARED TO STORY STICKER */}
              {selectedView === 'ig_story_share' && (
                <div className="relative w-full aspect-[9/16] bg-gradient-to-tr from-neutral-900 via-[#4c1315]/60 to-neutral-950 flex flex-col items-center justify-center p-6">
                  {/* The Shrunk Feed Card Sticker */}
                  <div className="w-[78%] aspect-[4/5] bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 relative group">
                    <img src={slides[0] || post.media_url} alt="Story Sticker" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md p-1.5 rounded-xl text-center text-white text-[10px] font-bold flex items-center justify-center gap-1">
                      <span>Tap to view post</span>
                      <ChevronRight className="w-3 h-3 text-[#ad9b58]" />
                    </div>
                  </div>
                  <span className="text-[10px] text-white/70 mt-3 font-mono">
                    Story Sticker Legibility Check
                  </span>
                </div>
              )}

              {/* VIEW 12: FB MULTI-PHOTO COLLAGE (+N) */}
              {selectedView === 'fb_multi_grid' && (
                <div className="relative w-full aspect-square bg-neutral-900 grid grid-cols-2 grid-rows-2 gap-1 p-1 overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img src={slides[0] || post.media_url} alt="Photo 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative overflow-hidden">
                    <img src={slides[1] || slides[0]} alt="Photo 2" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative overflow-hidden">
                    <img src={slides[2] || slides[0]} alt="Photo 3" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative overflow-hidden flex items-center justify-center bg-black">
                    <img src={slides[3] || slides[0]} alt="Photo 4" className="w-full h-full object-cover opacity-40" />
                    {slides.length > 4 && (
                      <span className="absolute text-white font-bold text-2xl drop-shadow">
                        +{slides.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 13: FB PHOTO VIEWER LIGHTBOX */}
              {selectedView === 'fb_photo_viewer' && (
                <div className="relative w-full aspect-[4/5] bg-black flex items-center justify-center p-2">
                  <img src={currentSlide} alt="Lightbox View" className="max-w-full max-h-full object-contain" />
                  <div className="absolute top-2 right-2 bg-neutral-800 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                    Photo {currentSlideIndex + 1} of {slides.length}
                  </div>
                </div>
              )}

              {/* VIEW 14: FB PHOTOS TAB 1:1 SQUARE */}
              {selectedView === 'fb_photos_tab' && (
                <div className="relative w-full aspect-square bg-neutral-900 flex items-center justify-center overflow-hidden">
                  <img src={slides[0] || post.media_url} alt="Photos Tab" className="w-full h-full object-cover" />
                  {showSafeZones && (
                    <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none flex items-center justify-center">
                      <span className="bg-black/70 text-blue-300 text-[10px] px-2 py-0.5 rounded font-bold">
                        FB Square Photos Tab Crop
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 16: FB GROUP POST CARD */}
              {selectedView === 'fb_group' && (
                <div className="w-full bg-white text-[#280c0d] p-3 rounded-xl border border-neutral-300 text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                      🐾
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">The Pet Accountant Hub</p>
                      <p className="text-[10px] text-neutral-500">Romany Youell • Financial Partner</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-800 line-clamp-3">
                    {post.caption || 'Community finance guidance...'}
                  </p>
                  <div className="aspect-[4/5] rounded-lg overflow-hidden bg-neutral-100">
                    <img src={currentSlide} alt="Group Slide" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Carousel Thumbnail Strip (If Multi-slide) */}
            {slides.length > 1 && (
              <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-center gap-1.5 overflow-x-auto py-1">
                {slides.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSlideSelect(idx)}
                    className={`w-9 h-11 rounded-md overflow-hidden border-2 transition flex-shrink-0 cursor-pointer ${
                      currentSlideIndex === idx ? 'border-[#ad9b58] ring-2 ring-[#ad9b58]/50' : 'border-neutral-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={s} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: AUDIT CHECKLIST & QUALITY CRITERIA (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active View Specification Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#4c1315]/15 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ad9b58]">
                Placement Specification #{activeSpec.num}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeSpec.platform === 'instagram' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {activeSpec.platform === 'instagram' ? 'Instagram' : 'Facebook Page'}
              </span>
            </div>

            <h4 className="font-serif-display font-bold text-base text-[#4c1315]">
              {activeSpec.title}
            </h4>

            <div className="p-2.5 rounded-xl bg-[#fbf7ee] border border-[#4c1315]/10 text-xs font-mono text-[#4c1315]">
              📐 Aspect & Target: <span className="font-bold">{activeSpec.sizeShape}</span>
            </div>

            <p className="text-xs text-[#4c1315]/80 leading-relaxed">
              <strong className="text-[#4c1315]">Critical Rule:</strong> {activeSpec.whatToCheck}
            </p>
          </div>

          {/* Master 5-Point Quality Verification List */}
          <div className="p-5 rounded-2xl bg-white border border-[#4c1315]/15 shadow-sm space-y-3">
            <h4 className="font-serif-display font-bold text-sm text-[#4c1315] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Broadcast Quality Check (Romany Standards)</span>
            </h4>

            <ul className="space-y-2 text-xs text-[#4c1315]/80">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ad9b58] mt-1.5 flex-shrink-0" />
                <span><strong>Text Sizing:</strong> Minimum ~24px on 1080 canvas so phones read clearly without squinting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ad9b58] mt-1.5 flex-shrink-0" />
                <span><strong>Slide Numbers:</strong> Present on internal educational slides; omitted on cover hook.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ad9b58] mt-1.5 flex-shrink-0" />
                <span><strong>Bottom-Left Clear Zone:</strong> Avoid placing logos or tiny copy at bottom-left where the view count overlays.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ad9b58] mt-1.5 flex-shrink-0" />
                <span><strong>Single Theme Aesthetic:</strong> Consistent cream/burgundy or single photoshoot aesthetic across all slides.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ad9b58] mt-1.5 flex-shrink-0" />
                <span><strong>No Em Dashes:</strong> Strictly natural punctuation, human tone, and minimal emoji accents.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
