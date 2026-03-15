"use client";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export default function Avatar({ src, name, size = "md" }: AvatarProps) {
  const sizes = {
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-3xl",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <div className={`${sizes[size]} relative rounded-full overflow-hidden mx-auto`}>
        <img src={src} alt={name} className="w-full h-full object-cover" />
        {/* Holographic overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-teal-glow/10 to-transparent mix-blend-overlay" />
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-teal-glow/20" />
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-[#1a1510] to-[#0a1518] flex items-center justify-center font-mono font-medium text-amber-pale/60 mx-auto border border-amber-glow/15 shadow-[0_0_20px_rgba(232,145,42,0.08)]`}
    >
      {initials}
    </div>
  );
}
