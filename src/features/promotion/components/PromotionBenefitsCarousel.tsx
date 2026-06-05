"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState, type TouchEvent } from "react";

import { cn } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";

import { benefitsTheme } from "../theme/promotion-page-theme";
import { equityArrowAssetKeys, equityHeroBackgroundAssetKeyByLevel } from "../theme/talent-theme";
import type { PromotionBenefitsData, TalentLevel } from "../types";
import { PromotionAvatar, PromotionIcon, TalentBadge } from "./PromotionAssetPlaceholder";

gsap.registerPlugin(useGSAP);

const orderedLevels: TalentLevel[] = ["v1", "v2", "v3", "v4", "v5"];
const swipeThreshold = 38;
const levelTrackPoints = [
  { left: "6%", top: 4, gradientOffset: 6 },
  { left: "28%", top: 13, gradientOffset: 28 },
  { left: "50%", top: 17, gradientOffset: 50 },
  { left: "72%", top: 13, gradientOffset: 72 },
  { left: "94%", top: 4, gradientOffset: 94 }
] as const;

type SwitchDirection = "next" | "prev";

export function PromotionBenefitsCarousel({
  initialLevel,
  levels
}: {
  initialLevel: TalentLevel;
  levels: PromotionBenefitsData[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const directionRef = useRef<SwitchDirection>("next");
  const [activeLevel, setActiveLevel] = useState<TalentLevel>(initialLevel);

  const dataByLevel = useMemo(
    () => new Map(levels.map((item) => [item.profile.level, item] as const)),
    [levels]
  );
  const activeData = dataByLevel.get(activeLevel) ?? levels[0];
  const activeIndex = orderedLevels.indexOf(activeData.profile.level);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const direction = directionRef.current === "next" ? 1 : -1;
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      gsap.killTweensOf(".equity-level-active-dot");
      gsap.killTweensOf(".equity-content-section");

      timeline
        .fromTo(
          ".equity-animated-hero",
          { autoAlpha: 0, x: 20 * direction },
          { autoAlpha: 1, x: 0, duration: 0.36 }
        )
        .fromTo(
          ".equity-badge",
          { autoAlpha: 0, scale: 0.88, y: 16 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.42 },
          "<0.04"
        )
        .fromTo(
          ".equity-level-track",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.28 },
          "<0.08"
        )
        .fromTo(
          ".equity-track-path",
          { strokeDasharray: "0 520" },
          { strokeDasharray: "520 0", duration: 0.46 },
          "<"
        )
        .fromTo(
          ".equity-level-active-dot",
          { scale: 0.72 },
          { scale: 1, duration: 0.28, ease: "back.out(2)" },
          "<0.12"
        )
        .fromTo(
          ".equity-content-section",
          { autoAlpha: 0.92, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out" },
          "<0.08"
        );
    },
    { dependencies: [activeLevel], scope: rootRef }
  );

  const switchTo = useCallback(
    (level: TalentLevel, direction: SwitchDirection) => {
      if (level === activeLevel) {
        return;
      }

      directionRef.current = direction;
      setActiveLevel(level);

      const url = new URL(window.location.href);
      url.searchParams.set("level", level);
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    },
    [activeLevel]
  );

  const switchBy = useCallback(
    (direction: SwitchDirection) => {
      const nextIndex =
        direction === "next"
          ? Math.min(orderedLevels.length - 1, activeIndex + 1)
          : Math.max(0, activeIndex - 1);
      switchTo(orderedLevels[nextIndex], direction);
    },
    [activeIndex, switchTo]
  );

  const onTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const startX = touchStartXRef.current;
      touchStartXRef.current = null;
      if (startX === null) {
        return;
      }

      const endX = event.changedTouches[0]?.clientX ?? startX;
      const distance = endX - startX;
      if (Math.abs(distance) < swipeThreshold) {
        return;
      }

      switchBy(distance < 0 ? "next" : "prev");
    },
    [switchBy]
  );

  if (!activeData) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="min-h-screen text-text-inverse"
      style={{ background: benefitsTheme.pageBackground }}
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
    >
      <HeroSection
        activeIndex={activeIndex}
        data={activeData}
        onNext={() => switchBy("next")}
        onPrev={() => switchBy("prev")}
        onSwitch={switchTo}
      />
      <ContentSection data={activeData} />
    </div>
  );
}

function HeroSection({
  activeIndex,
  data,
  onNext,
  onPrev,
  onSwitch
}: {
  activeIndex: number;
  data: PromotionBenefitsData;
  onNext: () => void;
  onPrev: () => void;
  onSwitch: (level: TalentLevel, direction: SwitchDirection) => void;
}) {
  const { profile, theme } = data;
  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= orderedLevels.length - 1;
  const progressRatio = Math.min(100, (profile.progress.current / profile.progress.target) * 100);
  const heroBg = localAssetUrl(equityHeroBackgroundAssetKeyByLevel[profile.level]);

  return (
    <section
      className="relative min-h-[434px] overflow-hidden px-4 pt-[var(--meu-top-bar-height)]"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%"
      }}
    >
      <div className="equity-animated-hero relative mt-4 flex items-center gap-[10px]">
        <PromotionAvatar className="size-12" />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="truncate text-[17px] font-black leading-6">{profile.nickname}</p>
            <span
              className="rounded-pill bg-fill-white px-1.5 py-[3px] text-[11px] font-black leading-none"
              style={{ color: theme.summaryTextColor }}
            >
              {profile.level.toUpperCase()}
              {profile.levelName}
            </span>
          </div>
          <div className="mt-[6px] h-[5px] w-[200px] overflow-hidden rounded-pill bg-fill-white/20">
            <div
              className="h-full rounded-pill"
              style={{ width: `${progressRatio}%`, background: theme.progressColor }}
            />
          </div>
          <p className="mt-[3px] text-[11px] font-semibold text-text-inverse/70">
            {profile.progress.current}/{profile.progress.target}
          </p>
        </div>
      </div>

      <div className="relative mt-7 flex min-h-[136px] items-center justify-center">
        <ArrowButton direction="prev" disabled={isFirst} onClick={onPrev} />
        <TalentBadge
          assetKey={theme.badgeAssetKey}
          className="equity-badge relative z-[2] size-[132px] will-change-transform"
          level={profile.level}
        />
        <ArrowButton direction="next" disabled={isLast} onClick={onNext} />
        {profile.progress.unlockText ? (
          <span className="absolute right-[calc(50%_-_118px)] top-1 rounded-pill bg-text-primary/24 px-2 py-1 text-[12px] font-semibold">
            {profile.progress.unlockText}
          </span>
        ) : null}
      </div>

      <p className="equity-animated-hero relative mt-3 text-center text-[14px] leading-6 text-text-inverse">
        {profile.progress.nextTip}
      </p>

      <LevelTrack activeIndex={activeIndex} accentColor={theme.progressColor} onSwitch={onSwitch} />
    </section>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick
}: {
  direction: SwitchDirection;
  disabled: boolean;
  onClick: () => void;
}) {
  const src = localAssetUrl(direction === "next" ? equityArrowAssetKeys.next : equityArrowAssetKeys.prev);
  const label = direction === "next" ? "切换到下一档权益" : "切换到上一档权益";
  const positionClass = direction === "next" ? "right-2" : "left-2";

  return (
    <button
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-[3] flex h-12 w-9 -translate-y-1/2 items-center justify-center transition-opacity active:opacity-70",
        positionClass,
        disabled ? "pointer-events-none opacity-20" : "opacity-100"
      )}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local PNG arrow is registered through localAssetUrl for versioned basePath support. */}
      <img alt="" className="h-[34px] w-[19px] object-contain" draggable={false} height={67} src={src} width={37} />
    </button>
  );
}

function LevelTrack({
  activeIndex,
  accentColor,
  onSwitch
}: {
  activeIndex: number;
  accentColor: string;
  onSwitch: (level: TalentLevel, direction: SwitchDirection) => void;
}) {
  const gradientId = `equity-track-gradient-${activeIndex}`;

  return (
    <div className="equity-level-track relative mx-[-10px] mt-4 h-[92px] will-change-transform">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[48px] w-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 360 52"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="49.29%" stopColor="rgba(255,255,255,0.48)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <path
          className="equity-track-path"
          d="M8 13 C88 34 272 34 352 13"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
      {orderedLevels.map((level, index) => {
        const isActive = index === activeIndex;
        const point = levelTrackPoints[index];
        const itemColor = isActive ? accentColor : "rgb(var(--mm-color-text-inverse))";
        return (
          <button
            key={level}
            className="absolute flex w-[58px] -translate-x-1/2 flex-col items-center text-center"
            style={{ left: point.left, top: point.top }}
            type="button"
            onClick={() => onSwitch(level, index > activeIndex ? "next" : "prev")}
          >
            <span
              className={cn(
                "flex size-[17px] items-center justify-center rounded-full",
                isActive ? "equity-level-active-dot" : ""
              )}
              style={{
                background: isActive ? `${accentColor}36` : "rgba(255,255,255,0.14)"
              }}
            >
              <span
                className="block size-[11px] rounded-full"
                style={{ background: itemColor }}
              />
            </span>
            <span
              className={cn(
                "equity-level-label mt-[5px] text-[13px] leading-[15px] transition-[color,transform] duration-200 ease-out",
                isActive ? "translate-y-0 font-black" : "translate-y-px font-semibold"
              )}
              style={{ color: itemColor }}
            >
              {level.toUpperCase()}
            </span>
            <span
              aria-hidden={!isActive}
              className={cn(
                "equity-level-current mt-[2px] h-[14px] text-[10px] font-semibold leading-[14px] transition-[color,opacity,transform] duration-200 ease-out",
                isActive ? "translate-y-0" : "translate-y-1"
              )}
              style={{
                color: itemColor,
                opacity: isActive ? 1 : 0
              }}
            >
              当前等级
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ContentSection({ data }: { data: PromotionBenefitsData }) {
  const { profile } = data;

  return (
    <section
      className="equity-content-section relative z-[2] -mt-4 rounded-t-[20px] px-4 pb-8 pt-7 will-change-transform"
      style={{ background: benefitsTheme.contentBackground }}
    >
      <BenefitSection title={`${profile.level.toUpperCase()}${profile.levelName}专属特权`} items={data.exclusiveBenefits} />
      <div className="mt-5" />
      <BenefitSection title="喵呜达人会员特权" items={data.memberBenefits} />
      <div className="mt-5 rounded-[14px] bg-fill-white/[0.06] p-4">
        <p className="text-[14px] font-semibold text-text-inverse/90">达人定位</p>
        <p className="mt-2 text-[13px] leading-5 text-text-inverse/60">{data.persona}</p>
        <p className="mt-2 text-[13px] leading-5 text-text-inverse/60">佣金分成：{data.commission.label}</p>
      </div>
    </section>
  );
}

function BenefitSection({
  title,
  items
}: {
  title: string;
  items: PromotionBenefitsData["exclusiveBenefits"];
}) {
  return (
    <section>
      <h2 className="flex items-center justify-center gap-2 text-center text-[16px] font-black leading-6">
        <span className="h-px w-[14px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${benefitsTheme.dividerColor} 100%)` }} />
        {title}
        <span className="h-px w-[14px]" style={{ background: `linear-gradient(90deg, ${benefitsTheme.dividerColor} 0%, transparent 100%)` }} />
      </h2>
      <div className="mt-[14px] space-y-5 rounded-[14px] bg-fill-white/[0.06] px-[14px] py-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-[13px]">
            <PromotionIcon className="size-[38px]" iconKey={item.iconKey} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-5 text-text-inverse/90">{item.title}</p>
              <p className="mt-[2px] truncate text-[12px] leading-5 text-text-inverse/50">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
