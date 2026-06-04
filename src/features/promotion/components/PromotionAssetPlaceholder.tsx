import { localAssetUrl, type LocalAssetKey } from "@/lib/assets";

import type { TalentLevel } from "../types";
import { promotionAvatarTone, promotionIconTones, talentBadgeAssetKeyByLevel } from "../theme/talent-theme";

export function PromotionAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-full bg-fill-white ${className}`}>
      <div className="absolute inset-[6px] rounded-full" style={{ background: promotionAvatarTone.face }} />
      <div className="absolute left-1/2 top-[10px] size-[20px] -translate-x-1/2 rounded-full" style={{ background: promotionAvatarTone.hair }} />
      <div className="absolute bottom-[6px] left-1/2 h-[24px] w-[34px] -translate-x-1/2 rounded-t-full bg-fill-white" />
      <div className="absolute left-[18px] top-[17px] h-[10px] w-[4px] rounded-full" style={{ background: promotionAvatarTone.eye }} />
      <div className="absolute right-[18px] top-[17px] h-[10px] w-[4px] rounded-full" style={{ background: promotionAvatarTone.eye }} />
      <div className="absolute left-1/2 top-[31px] h-[2px] w-[12px] -translate-x-1/2 rounded-full" style={{ background: promotionAvatarTone.mouth }} />
    </div>
  );
}

export function TalentBadge({
  assetKey,
  level,
  className = ""
}: {
  assetKey?: LocalAssetKey;
  level: TalentLevel;
  className?: string;
}) {
  const src = localAssetUrl(assetKey ?? talentBadgeAssetKeyByLevel[level]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- localAssetUrl can resolve to versioned basePath or external asset CDN.
    <img
      alt={`达人徽章 ${level.toUpperCase()}`}
      className={`block object-contain ${className}`}
      draggable={false}
      height={348}
      src={src}
      width={348}
    />
  );
}

export function PromotionIcon({ iconKey, className = "" }: { iconKey: string; className?: string }) {
  const tone = promotionIconTones[iconKey] ?? { background: "rgb(var(--mm-color-fill-muted))", foreground: "rgb(var(--mm-color-text-muted))", mark: "·" };

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
