"use client";

import { useState, useRef } from "react";
import { getIdToken } from "@/lib/firebase/auth";
import Button from "@/components/ui/Button";

interface VoiceRecorderProps {
  onCloned?: (voiceId: string) => void;
}

export default function VoiceRecorder({ onCloned }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/wav" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setRecording(true);
      setError(null);
    } catch {
      setError("Microphone access denied");
    }
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    setRecording(false);
  }

  async function uploadVoice() {
    if (!audioBlob) return;
    setUploading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.wav");

      const res = await fetch("/api/voice/clone", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Clone failed");
      const data = await res.json();
      onCloned?.(data.voiceId);
    } catch {
      setError("Failed to clone voice. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-sm p-6 text-center space-y-4">
        <p className="text-[#5a5040] text-sm font-light">
          Record 30-60 seconds of yourself speaking naturally. Read a passage or
          just talk about your day.
        </p>

        {!audioBlob ? (
          <Button
            onClick={recording ? stopRecording : startRecording}
            variant={recording ? "secondary" : "primary"}
            size="lg"
          >
            {recording ? (
              <>
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2" style={{ animation: "pulse-amber 1s infinite" }} />
                Stop Recording
              </>
            ) : (
              "Start Recording"
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <audio
              src={URL.createObjectURL(audioBlob)}
              controls
              className="mx-auto opacity-70"
            />
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={() => setAudioBlob(null)}>
                Re-record
              </Button>
              <Button onClick={uploadVoice} loading={uploading}>
                Clone My Voice
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="font-mono text-[10px] tracking-wider text-red-400/60 uppercase text-center">
          {error}
        </p>
      )}
    </div>
  );
}
