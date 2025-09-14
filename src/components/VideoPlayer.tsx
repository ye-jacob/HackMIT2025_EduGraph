import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { GraphNode } from './EduGraph';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  duration: number;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  concepts: GraphNode[];
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  duration,
  currentTime,
  onTimeUpdate,
  concepts
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      // Only update video time if the difference is significant to avoid feedback loops
      const timeDiff = Math.abs(videoRef.current.currentTime - currentTime);
      if (timeDiff > 0.5) {
        videoRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 200; // Update every 200ms for better performance

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastUpdateTime >= UPDATE_INTERVAL) {
        // Only update if the time has actually changed significantly
        const currentVideoTime = video.currentTime;
        if (Math.abs(currentVideoTime - currentTime) > 0.1) {
          onTimeUpdate(currentVideoTime);
          lastUpdateTime = now;
        }
      }
    };

    const handleLoadedMetadata = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (!videoRef.current) return;
    
    setPlaybackRate(rate);
    videoRef.current.playbackRate = rate;
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    videoRef.current.currentTime = newTime;
    // Don't call onTimeUpdate here - let the timeupdate event handle it naturally
  }, [duration]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const activeConcepts = useMemo(() => {
    return concepts.filter(concept => concept.isActive);
  }, [concepts]);

  const conceptsAtTime = useMemo(() => {
    return concepts.filter(concept =>
      concept.timestamps.some(timestamp => Math.abs(timestamp - currentTime) < 15)
    );
  }, [concepts, currentTime]);

  const conceptMarkers = useMemo(() => {
    return concepts.flatMap((concept) =>
      concept.timestamps.map((timestamp, index) => ({
        key: `${concept.id}-${index}`,
        timestamp,
        label: concept.label,
        position: (timestamp / duration) * 100
      }))
    );
  }, [concepts, duration]);

  return (
    <div className="video-container bg-card rounded-lg overflow-hidden shadow-lg">
      <div className="relative group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video bg-black"
          preload="metadata"
          playsInline
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          style={{
            willChange: 'auto',
            transform: 'translateZ(0)', // Force hardware acceleration
          }}
        />
        
        {/* Optimized Concept Overlays */}
        {activeConcepts.length > 0 && (
          <div className="absolute top-4 right-4 space-y-2 pointer-events-none">
            {activeConcepts.map((concept) => (
              <div
                key={concept.id}
                className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium animate-pulse-node"
                style={{
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)', // Hardware acceleration
                }}
              >
                {concept.label}
              </div>
            ))}
          </div>
        )}

        {/* Video Controls */}
        <div 
          className={`absolute bottom-0 left-0 right-0 video-controls p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setShowControls(true)}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <div 
              className="progress-bar h-2 rounded-full cursor-pointer relative"
              onClick={handleProgressClick}
            >
              <div 
                className="progress-fill h-full rounded-full relative"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                {/* Optimized Concept Markers */}
                {conceptMarkers.map((marker) => (
                  <div
                    key={marker.key}
                    className="timeline-marker absolute w-2 h-4 -top-1 rounded-sm transition-all duration-200"
                    style={{ left: `${marker.position}%` }}
                    title={marker.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:text-primary"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:text-primary"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={playbackRate}
                onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                className="bg-white/20 text-white text-sm rounded px-2 py-1 border-none outline-none"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:text-primary"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Title */}
      <div className="p-4 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
          <span>Duration: {formatTime(duration)}</span>
          <span>
            {conceptsAtTime.length > 0 && 
              `Current concepts: ${conceptsAtTime.map(c => c.label).join(', ')}`
            }
          </span>
        </div>
      </div>
    </div>
  );
};