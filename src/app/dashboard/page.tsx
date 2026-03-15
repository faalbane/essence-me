"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/firebase/auth";
import { db, signOut } from "@/lib/firebase/client";
import { calculateEssenceStrength } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Avatar from "@/components/profile/Avatar";
import VoiceRecorder from "@/components/audio/VoiceRecorder";

interface UserProfile {
  username: string;
  displayName: string;
  avatarUrl?: string;
  voiceId?: string;
  essenceStatus: string;
  stats: { diaryEntries: number; totalQuestions: number };
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showVoice, setShowVoice] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        router.push("/auth");
      }
    });

    return unsub;
  }, [user, loading, router]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border border-teal-glow/40 border-t-teal-glow rounded-full animate-spin" />
      </div>
    );
  }

  const essenceStrength = calculateEssenceStrength(profile.stats.diaryEntries);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const { getIdToken } = await import("@/lib/firebase/auth");
    const token = await getIdToken();
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
    } catch (err) {
      console.error("Avatar upload failed:", err);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-5xl mx-auto">
        <div
          className="font-mono text-sm tracking-[0.3em] uppercase cursor-pointer"
          onClick={() => router.push("/")}
        >
          <span className="text-amber-pale/80">essence</span>
          <span className="text-teal-glow/60">.me</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.open(`/${profile.username}`, "_blank")}>
            View Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            Sign out
          </Button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-10 py-8 space-y-8 stagger-children">
        {/* Profile header */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar src={profile.avatarUrl} name={profile.displayName} size="lg" />
            <label className="absolute inset-0 flex items-center justify-center bg-void/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
              <span className="font-mono text-[10px] text-teal-glow/80 uppercase tracking-wider">Change</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-pale tracking-wide">{profile.displayName}</h1>
            <p className="font-mono text-[11px] tracking-[0.2em] text-teal-glow/40 uppercase">@{profile.username}</p>
            <p className="font-mono text-[10px] text-[#3a3530] mt-1">essence.me/{profile.username}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel rounded-sm p-5 space-y-3">
            <p className="font-mono text-[9px] tracking-[0.3em] text-amber-glow/40 uppercase">
              Essence Strength
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-amber-pale font-mono">{essenceStrength}%</span>
            </div>
            <div className="w-full h-[3px] bg-[#1a1510] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${essenceStrength}%`,
                  background: "linear-gradient(90deg, rgba(232,145,42,0.6), rgba(0,180,190,0.8))",
                  boxShadow: "0 0 8px rgba(0,180,190,0.3)",
                }}
              />
            </div>
            {essenceStrength < 100 && (
              <p className="font-mono text-[10px] text-[#3a3530]">
                {20 - profile.stats.diaryEntries} sessions remaining
              </p>
            )}
          </div>

          <div className="glass-panel rounded-sm p-5 space-y-3">
            <p className="font-mono text-[9px] tracking-[0.3em] text-amber-glow/40 uppercase">
              Diary Entries
            </p>
            <span className="text-3xl font-bold text-amber-pale font-mono">
              {profile.stats.diaryEntries}
            </span>
          </div>

          <div className="glass-panel rounded-sm p-5 space-y-3">
            <p className="font-mono text-[9px] tracking-[0.3em] text-amber-glow/40 uppercase">
              Queries Received
            </p>
            <span className="text-3xl font-bold text-amber-pale font-mono">
              {profile.stats.totalQuestions}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel-amber rounded-sm p-6 space-y-4">
            <h2 className="text-amber-pale font-bold tracking-wide">Train Your Essence</h2>
            <p className="text-[#5a5040] text-sm font-light">
              The more you share, the better your AI twin becomes at representing you.
            </p>
            <Button onClick={() => router.push("/train")}>
              {profile.stats.diaryEntries === 0 ? "Begin Training" : "Continue Training"}
            </Button>
          </div>

          <div className="glass-panel rounded-sm p-6 space-y-4">
            <h2 className="text-amber-pale font-bold tracking-wide">Voice Clone</h2>
            <p className="text-[#5a5040] text-sm font-light">
              {profile.voiceId
                ? "Voice signature captured. Visitors hear your synthesized voice."
                : "Record your voice so responses sound like you."}
            </p>
            {profile.voiceId ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-glow/60 shadow-[0_0_6px_rgba(0,180,190,0.4)]" style={{ animation: "pulse-teal 3s infinite" }} />
                <span className="font-mono text-[10px] tracking-wider text-teal-glow/60 uppercase">Voice Active</span>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setShowVoice(!showVoice)}>
                {showVoice ? "Cancel" : "Record Voice"}
              </Button>
            )}
          </div>
        </div>

        {showVoice && <VoiceRecorder onCloned={() => setShowVoice(false)} />}

        {/* Share */}
        <div className="glass-panel-amber rounded-sm p-6 text-center space-y-4">
          <h2 className="text-amber-pale font-bold tracking-wide">Share Your Essence</h2>
          <p className="text-[#5a5040] text-sm font-light">
            Anyone with this link can converse with your AI twin
          </p>
          <div className="flex items-center justify-center gap-3">
            <code className="font-mono text-sm text-teal-glow/70 bg-teal-glow/5 border border-teal-glow/10 px-4 py-2 rounded-sm">
              essence.me/{profile.username}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
