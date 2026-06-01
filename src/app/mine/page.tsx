import Link from "next/link";
import { ReplicaIcon, ReplicaShell } from "@/components/commerce/ReplicaShell";

const orders = [
  ["待付款", "border-[#111]"],
  ["待发货", "border-[#61b967]"],
  ["待收货", "border-[#111]"],
  ["已完成", "border-[#73bf48]"],
  ["退货退款", "border-[#71c64f]"]
];

const tools = [
  ["我的足迹", "bg-[#8dde55]"],
  ["我的收藏", "bg-[#8bb8ff]"],
  ["地址管理", "bg-[#ff922e]"],
  ["设置", "bg-[#65c9f2]"],
  ["客服服务", "bg-[#ff8fb1]"],
  ["帮助中心", "bg-[#73d43d]"],
  ["消息中心", "bg-[#74d43d]"],
  ["商品服务", "bg-[#74d43d]"]
];

export default function MinePage() {
  return (
    <ReplicaShell className="bg-[#f4f5f6]">
      <div className="relative min-h-screen overflow-hidden bg-[#f4f5f6] pb-8">
        <div className="absolute inset-x-0 top-0 h-[228px] bg-[linear-gradient(135deg,#bbffe5_0%,#d8ffd6_58%,#f2ffd8_100%)]" />
        <div className="relative px-3 pt-[67px]">
          <section className="relative flex items-center">
            <div className="relative z-10 size-[56px] shrink-0 overflow-hidden rounded-full bg-[#f2dbc7] ring-4 ring-white">
              <div className="mx-auto mt-2 size-[37px] rounded-full bg-[#111]" />
              <div className="mx-auto h-8 w-11 rounded-t-full bg-white" />
            </div>
            <div className="relative z-10 ml-3 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[19px] font-black leading-[24px]">深圳喵小猫</h1>
                <span className="shrink-0 rounded-full bg-[#ffd893] px-2 py-0.5 text-[11px] font-bold text-[#9a4b00]">V3黄金达人</span>
              </div>
              <p className="mt-2 text-[13px] text-[#4f4f4f]">150****7196</p>
            </div>
            <Link href="/messages" className="relative z-10 ml-auto mr-1 flex size-8 shrink-0 items-center justify-center">
              <span className="h-[18px] w-[17px] rounded-t-full border-2 border-[#111] border-b-0" />
              <span className="absolute bottom-[5px] h-0.5 w-[20px] rounded-full bg-[#111]" />
              <span className="absolute -right-1 top-0 rounded-full bg-[#ff3f62] px-1 text-[9px] font-bold leading-[12px] text-white">22</span>
            </Link>
            <div className="pointer-events-none absolute right-[clamp(28px,12vw,48px)] top-8 z-0 size-[clamp(64px,22vw,86px)] rounded-full bg-[radial-gradient(circle,#56e75a_0_34%,#b3fb52_35%_100%)] shadow-[0_10px_20px_rgba(70,215,84,0.2)]" />
          </section>

          <section className="relative mt-12 overflow-hidden rounded-[12px] bg-white">
            <div className="flex h-[42px] items-center justify-between gap-2 bg-[linear-gradient(110deg,#54f48b,#b9ff89)] px-4 py-2 text-[14px] font-bold max-[340px]:px-3 max-[340px]:text-[12px]">
              <span className="truncate">喵呜达人有效期至2027-06-25</span>
              <Link href="/member" className="shrink-0 rounded-full bg-[#323232] px-3 py-1 text-[12px] text-white">
                权益中心›
              </Link>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#edf0f0] py-4 text-center">
              {[
                ["钱包余额", "¥678"],
                ["今年已省", "¥2383"],
                ["优惠券", "8"]
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[14px] text-[#555]">{label}</p>
                  <p className="mt-2 text-[18px] font-black">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-3 rounded-[12px] bg-white px-4 pb-4 pt-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-black">我的订单</h2>
              <Link href="/orders" className="text-[13px]">
                全部订单 ›
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {orders.map(([label, border]) => (
                <Link key={label} href="/orders" className="flex flex-col items-center">
                  <span className={`relative h-[24px] w-[22px] rounded-[3px] border-2 ${border}`}>
                    <span className="absolute left-1 top-1 h-1 w-3 rounded-full bg-current opacity-40" />
                  </span>
                  <span className="mt-2 whitespace-nowrap text-[12px] text-[#333]">{label}</span>
                </Link>
              ))}
            </div>
          </section>

          <Link href="/" className="mt-3 block h-[72px] overflow-hidden rounded-[9px] bg-[linear-gradient(110deg,#dfff55,#fff36c_42%,#fff9bf_68%,#bcfb6c)]">
            <div className="relative h-full">
              <p className="absolute left-[clamp(28px,12vw,48px)] top-2 rotate-[-5deg] text-[24px] font-black leading-[22px]">续航<br />一套D计划</p>
              <div className="absolute right-10 top-2 size-[clamp(40px,13vw,48px)] rounded-[16px] bg-[#4ca9ff]" />
              <div className="absolute bottom-2 right-5 size-6 rounded-full bg-[#ffb335]" />
            </div>
          </Link>

          <section className="mt-3 rounded-[12px] bg-white px-4 pb-5 pt-3">
            <h2 className="text-[18px] font-black">服务与工具</h2>
            <div className="mt-4 grid grid-cols-4 gap-y-4">
              {tools.map(([label, color]) => (
                <Link key={label} href={label === "我的收藏" ? "/favorites/products" : label === "消息中心" ? "/messages" : "/mine"} className="flex flex-col items-center">
                  <ReplicaIcon className={`size-[34px] ${color}`} />
                  <span className="mt-2 whitespace-nowrap text-[12px] text-[#333]">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </ReplicaShell>
  );
}
