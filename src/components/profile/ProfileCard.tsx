"use client";

import Avatar from "./Avatar";

function formatUpdatedAt(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface ProfileCardProps {
  displayName: string;
  username: string;
  avatarUrl?: string;
  essenceStrength?: number;
  totalQuestions?: number;
  updatedAt?: string;
}

export default function ProfileCard({
  displayName,
  username,
  avatarUrl,
  essenceStrength = 0,
  totalQuestions = 0,
  updatedAt,
}: ProfileCardProps) {
  return (
    <div className="text-center space-y-6 animate-drift-up">
      {/* Avatar with holographic ring */}
      <div className="relative inline-block">
        <Avatar src={avatarUrl} name={displayName} size="lg" />
        {/* Orbiting ring */}
        <div className="absolute -inset-3 rounded-full border border-teal-glow/10 animate-border-glow" />
        <div className="absolute -inset-5 rounded-full border border-amber-glow/5" />
        {/* Status dot */}
        <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-teal-glow/80 shadow-[0_0_10px_rgba(0,180,190,0.4)]" style={{ animation: "pulse-teal 3s infinite" }} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-amber-pale tracking-wide">{displayName}</h1>
        <p className="font-mono text-[11px] tracking-[0.3em] text-teal-glow/40 uppercase mt-1">
          @{username}
        </p>
      </div>

      {/* Updated timestamp */}
      {updatedAt && (
        <p className="font-mono text-[10px] tracking-[0.2em] text-teal-glow/30">
          Updated {formatUpdatedAt(updatedAt)}
        </p>
      )}

      {/* Stats bar */}
      <div className="flex justify-center gap-8">
        <div className="glass-panel rounded-sm px-5 py-3">
          <p className="font-mono text-[9px] tracking-[0.3em] text-amber-glow/40 uppercase mb-1">
            Essence
          </p>
          <div className="flex items-center gap-3">
            <div className="w-20 h-[3px] bg-[#1a1510] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${essenceStrength}%`,
                  background: `linear-gradient(90deg, rgba(232,145,42,0.6), rgba(0,180,190,0.8))`,
                  boxShadow: "0 0 8px rgba(0,180,190,0.3)",
                }}
              />
            </div>
            <span className="font-mono text-[11px] text-teal-pale/60">{essenceStrength}%</span>
          </div>
        </div>
        <div className="glass-panel rounded-sm px-5 py-3">
          <p className="font-mono text-[9px] tracking-[0.3em] text-amber-glow/40 uppercase mb-1">
            Queries
          </p>
          <p className="font-mono text-lg text-amber-pale/80">{totalQuestions}</p>
        </div>
      </div>
    </div>
  );
}
