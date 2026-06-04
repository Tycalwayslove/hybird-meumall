export function PromotionEmptyState({ title = "暂无数据", description = "稍后再来看看" }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[12px] bg-white px-6 text-center">
      <div className="size-12 rounded-[14px] bg-[#F2F3F5]" />
      <p className="mt-4 text-[15px] font-semibold text-[#0F0F0F]">{title}</p>
      <p className="mt-2 text-[13px] leading-5 text-[#86909C]">{description}</p>
    </div>
  );
}

export function PromotionErrorState({ title = "页面加载失败", description = "请稍后重试" }) {
  return (
    <main className="min-h-screen bg-[#F7F9FB] px-4 pt-[calc(env(safe-area-inset-top)+48px)] text-[#0F0F0F]">
      <div className="mx-auto flex min-h-[320px] max-w-[430px] flex-col items-center justify-center rounded-[12px] bg-white px-6 text-center">
        <div className="size-12 rounded-[14px] bg-[#FFECE8]" />
        <h1 className="mt-4 text-[17px] font-semibold">{title}</h1>
        <p className="mt-2 text-[13px] leading-5 text-[#86909C]">{description}</p>
        <button className="mt-5 h-10 rounded-[999px] bg-[#0F0F0F] px-5 text-[14px] font-semibold text-white" type="button">
          重试
        </button>
      </div>
    </main>
  );
}

export function PromotionLoadingState() {
  return (
    <main className="min-h-screen bg-[#F7F9FB] px-3 pt-[calc(env(safe-area-inset-top)+56px)]">
      <div className="mx-auto max-w-[430px] space-y-3">
        <div className="h-[120px] animate-pulse rounded-[18px] bg-white/80" />
        <div className="grid grid-cols-2 gap-[10px]">
          <div className="h-[72px] animate-pulse rounded-[12px] bg-white" />
          <div className="h-[72px] animate-pulse rounded-[12px] bg-white" />
        </div>
        <div className="h-[160px] animate-pulse rounded-[12px] bg-white" />
        <div className="h-[120px] animate-pulse rounded-[12px] bg-white" />
      </div>
    </main>
  );
}
