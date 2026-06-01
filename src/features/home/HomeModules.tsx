import Link from "next/link";
import { ReplicaIcon, ReplicaImage } from "@/components/commerce/ReplicaShell";
import { featuredProducts } from "@/lib/commerce/mock-data";
import { isCartTarget } from "./api";
import type {
  ActivityItem,
  ActivitySectionModule,
  BannerCarouselModule,
  CategoryGridModule,
  HomeEvent,
  HomeModule,
  SupportedHomeModule
} from "./types";

type HomeModulesProps = {
  modules: HomeModule[];
  now?: Date;
};

const iconColors = [
  "bg-[#f6f6f8]",
  "bg-[#f7f7f9]",
  "bg-[#f6f6f8]",
  "bg-[#f7f7f9]",
  "bg-[#f6f6f8]",
  "bg-[#f7f7f9]",
  "bg-[#f6f6f8]",
  "bg-[#f7f7f9]",
  "bg-[#f6f6f8]",
  "bg-[#f7f7f9]"
];

export function HomeModules({ modules, now = new Date() }: HomeModulesProps) {
  return (
    <>
      {getVisibleHomeModules(modules, now)
        .map((module) => renderHomeModule(module))
        .filter(Boolean)}
      <FeaturedProducts />
    </>
  );
}

export function getVisibleHomeModules(modules: HomeModule[], now = new Date()): SupportedHomeModule[] {
  return modules
    .filter((module) => module.enabled)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .flatMap((module) => normalizeSupportedModule(module, now));
}

export function getHomePreloadImages(modules: HomeModule[], count: number): string[] {
  if (count <= 0) {
    return [];
  }

  return getVisibleHomeModules(modules)
    .flatMap((module) => {
      if (module.type === "banner_carousel") {
        return module.items.map((item) => item.imageUrl);
      }

      if (module.type === "activity_section") {
        return module.items.flatMap((item) => (item.imageUrl ? [item.imageUrl] : []));
      }

      return [];
    })
    .filter((url) => url.startsWith("http://") || url.startsWith("https://"))
    .slice(0, count);
}

function normalizeSupportedModule(module: HomeModule, now: Date): SupportedHomeModule[] {
  if (module.type === "banner_carousel" && isBannerModule(module)) {
    const items = module.items.filter((item) => item.enabled && item.imageUrl && !isCartTarget(item.event?.target)).sort(bySortOrder);
    return items.length > 0 ? [{ ...module, items }] : [];
  }

  if (module.type === "category_grid" && isCategoryModule(module)) {
    const columns = clamp(Math.trunc(module.columns), 2, 5);
    const rows = clamp(Math.trunc(module.rows), 1, 3);
    const items = module.items
      .filter((item) => item.enabled && item.name && !isCartTarget(item.event?.target))
      .sort(bySortOrder)
      .slice(0, columns * rows);

    return items.length > 0 ? [{ ...module, columns, rows, items }] : [];
  }

  if (module.type === "activity_section" && isActivityModule(module)) {
    const items = module.items
      .filter((item) => item.enabled && isActivityInWindow(item, now) && !isCartTarget(item.event?.target))
      .sort(bySortOrder);

    return items.length > 0 ? [{ ...module, items }] : [];
  }

  return [];
}

function renderHomeModule(module: SupportedHomeModule) {
  if (module.type === "banner_carousel") {
    return <BannerModule key={module.id} module={module} />;
  }

  if (module.type === "category_grid") {
    return <CategoryModule key={module.id} module={module} />;
  }

  if (module.type === "activity_section") {
    return <ActivityModule key={module.id} module={module} />;
  }

  return null;
}

function BannerModule({ module }: { module: BannerCarouselModule }) {
  const firstItem = module.items[0];
  const href = getEventHref(firstItem.event) ?? "/promotion";
  const useFallbackArt = firstItem.imageUrl.startsWith("fallback://");

  return (
    <Link href={href} className="mt-5 block" aria-label={firstItem.alt ?? firstItem.title}>
      <div
        className="relative h-24 overflow-hidden rounded-[8px] bg-[linear-gradient(110deg,#dfff55_0%,#f7ff76_40%,#fff8b8_68%,#bcfb6c_100%)]"
        style={useFallbackArt ? undefined : { backgroundImage: `linear-gradient(110deg,rgba(223,255,85,0.86),rgba(247,255,118,0.66),rgba(188,251,108,0.72)), url("${firstItem.imageUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {useFallbackArt ? (
          <>
            <div className="absolute left-4 top-4 rotate-[-6deg] text-[30px] font-black leading-[28px] text-[#111] drop-shadow-[0_2px_0_rgba(255,255,255,0.9)]">
              续航
              <br />
              一套D计划
            </div>
            <div className="absolute bottom-3 left-5 rounded-full bg-white/80 px-3 py-0.5 text-[11px] font-bold">精绩春光，温腻相伴</div>
            <div className="absolute right-5 top-2 size-[clamp(58px,18vw,70px)] rounded-[22px] bg-[#4ca9ff] shadow-[0_12px_22px_rgba(71,156,255,0.25)]" />
            <div className="absolute right-[clamp(68px,21vw,82px)] top-7 h-7 w-12 rotate-[-24deg] rounded-full bg-[#ffe86b]" />
            <div className="absolute bottom-3 right-12 size-8 rounded-full bg-[#ffb335]" />
          </>
        ) : (
          <div className="absolute inset-0 px-4 py-4">
            <p className="max-w-[70%] text-[24px] font-black leading-[28px] text-[#111] drop-shadow-[0_2px_0_rgba(255,255,255,0.88)]">
              {firstItem.title}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

function CategoryModule({ module }: { module: CategoryGridModule }) {
  return (
    <section className="mt-4 grid gap-x-0 gap-y-3" style={{ gridTemplateColumns: `repeat(${module.columns}, minmax(0, 1fr))` }}>
      {module.items.map((item, index) => {
        const href = getEventHref(item.event) ?? "/category";
        const useIconImage = item.iconUrl && !item.iconUrl.startsWith("fallback://");

        return (
          <Link key={item.id} href={href} className="flex min-w-0 flex-col items-center">
            {useIconImage ? (
              <span
                className={`inline-flex size-[clamp(38px,12vw,50px)] shrink-0 items-center justify-center rounded-[12px] bg-cover bg-center text-[13px] font-black text-[#111] ${iconColors[index % iconColors.length]}`}
                style={{ backgroundImage: `url("${item.iconUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }}
              >
                {item.name.slice(0, 1)}
              </span>
            ) : (
              <ReplicaIcon className={`size-[clamp(38px,12vw,50px)] ${iconColors[index % iconColors.length]}`}>
                <span className="text-[13px] font-black text-[#111]">{item.name.slice(0, 1)}</span>
              </ReplicaIcon>
            )}
            <span className="mt-2 whitespace-nowrap text-center text-[12px] leading-[18px] text-[#333]">{item.name}</span>
          </Link>
        );
      })}
    </section>
  );
}

function ActivityModule({ module }: { module: ActivitySectionModule }) {
  const items = module.items.slice(0, 2);

  return (
    <section className="mt-4 grid grid-cols-2 gap-2.5" aria-label={module.title}>
      {items.map((item, index) => {
        const href = getEventHref(item.event) ?? "/promotion";
        const isFirst = index === 0;

        return (
          <Link
            key={item.id}
            href={href}
            className={`relative h-[68px] overflow-hidden rounded-[10px] px-3 py-3 ${
              isFirst ? "bg-[linear-gradient(105deg,#fff7f4,#ffe5e8)]" : "bg-[linear-gradient(105deg,#fff9ec,#fff1cc)]"
            }`}
          >
            <p className="relative z-10 text-[18px] font-black leading-[22px] max-[340px]:text-[16px]">{item.title}</p>
            {item.subtitle ? <p className="relative z-10 mt-1 text-[14px] leading-[18px] text-[#6f6f6f] max-[340px]:text-[12px]">{item.subtitle}</p> : null}
            {isFirst ? (
              <>
                <span className="absolute right-2 top-2 size-[clamp(34px,12vw,46px)] rotate-[-12deg] rounded-[12px] bg-[#ff4b73] shadow-[0_8px_18px_rgba(255,75,115,0.25)]" />
                <span className="absolute right-[clamp(30px,11vw,42px)] top-1 h-4 w-10 rotate-[-18deg] rounded-full bg-[#ff9ab0]" />
              </>
            ) : (
              <>
                <span className="absolute right-3 top-3 size-[clamp(34px,11vw,44px)] rounded-full bg-[#ffb03b]" />
                {item.badge ? <span className="absolute right-1 top-2 rotate-[16deg] rounded-full bg-[#ff5572] px-1.5 py-1 text-[10px] font-black text-white">{item.badge}</span> : null}
              </>
            )}
          </Link>
        );
      })}
    </section>
  );
}

function FeaturedProducts() {
  const recommendedProducts = featuredProducts.slice(0, 2);

  return (
    <section className="mt-4 rounded-t-[12px] bg-white px-2 pb-4 pt-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="flex size-[18px] items-center justify-center rounded-[5px] bg-[#7eed2f]">
            <span className="size-[10px] rounded-full bg-[#111]" />
          </span>
          <h2 className="text-[18px] font-black">为您推荐</h2>
        </div>
        <Link href="/category" className="flex items-center gap-1 text-[14px] font-medium">
          更多
          <span className="flex size-[14px] items-center justify-center rounded-full bg-[#111] text-[9px] text-white">›</span>
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {recommendedProducts.map((product, index) => (
          <Link key={product.id} href={product.href} className="overflow-hidden rounded-[7px] bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <ReplicaImage className="h-[clamp(138px,45vw,174px)] rounded-none bg-[#d7d1c2]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,#f4f4f0_0_22%,transparent_23%),linear-gradient(180deg,#8d9f67_0%,#e6dbc6_100%)]" />
              <span className="absolute left-1 top-1 rounded-[3px] bg-[#111] px-1 text-[10px] font-bold leading-[16px] text-[#fbf347]">
                {index === 0 ? "热卖" : "推荐"}
              </span>
            </ReplicaImage>
            <div className="px-2 pb-2 pt-1.5">
              <p className="line-clamp-2 text-[14px] font-bold leading-[18px]">夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...</p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <span className="rounded-[3px] bg-[#111] px-1 text-[10px] font-bold leading-[16px] text-white">喵呜达人</span>
                <span className="rounded-[3px] bg-[#97f341] px-1 text-[10px] font-bold leading-[16px]">V2</span>
                <span className="text-[11px] text-[#8a8a8a]">已售 2300</span>
              </div>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-[13px] font-bold text-[#ff3f5f]">¥</span>
                <span className="text-[20px] font-black leading-[22px] text-[#ff3f5f]">{index === 0 ? "368" : "928"}</span>
                <span className="text-[14px] text-[#a7a7a7] line-through">¥998</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function getEventHref(event: HomeEvent | undefined): string | undefined {
  if (!event || isCartTarget(event.target)) {
    return undefined;
  }

  if (event.type === "h5_route" && event.target.startsWith("/")) {
    return event.target;
  }

  if (event.type === "external_url" && event.target.startsWith("https://")) {
    return event.target;
  }

  return undefined;
}

function isActivityInWindow(item: ActivityItem, now: Date): boolean {
  const currentTime = now.getTime();
  const startsAt = item.startsAt ? Date.parse(item.startsAt) : undefined;
  const endsAt = item.endsAt ? Date.parse(item.endsAt) : undefined;

  if (typeof startsAt === "number" && Number.isFinite(startsAt) && currentTime < startsAt) {
    return false;
  }

  if (typeof endsAt === "number" && Number.isFinite(endsAt) && currentTime > endsAt) {
    return false;
  }

  return true;
}

function isBannerModule(module: HomeModule): module is BannerCarouselModule {
  return module.type === "banner_carousel" && Array.isArray((module as BannerCarouselModule).items);
}

function isCategoryModule(module: HomeModule): module is CategoryGridModule {
  return module.type === "category_grid" && typeof (module as CategoryGridModule).columns === "number" && typeof (module as CategoryGridModule).rows === "number" && Array.isArray((module as CategoryGridModule).items);
}

function isActivityModule(module: HomeModule): module is ActivitySectionModule {
  return module.type === "activity_section" && typeof (module as ActivitySectionModule).title === "string" && Array.isArray((module as ActivitySectionModule).items);
}

function bySortOrder(left: { sortOrder: number }, right: { sortOrder: number }) {
  return left.sortOrder - right.sortOrder;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
