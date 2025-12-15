
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Rewind, FastForward } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

interface AudioPlayerProps {
  url: string;
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement>(null);
  
  // A regular expression to extract the YouTube video ID.
  const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/)?.[1];

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const setAudioData = () => {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
      }

      const setAudioTime = () => setCurrentTime(audio.currentTime);

      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('loadeddata', setAudioData);
      audio.addEventListener('timeupdate', setAudioTime);
      audio.addEventListener('ended', handleEnded);


      // Set initial volume
      audio.volume = volume;

      return () => {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('ended', handleEnded);
      }
    }
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        // We have to call load() here because the source might change
        // or might need to be re-fetched.
        audio.load();
        audio.play().catch(e => {
            console.error("Error playing audio:", e);
            setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        audio.muted = false;
        setIsMuted(false);
      }
    }
  };
  
  const handleTimeSeek = (value: number[]) => {
    const newTime = value[0];
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (amount: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + amount));
    }
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return null; // Don't render player for invalid URLs
  }
  
  // Use a proxy/service to get a direct audio stream from YouTube.
  const audioStreamUrl = `https://yout-to-mp3.com/api/widget?url=https://www.youtube.com/watch?v=${videoId}`;


  return (
    <div className="p-2 space-y-2 group-data-[collapsible=icon]:hidden">
        {/* We use a hidden audio element to play the YouTube stream */}
        <audio ref={audioRef} src={audioStreamUrl} className="hidden" preload="none"/>
        
        <div className="flex items-center gap-2">
            <span className="text-xs w-10 text-center">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              onValueChange={handleTimeSeek}
              className="flex-1"
            />
            <span className="text-xs w-10 text-center">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSkip(-10)}>
                <Rewind className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSkip(10)}>
                <FastForward className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 w-28 ml-auto">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
            </div>
        </div>
    </div>
  );
}
