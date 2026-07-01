import type { IconFontRawClass } from "./iconfont.generated";

export const iconFontAliases = {
  favorite: "shoucang",
  basicInfoEdit: "jibenxinxibianji",
  voiceEdit: "shengyinbianji",
  avatarEdit: "xingxiangbianji",
  loading: "loading",
  switch: "qiehuan",
  preview: "yulan",
  upload: "shangchuanicon",
  share: "fenxiang",
  radioChecked: "danxuan-yixuan",
  radioUnchecked: "danxuan-weixuan",
  edit: "bianji",
  play: "bofang",
  left: "zuo",
  right: "you",
  password: "mima",
  radio: "danxuan",
  radioSelected: "danxuan-xuanzhong",
  hideVisible: "guanbixianshi",
  verificationCode: "yanzhengma",
  phone: "shoujihao",
  clear: "qingchu",
  frame: "Frame"
} as const satisfies Record<string, IconFontRawClass>;

export type IconFontAliasName = keyof typeof iconFontAliases;
