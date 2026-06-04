import { AppScreen, Button, Skeleton, StateView } from "@/design-system";

export function PromotionEmptyState({ title = "暂无数据", description = "稍后再来看看" }) {
  return (
    <StateView
      className="min-h-[180px]"
      description={description}
      title={title}
    />
  );
}

export function PromotionErrorState({ title = "页面加载失败", description = "请稍后重试" }) {
  return (
    <AppScreen className="px-4 pt-[calc(env(safe-area-inset-top)+48px)]">
      <StateView
        action={<Button variant="secondary">重试</Button>}
        className="min-h-[320px]"
        description={description}
        title={title}
      />
    </AppScreen>
  );
}

export function PromotionLoadingState() {
  return (
    <AppScreen className="px-3 pt-[calc(env(safe-area-inset-top)+56px)]">
      <div className="mx-auto max-w-[430px] space-y-3">
        <Skeleton className="h-[120px] rounded-sheet bg-fill-white/80" />
        <div className="grid grid-cols-2 gap-[10px]">
          <Skeleton className="h-[72px] rounded-card bg-fill-white" />
          <Skeleton className="h-[72px] rounded-card bg-fill-white" />
        </div>
        <Skeleton className="h-[160px] rounded-card bg-fill-white" />
        <Skeleton className="h-[120px] rounded-card bg-fill-white" />
      </div>
    </AppScreen>
  );
}
