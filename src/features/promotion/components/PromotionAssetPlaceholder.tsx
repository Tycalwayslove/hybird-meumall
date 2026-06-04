import type { TalentLevel } from "../types";

const badgeTone: Record<TalentLevel, { background: string; shadow: string; text: string }> = {
  v1: {
    background: "linear-gradient(145deg, #FFE9D8 0%, #C56A46 100%)",
    shadow: "0 10px 24px rgba(165, 73, 73, 0.3)",
    text: "#FFFFFF"
  },
  v2: {
    background: "linear-gradient(145deg, #EAF7FF 0%, #5D9CF2 100%)",
    shadow: "0 10px 24px rgba(23, 35, 124, 0.3)",
    text: "#FFFFFF"
  },
  v3: {
    background: "linear-gradient(145deg, #FFF7CF 0%, #F29A25 100%)",
    shadow: "0 10px 24px rgba(230, 146, 96, 0.38)",
    text: "#FFFFFF"
  },
  v4: {
    background: "linear-gradient(145deg, #E9DBFF 0%, #7F3DDF 100%)",
    shadow: "0 10px 24px rgba(46, 5, 90, 0.3)",
    text: "#FFFFFF"
  },
  v5: {
    background: "linear-gradient(145deg, #FFE68C 0%, #5631D7 48%, #230458 100%)",
    shadow: "0 12px 28px rgba(11, 0, 34, 0.4)",
    text: "#FFFFFF"
  }
};

const iconTone: Record<string, { background: string; foreground: string; mark: string }> = {
  "promotion-gift": { background: "#FFF1F1", foreground: "#FF5D82", mark: "礼" },
  "promotion-rank": { background: "#FFF7EB", foreground: "#F5B51B", mark: "榜" },
  "promotion-tool-product": { background: "#EAFBF3", foreground: "#10B86F", mark: "品" },
  "promotion-tool-guide": { background: "#EEF7FF", foreground: "#66A8F8", mark: "攻" },
  "promotion-tool-analytics": { background: "#FFF0F6", foreground: "#F66AA5", mark: "析" },
  "promotion-tool-card": { background: "#EAFBF3", foreground: "#10B86F", mark: "卡" },
  "benefit-money": { background: "rgba(255,229,192,0.18)", foreground: "#FFD9A8", mark: "佣" },
  "benefit-discount": { background: "rgba(255,229,192,0.18)", foreground: "#FFD9A8", mark: "折" },
  "benefit-cake": { background: "rgba(255,229,192,0.18)", foreground: "#FFD9A8", mark: "礼" },
  "benefit-coupon": { background: "rgba(255,229,192,0.18)", foreground: "#FFD9A8", mark: "券" },
  "benefit-gift": { background: "rgba(255,229,192,0.18)", foreground: "#FFD9A8", mark: "活" },
  "benefit-agent": { background: "rgba(255,255,255,0.12)", foreground: "#FFE1B7", mark: "AI" },
  "benefit-box": { background: "rgba(255,255,255,0.12)", foreground: "#FFE1B7", mark: "商" },
  "benefit-bag": { background: "rgba(255,255,255,0.12)", foreground: "#FFE1B7", mark: "训" },
  "benefit-ai": { background: "rgba(255,255,255,0.12)", foreground: "#FFE1B7", mark: "AI" }
};

export function PromotionAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-full bg-white ${className}`}>
      <div className="absolute inset-[6px] rounded-full bg-[linear-gradient(180deg,#FFE0C9,#FFFFFF)]" />
      <div className="absolute left-1/2 top-[10px] size-[20px] -translate-x-1/2 rounded-full bg-[#1E1E1E]" />
      <div className="absolute bottom-[6px] left-1/2 h-[24px] w-[34px] -translate-x-1/2 rounded-t-full bg-white" />
      <div className="absolute left-[18px] top-[17px] h-[10px] w-[4px] rounded-full bg-[#141414]" />
      <div className="absolute right-[18px] top-[17px] h-[10px] w-[4px] rounded-full bg-[#141414]" />
      <div className="absolute left-1/2 top-[31px] h-[2px] w-[12px] -translate-x-1/2 rounded-full bg-[#EF8F77]" />
    </div>
  );
}

export function TalentBadge({ level, className = "" }: { level: TalentLevel; className?: string }) {
  const tone = badgeTone[level];
  const number = level.slice(1);

  return (
    <div className={`relative ${className}`} aria-label={`达人徽章 ${level.toUpperCase()}`}>
      <div
        className="absolute inset-[9%] rotate-45 rounded-[26%]"
        style={{ background: tone.background, boxShadow: tone.shadow }}
      />
      <div className="absolute inset-[23%] rotate-45 rounded-[22%] border-[6px] border-white/40" />
      <div className="absolute inset-[18%] rounded-full bg-white/20 blur-[6px]" />
      <span
        className="absolute bottom-[20%] right-[17%] font-black italic leading-none"
        style={{ color: tone.text, fontSize: "clamp(24px, 8vw, 42px)", textShadow: "0 2px 5px rgba(0,0,0,0.25)" }}
      >
        {number}
      </span>
      <span className="absolute left-[25%] top-[34%] h-[28%] w-[52%] rotate-[-18deg] rounded-full bg-white/35" />
    </div>
  );
}

export function PromotionIcon({ iconKey, className = "" }: { iconKey: string; className?: string }) {
  const tone = iconTone[iconKey] ?? { background: "#F3F3F3", foreground: "#737373", mark: "·" };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[12px] ${className}`}
      style={{ background: tone.background, color: tone.foreground }}
      aria-hidden="true"
    >
      <span className="text-[13px] font-black leading-none">{tone.mark}</span>
    </span>
  );
}
