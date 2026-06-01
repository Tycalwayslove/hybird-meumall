import Link from "next/link";
import { ReplicaIcon, ReplicaShell } from "@/components/commerce/ReplicaShell";

const tools = [
  { label: "商品推广", href: "/promotion/products", color: "bg-[#22c873]" },
  { label: "赚钱攻略", href: "/promotion/benefits", color: "bg-[#69bfff]" },
  { label: "访客分析", href: "/promotion/ranking", color: "bg-[#ff75b6]" },
  { label: "推广名片", href: "/promotion/card", color: "bg-[#20c873]" }
];

export default function PromotionPage() {
  return (
    <ReplicaShell className="bg-[#f5f6f8]">
      <div className="relative min-h-screen overflow-hidden bg-[#f5f6f8] pb-8">
        <div className="absolute inset-x-0 top-0 h-[268px] bg-[linear-gradient(130deg,#fff2d0_0%,#ffd890_44%,#fff7d7_72%,#ffe0a6_100%)]" />
        <div className="absolute left-0 top-0 size-[210px] rounded-full bg-white/20 blur-[1px]" />
        <div className="relative px-3 pt-[58px]">
          <section className="flex items-center">
            <div className="size-[58px] shrink-0 overflow-hidden rounded-full bg-[#f1dbc7] ring-4 ring-white">
              <div className="mx-auto mt-2 size-[38px] rounded-full bg-[#111]" />
              <div className="mx-auto h-8 w-11 rounded-t-full bg-white" />
            </div>
            <div className="ml-3 min-w-0">
              <h1 className="truncate text-[21px] font-black leading-[26px]">深圳喵小猫</h1>
              <div className="mt-1 h-2 w-[92px] rounded-full bg-white" />
              <p className="mt-1 text-[12px] leading-[16px] text-[#ffac16]">238/500</p>
            </div>
            <Link href="/promotion/level" className="relative ml-auto mr-1 size-[clamp(88px,28vw,116px)] shrink-0">
              <div className="absolute inset-[10px] rotate-45 rounded-[24px] bg-[linear-gradient(135deg,#ffc75a,#ffe6a1,#f4a21d)] shadow-[0_12px_28px_rgba(211,132,21,0.26)]" />
              <div className="absolute inset-[26px] rotate-45 rounded-[16px] border-[6px] border-white/40" />
              <span className="absolute bottom-7 right-2 text-[32px] font-black italic text-white drop-shadow">3</span>
            </Link>
          </section>

          <section className="mt-2 overflow-hidden rounded-[12px] border border-[#ffd67e] bg-[#ffd18b]">
            <div className="flex h-8 items-center justify-between px-4">
              <p className="text-[15px] font-black">我的带货 <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px]">V3黄金达人</span></p>
              <span className="relative size-[17px] rounded-full border-2 border-[#111] before:absolute before:left-[5px] before:top-[5px] before:size-[3px] before:rounded-full before:bg-[#111]" />
            </div>
            <div className="grid grid-cols-2 rounded-[12px] bg-[#fff8e6] px-4 py-5">
              <div>
                <p className="text-[14px] leading-[18px]">累计佣金(元)</p>
                <p className="mt-2 text-[24px] font-black">¥383</p>
              </div>
              <div className="border-l border-[#f0c778] pl-8">
                <p className="text-[14px] leading-[18px]">累计带货金额(元)</p>
                <p className="mt-2 text-[24px] font-black">¥683</p>
              </div>
            </div>
          </section>

          <section className="mt-2 grid grid-cols-2 gap-2.5">
            <Link href="/promotion/benefits" className="flex h-[72px] min-w-0 items-center gap-2 rounded-[12px] bg-white px-3">
              <ReplicaIcon className="size-[clamp(36px,11vw,42px)] bg-[#fff0f5]">
                <span className="size-6 rounded-[5px] bg-[#ff5877]" />
              </ReplicaIcon>
              <div className="min-w-0">
                <p className="truncate text-[16px] font-black">奖励活动</p>
                <p className="mt-1 text-[12px] text-[#777]">3个进行中</p>
              </div>
            </Link>
            <Link href="/promotion/ranking" className="flex h-[72px] min-w-0 items-center gap-2 rounded-[12px] bg-white px-3">
              <ReplicaIcon className="size-[clamp(36px,11vw,42px)] bg-[#fff5dd]">
                <span className="size-6 rounded-full bg-[#ffc42d]" />
              </ReplicaIcon>
              <div className="min-w-0">
                <p className="truncate text-[16px] font-black text-[#a31111]">排行榜</p>
                <p className="truncate text-[12px] text-[#777]">看看谁是第一</p>
              </div>
            </Link>
          </section>

          <section className="mt-2 overflow-hidden rounded-[12px] bg-white">
            <div className="grid grid-cols-3 divide-x divide-y divide-[#f0f0f0]">
              {[
                ["今日店铺访问", "+45"],
                ["今日带货订单", "+27"],
                ["今日带货收益", "¥83"],
                ["累计店铺访问", "3678"],
                ["累计带货订单", "893"],
                ["累计店铺收藏", "5683"]
              ].map(([label, value]) => (
                <div key={label} className="flex h-[80px] flex-col items-center justify-center">
                  <p className="text-[13px] text-[#333]">{label}</p>
                  <p className="mt-2 text-[18px] font-black">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-3 rounded-[12px] bg-white px-4 pb-4 pt-3">
            <h2 className="text-[18px] font-black">推广工具</h2>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {tools.map((tool) => (
                <Link key={tool.label} href={tool.href} className="flex flex-col items-center">
                  <ReplicaIcon className={`size-[34px] ${tool.color}`} />
                  <span className="mt-2 whitespace-nowrap text-[12px] text-[#333]">{tool.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </ReplicaShell>
  );
}
