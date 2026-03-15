"use client";

import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnd = () => setPlaying(false);
    audio.addEventListener("ended", handleEnd);
    return () => audio.removeEventListener("ended", handleEnd);
  }, []);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  return (
    <div className="flex items-center gap-3 glass-panel rounded-sm px-4 py-2.5">
      <button
        onClick={toggle}
        className="font-mono text-[10px] tracking-wider text-teal-glow/60 hover:text-teal-glow transition-colors cursor-pointer uppercase"
      >
        {playing ? "Pause" : "Play"}
      </button>
      <audio ref={audioRef} src={src} />
      {playing && (
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-teal-glow/40 rounded-full"
              style={{
                height: `${8 + Math.random() * 8}px`,
                animation: `pulse-teal 0.8s infinite ${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}
      <span className="font-mono text-[9px] tracking-wider text-[#3a3530] uppercase">
        {playing ? "Streaming..." : "Voice Synthesis"}
      </span>
    </div>
  );
}
