import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music } from 'lucide-react';

const AudioAttachment = ({ audio }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(audio.duration || 0);
  const audioRef = useRef(null);

  // Get actual duration from audio metadata when component mounts
  useEffect(() => {
    if (audioRef.current && (!audio.duration || audio.duration === 0)) {
      const handleLoadedMetadata = () => {
        const duration = audioRef.current.duration;
        if (duration && !isNaN(duration) && duration !== Infinity) {
          setActualDuration(Math.floor(duration));
        }
      };
      
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      // If audio is already loaded
      if (audioRef.current.readyState >= 1) {
        handleLoadedMetadata();
      }
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    }
  }, [audio.duration]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-base-200 p-3 rounded-lg mb-2 max-w-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="btn btn-sm btn-circle btn-primary"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Music size={16} className="text-zinc-400" />
            <span className="text-sm">Audio Message</span>
          </div>
          <p className="text-xs text-zinc-400">
            {formatTime(currentTime)} / {formatTime(actualDuration)}
          </p>
        </div>
        <audio
          ref={audioRef}
          src={audio.url}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />
      </div>
    </div>
  );
};

export default AudioAttachment;