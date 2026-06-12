import type { ApiErrorCode } from "@/lib/api/types";

export const javaResponseCodes = {
  "00000": {
    name: "OK",
    message: "ok"
  },
  A00001: {
    name: "SHOW_FAIL",
    message: "用于直接显示提示用户的错误，内容由输入内容决定"
  },
  A00002: {
    name: "SHOW_SUCCESS",
    message: "用于直接显示提示系统的成功，内容由输入内容决定"
  },
  A00004: {
    name: "UNAUTHORIZED",
    message: "Unauthorized"
  },
  A00005: {
    name: "EXCEPTION",
    message: "服务器出了点小差"
  },
  A00007: {
    name: "DATA_ERROR",
    message: "数据异常，请刷新后重新操作"
  },
  A00012: {
    name: "TEMP_UID_ERROR",
    message: "TempUid Error"
  },
  A00013: {
    name: "NOT_FOUND",
    message: "接口不存在"
  },
  A00014: {
    name: "METHOD_ARGUMENT_NOT_VALID",
    message: "方法参数没有校验"
  },
  A00103: {
    name: "SHOW_DUPLICATE_USERS_FAIL",
    message: "用户重复用户的错误，内容由输入内容决定"
  },
  A03001: {
    name: "ORDER_DELIVERY_NOT_SUPPORTED",
    message: "The delivery method is not supported"
  },
  A03002: {
    name: "REPEAT_ORDER",
    message: "订单已过期，请重新下单"
  },
  A03003: {
    name: "COUPON_CANNOT_USE_TOGETHER",
    message: "优惠券不能共用"
  },
  A03010: {
    name: "NOT_STOCK",
    message: "not stock"
  },
  A04002: {
    name: "SOCIAL_ACCOUNT_BIND_BY_OTHER",
    message: "social account bind by other"
  },
  A07001: {
    name: "DELIVERY_OVER",
    message: "用户收货地址超过配送范围"
  },
  A10100: {
    name: "REVOKED_SHOP_USERS_FAIL",
    message: "注销商家账号失败，内容由输入内容决定"
  },
  A10101: {
    name: "REVOKED_DISTRIBUTION_USERS_FAIL",
    message: "注销分销员账号失败，内容由输入内容决定"
  },
  A10102: {
    name: "REVOKED_COUNT_FAIL",
    message: "超过注销账号次数，内容由输入内容决定"
  },
  "66666": {
    name: "PROCESSING",
    message: "处理中"
  },
  "66667": {
    name: "ACCEPTED",
    message: "已受理"
  }
} as const;

export type JavaResponseCode = keyof typeof javaResponseCodes;

export function getJavaResponseCodeMeta(code: string | undefined) {
  if (code === undefined) {
    return undefined;
  }

  return javaResponseCodes[code as JavaResponseCode];
}

export function mapJavaBusinessCodeToApiErrorCode(code: string | undefined): ApiErrorCode {
  if (code === "A00004") {
    return "AUTH_FAILED";
  }

  return "HTTP_ERROR";
}
